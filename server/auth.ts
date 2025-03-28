import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { log } from "./vite";
import createMemoryStore from "memorystore";
import { supabase } from "./supabase";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const MemoryStore = createMemoryStore(session);

export function setupAuth(app: Express) {
  // Determine if we should use the database session store or fallback to memory store
  const useDbSessionStore = process.env.SUPABASE_URL && process.env.SUPABASE_KEY && storage.sessionStore;
  
  // Set up session middleware
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "forumAI-session-secret",
    resave: false,
    saveUninitialized: false,
    store: useDbSessionStore ? storage.sessionStore : new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production"
    }
  };
  
  log(`Using ${useDbSessionStore ? 'database' : 'memory'} session store`);
  
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Use Supabase for authentication, but still adapt to Passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // First check if the user exists in our database
        const dbUser = await storage.getUserByUsername(username);
        if (!dbUser) {
          return done(null, false, { message: 'User not found' });
        }
        
        // Try to authenticate with Supabase using email/password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: dbUser.email, // Use email from database
          password: password, // Plain text password will be verified by Supabase
        });
        
        if (error) {
          log(`Supabase authentication error: ${error.message}`);
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        // If supabase auth succeeded, return the user
        return done(null, dbUser);
      } catch (error) {
        log(`Authentication error: ${error.message}`);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      log(`Deserialization error: ${error.message}`);
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if Supabase is available
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        return res.status(503).json({ 
          error: "Registration is unavailable - Supabase connection not configured" 
        });
      }
      
      const { username, email, password, displayName } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName
          }
        }
      });
      
      if (authError) {
        log(`Supabase registration error: ${authError.message}`);
        return res.status(400).json({ error: authError.message });
      }
      
      // Create user in our database
      const user = await storage.createUser({
        username,
        email,
        password: 'supabase_auth', // Placeholder - actual auth handled by Supabase
        displayName,
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      log(`Registration error: ${error.message}`);
      res.status(500).json({ error: "Registration failed due to a server error" });
    }
  });

  app.post("/api/login", async (req, res, next) => {
    // Check if Supabase is available
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.status(503).json({ 
        error: "Login is unavailable - Supabase connection not configured" 
      });
    }
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    if (req.isAuthenticated()) {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        log(`Supabase sign out error: ${error.message}`);
      }
      
      // Also terminate session
      req.logout((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(200); // Still return success even if not logged in
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    res.json(req.user);
  });
  
  // Supabase auth endpoints
  app.post("/api/auth/reset-password", async (req, res) => {
    const { email } = req.body;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json({ message: "Password reset email sent" });
  });
  
  app.post("/api/auth/update-password", async (req, res) => {
    const { password } = req.body;
    
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json({ message: "Password updated successfully" });
  });
}
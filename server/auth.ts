import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { log } from "./vite";
import { checkDatabaseConnection } from "./database";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Determine if we should use the database session store or fallback to memory store
  const useDbSessionStore = process.env.DATABASE_URL && storage.sessionStore;
  
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

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
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
      // Check if database is available
      if (!process.env.DATABASE_URL) {
        return res.status(503).json({ 
          error: "Registration is unavailable - database connection not configured" 
        });
      }
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      log(`Registration error: ${error.message}`);
      res.status(500).json({ error: "Registration failed due to a server error" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ 
        error: "Login is unavailable - database connection not configured" 
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

  app.post("/api/logout", (req, res, next) => {
    if (req.isAuthenticated()) {
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
}
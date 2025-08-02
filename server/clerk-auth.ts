import { Request, Response, NextFunction, Express } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';
import { IStorage } from './storage';

// Initialize Clerk SDK
const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Middleware to verify Clerk user authentication
 */
export const requireClerkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for token in headers or cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.['__session'];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Verify the token with Clerk
      const sessionClaims = await clerkClient.verifyToken(token);
      const userId = sessionClaims.sub;

      if (!userId) {
        return res.status(401).json({ error: 'Invalid authentication token' });
      }

      // Set the userId in the request
      req.auth = { userId };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication service unavailable' });
  }
};

// Add auth type to Express Request
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
      };
    }
  }
}

/**
 * Helper function to get user ID from Clerk authentication
 */
export async function getClerkUserId(req: Request): Promise<string | null> {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.['__session'];
    if (!token) return null;
    
    const sessionClaims = await clerkClient.verifyToken(token);
    return sessionClaims.sub || null;
  } catch (error) {
    return null;
  }
}

/**
 * Helper function to get database user from Clerk authentication
 */
export async function getClerkUser(req: Request, storage: IStorage): Promise<any | null> {
  try {
    const clerkUserId = await getClerkUserId(req);
    if (!clerkUserId) return null;
    
    return await storage.getUserByClerkId(clerkUserId);
  } catch (error) {
    return null;
  }
}

/**
 * Register Clerk auth routes
 */
export function registerClerkAuthRoutes(app: Express, storage: IStorage) {
  // Get current user
  app.get('/api/user/current', requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      
      if (!clerkUserId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Get user from our database
      const user = await storage.getUserByClerkId(clerkUserId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't send password hash to client
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  // Get user by Clerk ID
  app.get('/api/user/:clerkUserId', async (req, res) => {
    try {
      const { clerkUserId } = req.params;
      
      // Get user from our database
      const user = await storage.getUserByClerkId(clerkUserId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't send password hash to client
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  // Create a new user based on Clerk user data
  app.post('/api/user', async (req, res) => {
    try {
      const { clerkUserId, username, email, name, avatar } = req.body;
      
      if (!clerkUserId) {
        return res.status(400).json({ error: 'Clerk user ID is required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByClerkId(clerkUserId);
      
      if (existingUser) {
        // User already exists, return the existing user
        const { password, ...userWithoutPassword } = existingUser;
        return res.json(userWithoutPassword);
      }
      
      // Create a new user in our database
      const newUser = await storage.createUser({
        username,
        email,
        name,
        avatar,
        clerkUserId,
        // Generate a random password since we'll use Clerk for authentication
        password: Math.random().toString(36).slice(-10),
      });
      
      // Don't send password hash to client
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
}
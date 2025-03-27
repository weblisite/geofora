import * as schema from '@shared/schema';
import { db } from './db';
import { log } from './vite';
import { sql } from 'drizzle-orm';
import { forums } from '@shared/schema';

// Re-export the db instance
export { db };

/**
 * Check if the database connection is working
 * @returns true if connection is successful, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!db) {
      log('Database connection check: failed - db is not initialized');
      return false;
    }
    
    // Check the connection with a simple query that doesn't rely on tables existing
    const result = await db.execute(sql`SELECT 1 as check_connection`);
    
    log('Database connection check: success');
    return true;
  } catch (error: any) {
    log(`Database connection error: ${error.message}`);
    return false;
  }
}

/**
 * Initialize the database (create tables if needed)
 * This directly executes SQL statements to create tables if they don't exist
 */
export async function initDatabase(): Promise<void> {
  try {
    if (!db) {
      log('Database initialization skipped - db is not initialized');
      return;
    }
    
    log('Initializing database schema...');
    
    // Check if the sessions table exists (required for connect-pg-simple)
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "session" (
          "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL
        )
      `);
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
      `);
      
      log('Sessions table initialized');
    } catch (error: any) {
      log(`Error creating sessions table: ${error.message}`);
    }
    
    // Instead of using the drizzle-kit push command, we'll return early and let the ORM handle the tables
    // This is a simpler approach for development and avoids issues with child processes
    
    // Create a default forum if none exists - only attempt if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      try {
        const defaultForum = await db.select().from(forums).limit(1);
        if (!defaultForum.length) {
          await db.insert(forums).values({
            name: 'Default Forum',
            slug: 'default',
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          log('Default forum created');
        }
      } catch (error: any) {
        log(`Error creating default forum: ${error.message}`);
      }
    }
    
    log('Database initialized - tables will be managed by Drizzle ORM');
    return;
  } catch (error: any) {
    log(`Database initialization error: ${error.message}`);
    // Don't throw the error - we'll continue and let the application try to work anyway
    log('Continuing despite database initialization error');
  }
}
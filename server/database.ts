import * as schema from '@shared/schema';
import { db } from './db';
import { log } from './vite';
import { sql } from 'drizzle-orm';

// Re-export the db instance
export { db };

/**
 * Check if the database connection is working
 * @returns true if connection is successful, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
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
 * This uses drizzle-kit's push command to push schema changes to the database
 */
export async function initDatabase(): Promise<void> {
  try {
    // Note: In a production environment, you would use migrations instead
    // of pushing schema changes directly. This is a simpler approach for development.
    
    // Use child_process to execute the npm run db:push command
    const { exec } = await import('child_process');
    const util = await import('util');
    const execPromise = util.promisify(exec);
    
    log('Pushing database schema...');
    await execPromise('npm run db:push');
    
    log('Database initialized');
  } catch (error: any) {
    log(`Database initialization error: ${error.message}`);
    throw error;
  }
}
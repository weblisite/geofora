import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from './vite';

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is available, log warning instead of throwing error
if (!process.env.DATABASE_URL) {
  log("WARNING: DATABASE_URL is not set. Database functionality will be limited.");
}

// Create a database connection only if DATABASE_URL is available
let pool;
let db;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    log("Database connection initialized");
  } else {
    log("Database connection skipped - DATABASE_URL not available");
  }
} catch (error) {
  log(`Error initializing database connection: ${error.message}`);
}

export { pool, db };

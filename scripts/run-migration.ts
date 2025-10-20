#!/usr/bin/env tsx

/**
 * Run PRD Migration Script
 * Executes the database migration to create new PRD tables
 */

import * as dotenv from 'dotenv';
import { runPRDMigration } from './prd-migration';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting PRD Database Migration...');
  
  try {
    await runPRDMigration();
    console.log('✅ PRD migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

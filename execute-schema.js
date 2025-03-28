/**
 * Execute Supabase Schema Script
 * 
 * This script will run the SQL schema creation script on your Supabase database.
 * It uses the Supabase client to execute the SQL commands.
 * 
 * Usage: node execute-schema.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function executeStatements() {
  try {
    console.log('Reading schema SQL file...');
    
    // Read SQL from file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const sqlPath = path.join(__dirname, 'supabase-schema.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements (this is a simple approach and might not work for all SQL)
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim() + ';';
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        // Execute statement using exec_sql function if it exists
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            query_text: stmt
          });
          
          if (error) {
            // Some statements may cause errors if they're trying to create things that already exist
            // We'll log these but continue with the setup
            if (error.message.includes('already exists')) {
              console.log(`  Warning: ${error.message}`);
            } else {
              console.error(`  Error executing statement: ${error.message}`);
              console.error(`  Statement: ${stmt.substring(0, 100)}...`);
            }
          } else {
            console.log(`  Statement executed successfully`);
          }
        } catch (rpcError) {
          // If the exec_sql function doesn't exist yet, this is expected
          console.error(`  Error calling exec_sql RPC: ${rpcError.message}`);
          console.error('  If this is your first run, please first create the exec_sql function using the setup-supabase.js script');
          process.exit(1);
        }
      } catch (stmtError) {
        console.error(`  Error executing statement: ${stmtError.message}`);
        console.error(`  Statement: ${stmt.substring(0, 100)}...`);
      }
    }
    
    console.log('Schema execution completed');
    return true;
  } catch (error) {
    console.error('Error executing schema:', error);
    return false;
  }
}

// Run the execution
executeStatements();
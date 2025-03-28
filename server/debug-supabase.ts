import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

/**
 * This script is used to debug Supabase connection issues
 * It attempts to connect to Supabase and validate the credentials
 */

function debugSupabaseConnection() {
  log("=== Supabase Connection Debugging ===");
  
  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
  const supabaseKey = process.env.SUPABASE_KEY?.trim() || '';
  
  log(`SUPABASE_URL exists: ${!!supabaseUrl}`);
  log(`SUPABASE_KEY exists: ${!!supabaseKey}`);
  
  if (!supabaseUrl || !supabaseKey) {
    log("ERROR: Missing Supabase credentials. Please check your environment variables.");
    return;
  }
  
  // Validate URL format
  if (!supabaseUrl.startsWith('https://')) {
    log(`ERROR: Invalid Supabase URL format. URL should start with 'https://'. Current URL: ${supabaseUrl.substring(0, 10)}...`);
    return;
  }
  
  // Extract and validate the project reference
  const urlParts = supabaseUrl.replace('https://', '').split('.');
  if (urlParts.length < 2) {
    log(`ERROR: Invalid Supabase URL structure. Cannot extract project reference.`);
    return;
  }
  
  const projectRef = urlParts[0];
  log(`Project reference extracted: ${projectRef}`);
  
  // Attempt to create a Supabase client
  try {
    log("Attempting to create Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });
    log("Supabase client created successfully.");
    
    // Attempt to make a simple query
    log("Attempting to make a simple query to test connection...");
    supabase.from('_test_connection')
      .select('*')
      .limit(1)
      .then((result) => {
        if (result.error) {
          // This is expected since the table likely doesn't exist
          // Check for the expected error (table doesn't exist)
          // PGRST116 or any error containing "does not exist" indicates a successful connection
          if (result.error.code === "PGRST116" || result.error.message.includes("does not exist")) {
            log("✅ CONNECTION SUCCESSFUL! The expected error about a non-existent table confirms that we can communicate with the Supabase database.");
          } else {
            log(`❌ Connection test failed with error: ${result.error.message}`);
          }
        } else {
          log("Connection successful!");
        }
      })
      .catch((error) => {
        log(`Connection test failed with unexpected error: ${error.message}`);
      });
    
    // For diagnostic purposes, construct the postgres connection string
    // that would be used by Drizzle
    log("For diagnostic purposes, the connection string structure would be:");
    log(`postgres://postgres:[KEY]@db.${projectRef}.supabase.co:5432/postgres`);
    
  } catch (error: any) {
    log(`Failed to create Supabase client: ${error.message}`);
    if (error.stack) {
      log(`Error stack: ${error.stack}`);
    }
  }
}

// Run the debug function
debugSupabaseConnection();
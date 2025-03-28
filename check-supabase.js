/**
 * Check Supabase Connection and Function Availability
 * 
 * This script tests connection to Supabase and verifies function existence.
 * It helps validate your environment setup before running the full setup.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Mask a string for output (show only first and last few characters)
 */
function maskString(str) {
  if (!str) return '<empty>';
  
  if (str.length <= 8) {
    return '********';
  }
  
  return `${str.substring(0, 3)}...${str.substring(str.length - 3)}`;
}

/**
 * Check Supabase Connection
 */
async function checkSupabase() {
  console.log('🔍 Checking Supabase Connection');
  console.log('==============================');
  
  // Get environment variables
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  
  // Mask values for safety in logs
  console.log(`Supabase URL: ${url ? maskString(url) : '<missing>'}`);
  console.log(`Supabase Key: ${key ? maskString(key) : '<missing>'}`);
  console.log('------------------------------');
  
  // Verify variables are set
  if (!url || !key) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_KEY environment variables');
    console.error('Please set these variables and try again.');
    process.exit(1);
  }
  
  try {
    // Create Supabase client
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    console.log('Testing basic connectivity...');
    
    // Try a simple query to test connectivity
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
    
    // Some errors are expected - like if the table doesn't exist,
    // but this still means the connection worked
    if (error && error.code !== 'PGRST116') {
      console.log('❌ Connection test failed:');
      console.log(`Error: ${error.message} (${error.code})`);
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Supabase!');
    
    // Test exec_sql function if it exists
    console.log('------------------------------');
    console.log('Testing exec_sql function...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        query_text: 'SELECT 1 as test'
      });
      
      if (error) {
        if (error.message.includes('function exec_sql') && 
            error.message.includes('does not exist')) {
          console.log('ℹ️ The exec_sql function does not exist yet.');
          console.log('Run the setup script to create it: node setup-supabase.js');
        } else {
          console.log(`❌ Error testing exec_sql function: ${error.message}`);
        }
      } else {
        console.log('✅ exec_sql function exists and works correctly!');
      }
    } catch (error) {
      console.log(`❌ Error testing exec_sql function: ${error.message}`);
    }
    
    console.log('==============================');
    console.log('🎉 Check completed!');
    
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the check function
checkSupabase().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
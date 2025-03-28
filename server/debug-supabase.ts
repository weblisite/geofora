/**
 * Supabase Debug Utility
 * 
 * This file contains functions to help debug Supabase connectivity and configuration issues.
 * It performs targeted tests to verify different aspects of the Supabase setup.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateEnv } from './debug-env';

/**
 * Mask a string for output (show only first and last few characters)
 * @param str The string to mask
 * @returns The masked string
 */
function maskString(str: string): string {
  if (!str) return '<empty>';
  
  if (str.length <= 8) {
    return '********';
  }
  
  // For longer strings, show first 3 and last 3 characters
  return `${str.substring(0, 3)}...${str.substring(str.length - 3)}`;
}

/**
 * Get a Supabase client for debugging purposes
 * This creates a new client instance separate from the main app client
 */
function getDebugClient(): SupabaseClient | null {
  // Check for required environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Missing Supabase environment variables. Cannot create debug client.');
    return null;
  }

  try {
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
    return client;
  } catch (error) {
    console.error('Error creating Supabase debug client:', error);
    return null;
  }
}

/**
 * Test basic Supabase connectivity
 * Attempts a simple query to verify the connection works
 */
async function testBasicConnectivity(): Promise<boolean> {
  const client = getDebugClient();
  if (!client) return false;

  try {
    console.log('Testing basic Supabase connectivity...');
    
    // Simple test query that should always work if connection is valid
    const { data, error } = await client.from('_prisma_migrations').select('*').limit(1);
    
    // Some errors are expected - like if the table doesn't exist,
    // but this still means the connection worked
    if (error && error.code !== 'PGRST116') {
      console.log('Connectivity test result: FAILED');
      console.log(`Error: ${error.message} (${error.code})`);
      return false;
    }
    
    console.log('Connectivity test result: SUCCESS');
    return true;
  } catch (error: any) {
    console.log('Connectivity test result: FAILED');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

/**
 * Test if the exec_sql function exists in the database
 * This function is needed for complex operations
 */
async function testExecSqlFunction(): Promise<boolean> {
  const client = getDebugClient();
  if (!client) return false;

  try {
    console.log('Testing exec_sql function availability...');
    
    // Call the exec_sql function with a simple query
    const { data, error } = await client.rpc('exec_sql', {
      query_text: 'SELECT 1 as test'
    });
    
    if (error) {
      console.log('exec_sql function test result: FAILED');
      console.log(`Error: ${error.message} (${error.code})`);
      
      // Handle specific error for missing function
      if (error.message.includes('function exec_sql') && error.message.includes('does not exist')) {
        console.log('The exec_sql function needs to be created. Run the setup script.');
      }
      
      return false;
    }
    
    console.log('exec_sql function test result: SUCCESS');
    return true;
  } catch (error: any) {
    console.log('exec_sql function test result: FAILED');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

/**
 * Run all diagnostic tests
 */
export async function runSupabaseDiagnostics(): Promise<void> {
  console.log('🔍 Starting Supabase Diagnostics');
  console.log('===============================');
  
  // Log connection details (safely)
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  
  console.log(`Supabase URL: ${url ? maskString(url) : 'NOT SET'}`);
  console.log(`Supabase Key: ${key ? maskString(key) : 'NOT SET'}`);
  console.log('-------------------------------');
  
  // Run connectivity test
  const hasConnectivity = await testBasicConnectivity();
  console.log('-------------------------------');
  
  // Only test exec_sql if basic connectivity works
  if (hasConnectivity) {
    await testExecSqlFunction();
    console.log('-------------------------------');
  }
  
  // Summary
  console.log('Diagnostics Summary:');
  console.log(`- Supabase Configuration: ${url && key ? '✅ VALID' : '❌ INCOMPLETE'}`);
  console.log(`- Connectivity: ${hasConnectivity ? '✅ WORKING' : '❌ FAILED'}`);
  console.log('===============================');
}

// Allow running directly from command line
if (require.main === module) {
  runSupabaseDiagnostics()
    .catch(err => {
      console.error('Error running diagnostics:', err);
    });
}
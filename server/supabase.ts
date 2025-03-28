/**
 * Supabase Client Configuration
 * 
 * This file sets up and exports a singleton Supabase client that can be used
 * throughout the application for consistent access to Supabase services.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateEnv } from './debug-env';

// Required environment variables for Supabase
const REQUIRED_ENV_VARS = ['SUPABASE_URL', 'SUPABASE_KEY'];

/**
 * Initialize the Supabase client
 * @returns A configured Supabase client instance or null if configuration failed
 */
function initSupabaseClient(): SupabaseClient | null {
  // Validate required environment variables
  if (!validateEnv(REQUIRED_ENV_VARS)) {
    console.error('Cannot initialize Supabase client due to missing environment variables.');
    return null;
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_KEY!;
  
  try {
    // Create and return a Supabase client
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Don't persist auth session in the server environment
        autoRefreshToken: true,
        detectSessionInUrl: false, // For server, we don't need to detect session from URL
      },
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

// Initialize client once at module load time
const supabaseClient = initSupabaseClient();

/**
 * Get the Supabase client instance
 * @returns The initialized Supabase client
 * @throws Error if the client is not initialized
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }
  return supabaseClient;
}

/**
 * Check if the Supabase client is initialized
 * @returns True if the client is available, false otherwise
 */
export function isSupabaseAvailable(): boolean {
  return supabaseClient !== null;
}

// Export the client directly
export const supabase = supabaseClient;

// Default export for ease of use
export default supabaseClient;
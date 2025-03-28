import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

// Check if Supabase credentials are available
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  log("WARNING: Supabase credentials are not set. Supabase functionality will be limited.");
}

// Create a Supabase client with the credentials
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || '',
  {
    auth: {
      persistSession: false, // Don't persist the session in localStorage
    },
  }
);

log("Supabase client initialized");
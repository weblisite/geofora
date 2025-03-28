import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// Log client-side environment information (without showing actual key values)
if (import.meta.env.DEV) {
  console.log('Supabase client config:');
  console.log(`- URL available: ${supabaseUrl ? 'Yes' : 'No'}`);
  console.log(`- API key available: ${supabaseKey ? 'Yes' : 'No'}`);
  if (supabaseUrl) {
    console.log(`- URL format: ${supabaseUrl.startsWith('https://') ? 'Valid (starts with https://)' : 'Invalid (missing https://)'}`);
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
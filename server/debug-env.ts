// Helper to debug environment variables without exposing sensitive data
export function logSecretStructure() {
  if (process.env.SUPABASE_URL) {
    console.log(`SUPABASE_URL structure: ${process.env.SUPABASE_URL.substring(0, 8)}...${process.env.SUPABASE_URL.length} chars`);
  } else {
    console.log('SUPABASE_URL is not defined');
  }
  
  if (process.env.SUPABASE_KEY) {
    console.log(`SUPABASE_KEY structure: ${process.env.SUPABASE_KEY.substring(0, 3)}...${process.env.SUPABASE_KEY.length} chars`);
  } else {
    console.log('SUPABASE_KEY is not defined');
  }
}
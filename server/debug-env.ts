/**
 * Debug Environment Helper
 * 
 * Utility functions to safely debug environment variable issues without exposing sensitive data
 */

/**
 * Log environment variable structure without exposing actual values
 * This is useful for debugging environment issues in development
 */
export function logSecretStructure() {
  const envKeys = Object.keys(process.env);
  
  console.log('Environment Variables Structure:');
  console.log('----------------------------------------------');
  
  // Group variables for cleaner output
  const groupedVars: Record<string, string[]> = {
    'Database': envKeys.filter(k => k.includes('DB_') || k.includes('DATABASE')),
    'Supabase': envKeys.filter(k => k.includes('SUPABASE')),
    'Authentication': envKeys.filter(k => k.includes('AUTH') || k.includes('JWT') || k.includes('TOKEN')),
    'API Keys': envKeys.filter(k => k.includes('API') || k.includes('KEY')),
    'Other': []
  };
  
  // Catch variables that don't fit other categories
  groupedVars.Other = envKeys.filter(k => {
    return !Object.values(groupedVars).flat().includes(k);
  });
  
  // Print grouped variables with masked values
  for (const [category, keys] of Object.entries(groupedVars)) {
    if (keys.length === 0) continue;
    
    console.log(`\n${category}:`);
    for (const key of keys.sort()) {
      const value = process.env[key];
      const maskedValue = value ? maskString(value) : '<empty>';
      console.log(`  ${key}: ${maskedValue}`);
    }
  }
  
  console.log('----------------------------------------------');
}

/**
 * Check if required environment variables are set
 * @param requiredVars List of required environment variable names
 * @returns Array of missing variables (empty if all are present)
 */
export function checkRequiredEnvVars(requiredVars: string[]): string[] {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  return missing;
}

/**
 * Print a formatted message about missing environment variables
 * @param missingVars List of missing environment variable names
 */
export function printMissingEnvVarsMessage(missingVars: string[]) {
  if (missingVars.length === 0) return;
  
  console.error('❌ Missing required environment variables:');
  for (const varName of missingVars) {
    console.error(`   - ${varName}`);
  }
  console.error('\nPlease set these variables in your environment or .env file.');
}

/**
 * Check and report on required environment variables
 * @param requiredVars List of required environment variable names
 * @returns true if all required variables are present, false otherwise
 */
export function validateEnv(requiredVars: string[]): boolean {
  const missing = checkRequiredEnvVars(requiredVars);
  
  if (missing.length > 0) {
    printMissingEnvVarsMessage(missing);
    return false;
  }
  
  return true;
}

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
/**
 * Environment variables utility
 * 
 * This module provides a standardized way to access environment variables across the application,
 * handling different prefixes and providing proper fallbacks.
 */

/**
 * Get an environment variable, supporting both VITE_ and NEXT_PUBLIC_ prefixes
 * 
 * @param name The base name of the environment variable (without prefix)
 * @returns The value of the environment variable, or undefined if not set
 */
export function getEnv(name: string): string | undefined {
  const viteKey = `VITE_${name}`;
  const nextPublicKey = `NEXT_PUBLIC_${name}`;
  
  // Try to get from import.meta.env
  const viteEnv = (import.meta.env as Record<string, any>)[viteKey];
  const nextPublicEnv = (import.meta.env as Record<string, any>)[nextPublicKey];
  
  return viteEnv || nextPublicEnv;
}

// Common environment variables used in the application
export const ENV = {
  CLERK_PUBLISHABLE_KEY: getEnv('CLERK_PUBLISHABLE_KEY'),
}
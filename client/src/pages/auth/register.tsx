import { Redirect, Link } from "wouter";
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { SITE_NAME } from "@/lib/constants";

// Redirect to the main authentication page which now handles Clerk authentication
export default function RegisterPage() {
  const { user, isLoading } = useClerkAuth();
  
  // Redirect to dashboard if already logged in
  if (!isLoading && user) {
    return <Redirect to="/dashboard" />;
  }
  
  // Redirect to the auth page where Clerk handles registration
  return <Redirect to="/auth?tab=register" />;
}
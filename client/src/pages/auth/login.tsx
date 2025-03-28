import { Redirect, Link } from "wouter";
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { SITE_NAME } from "@/lib/constants";

// Redirect to the main authentication page which now handles Clerk authentication
export default function LoginPage() {
  const { user, isLoading } = useClerkAuth();
  
  // Redirect to dashboard if already logged in
  if (!isLoading && user) {
    return <Redirect to="/dashboard" />;
  }
  
  // Redirect to the auth page where Clerk handles login
  return <Redirect to="/auth" />;
}
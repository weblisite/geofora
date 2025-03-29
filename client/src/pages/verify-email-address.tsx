import { useEffect } from "react";
import { useLocation } from "wouter";

// This component is a legacy verification page that is no longer needed with Clerk auth
// We're now redirecting users to Clerk's built-in verification flow
export default function VerifyEmailPage() {
  const [, navigate] = useLocation();
  
  // Redirect to dashboard immediately to avoid showing this page
  useEffect(() => {
    // Redirect to the sign-in page instead of showing this obsolete verification page
    console.log("Legacy verification page accessed - redirecting to sign-in");
    navigate("/sign-in");
  }, [navigate]);

  // Return null to avoid flashing content before the redirect
  return null;
}
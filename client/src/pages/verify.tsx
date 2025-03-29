import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function VerifyPage() {
  const clerk = useClerk();
  const { handleRedirectCallback } = clerk;
  const [, navigate] = useLocation();

  useEffect(() => {
    // Process the redirect callback from Clerk
    const handleCallback = async () => {
      try {
        // This will handle the redirect and update the session
        await handleRedirectCallback();
        
        // If we get here, the redirect was successful, check if we're authenticated
        if (clerk.user) {
          navigate("/dashboard");
        } else {
          navigate("/sign-in");
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
        navigate("/sign-in");
      }
    };

    handleCallback();
  }, [handleRedirectCallback, navigate, clerk.user]);

  // Show loading while the redirect is being processed
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-foreground">Verifying your account...</p>
    </div>
  );
}
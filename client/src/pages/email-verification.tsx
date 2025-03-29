import { useEffect, useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailVerificationPage() {
  const clerk = useClerk();
  const [, navigate] = useLocation();
  const [verificationState, setVerificationState] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Process URL parameters to determine if this is a verification callback
    const url = new URL(window.location.href);
    const hasVerificationParams = url.searchParams.has("__clerk_status") || 
                                 url.searchParams.has("token") || 
                                 url.searchParams.has("verification_token");
    
    if (hasVerificationParams) {
      console.log("Email verification parameters detected, processing with Clerk");
      
      // Let Clerk handle its process
      const handleVerification = async () => {
        try {
          // Attempt to handle the redirect
          const result = await clerk.handleRedirectCallback({
            redirectUrl: window.location.href,
          });
          
          console.log("Clerk verification result:", result);
          setVerificationState("success");
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } catch (error) {
          console.error("Verification error:", error);
          setVerificationState("error");
          setErrorMessage("There was a problem verifying your email. Please try again or contact support.");
        }
      };
      
      handleVerification();
    } else {
      // If no verification parameters, this might be a direct visit
      console.log("No verification parameters found, might be direct visit");
      // After a timeout, redirect to login if still on this page
      const timeout = setTimeout(() => {
        navigate("/sign-in");
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [clerk, navigate]);

  if (verificationState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px] max-w-[90vw]">
          <CardHeader>
            <CardTitle>Verifying Your Email</CardTitle>
            <CardDescription>Please wait while we verify your email address...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (verificationState === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px] max-w-[90vw]">
          <CardHeader>
            <CardTitle>Email Verified!</CardTitle>
            <CardDescription>Your email has been successfully verified.</CardDescription>
          </CardHeader>
          <CardContent className="py-4 text-center">
            <p>Redirecting you to your dashboard...</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px] max-w-[90vw]">
        <CardHeader>
          <CardTitle>Verification Error</CardTitle>
          <CardDescription>We encountered a problem while verifying your email.</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <p className="text-destructive">{errorMessage}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/sign-in")}>Back to Sign In</Button>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
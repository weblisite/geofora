import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useClerk } from "@clerk/clerk-react";

export default function VerifyEmailPage() {
  const clerk = useClerk();
  const isSignedIn = clerk.user !== null;
  const [, navigate] = useLocation();
  
  // If the user is already signed in, redirect to dashboard
  if (isSignedIn) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card className="border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-card-foreground">Verify your email</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please check your email and follow the verification link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-card-foreground space-y-4">
              <p>
                We've sent a verification link to your email address. Please check your inbox and click the link to complete your registration.
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, check your spam folder.
              </p>
              <button 
                onClick={() => navigate("/sign-in")}
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white py-2 rounded-md"
              >
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
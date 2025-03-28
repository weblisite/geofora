import { Redirect } from "wouter";
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  const { user, isLoading } = useClerkAuth();
  
  // Redirect to dashboard if already logged in
  if (!isLoading && user) {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-100 py-10">
      <div className="container mx-auto px-4">
        <Card className="mx-auto max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Fill in your details to get started with ForumAI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white",
                  footerActionLink: "text-primary-500 hover:text-primary-400",
                  card: "bg-transparent shadow-none",
                }
              }}
              routing="path" 
              path="/sign-up" 
              signInUrl="/sign-in"
              redirectUrl="/dashboard" 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Redirect } from "wouter";
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { SignIn } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
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
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white",
                  footerActionLink: "text-primary-500 hover:text-primary-400",
                  card: "bg-transparent shadow-none",
                  formFieldInput: "bg-card border-muted text-card-foreground",
                  formFieldLabel: "text-card-foreground",
                  headerTitle: "text-card-foreground",
                  headerSubtitle: "text-card-foreground/70",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  identityPreviewText: "text-card-foreground",
                  identityPreviewEditButtonIcon: "text-primary",
                  formFieldAction: "text-primary",
                  footerActionText: "text-muted-foreground",
                  socialButtonsBlockButton: "border-muted hover:bg-secondary hover:text-secondary-foreground",
                  socialButtonsBlockButtonText: "text-card-foreground"
                }
              }}
              routing="path" 
              path="/sign-in" 
              signUpUrl="/sign-up"
              redirectUrl="/dashboard" 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
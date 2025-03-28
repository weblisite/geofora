import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { Redirect } from "wouter";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const [location] = useLocation();
  const { user: clerkUser, isLoading: clerkLoading } = useClerkAuth();
  const [page, setPage] = useState<"login" | "register">("login");
  
  // Determine which form to show based on the URL path
  useEffect(() => {
    if (location === "/login") {
      setPage("login");
    } else if (location === "/register") {
      setPage("register");
    } else {
      // Default to login for /auth or any other path
      setPage("login"); 
    }
  }, [location]);

  // Redirect to home if already logged in with Clerk
  if (!clerkLoading && clerkUser) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {page === "login" ? "Sign in to your account" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-center">
            {page === "login" 
              ? "Enter your credentials to sign in" 
              : "Fill in the form to create your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {page === "login" ? (
            <SignIn routing="path" path="/login" redirectUrl="/" />
          ) : (
            <SignUp routing="path" path="/register" redirectUrl="/" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
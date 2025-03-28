import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { Redirect } from "wouter";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const [location] = useLocation();
  const { user: legacyUser, isLoading: legacyLoading } = useAuth();
  const { user: clerkUser, isLoading: clerkLoading } = useClerkAuth();
  const [page, setPage] = useState<"login" | "register">("login");
  const [authSystem, setAuthSystem] = useState<"legacy" | "clerk">("clerk");
  
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

  // Redirect to home if already logged in (with either auth system)
  const isAuthenticated = (!legacyLoading && legacyUser) || (!clerkLoading && clerkUser);
  if (isAuthenticated) {
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
          <Tabs 
            defaultValue="clerk" 
            value={authSystem}
            onValueChange={(value) => setAuthSystem(value as "legacy" | "clerk")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="clerk">Clerk Auth</TabsTrigger>
              <TabsTrigger value="legacy">Legacy Auth</TabsTrigger>
            </TabsList>
            
            <TabsContent value="clerk">
              {page === "login" ? (
                <SignIn routing="path" path="/auth" />
              ) : (
                <SignUp routing="path" path="/auth" />
              )}
            </TabsContent>
            
            <TabsContent value="legacy">
              {page === "login" ? <LoginPage /> : <RegisterPage />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
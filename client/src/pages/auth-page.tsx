import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-text";
import { Separator } from "@/components/ui/separator";
import { SITE_NAME } from "@/lib/constants";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Redirect to home if already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="animated-gradient-bg fixed inset-0 z-[-1]" />
      
      <div className="flex-1 container grid md:grid-cols-2 gap-6 items-center py-12">
        {/* Auth Forms */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <GradientText className="text-4xl font-bold tracking-tighter">
              Welcome to {SITE_NAME}
            </GradientText>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one to access all features
            </p>
          </div>
          
          <Glassmorphism className="p-1 rounded-lg">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoginForm />
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("register")}>
                        Register
                      </Button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Join our community to ask questions and get answers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegisterForm />
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("login")}>
                        Sign In
                      </Button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </Glassmorphism>
        </div>
        
        {/* Hero Section */}
        <div className="hidden md:flex flex-col space-y-6 p-6">
          <Glassmorphism className="p-6 rounded-lg space-y-6">
            <div>
              <GradientText className="text-3xl font-bold mb-2">
                AI-Powered Q&A Forums
              </GradientText>
              <p className="text-lg text-foreground/80">
                Join our community of SEO experts and content creators to maximize your traffic potential
              </p>
            </div>
            
            <Separator />
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <path d="m3.29 7 8.83 5.12a2 2 0 0 0 2.12 0L23 7"></path>
                    <path d="M12 22V12"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">AI Knowledge Levels</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate content with Beginner, Intermediate, Expert, or Moderator AI personas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">SEO Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced keyword analysis for high-ranking question generation
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"></path>
                    <path d="M12 13v8"></path>
                    <path d="M5 13v6a2 2 0 0 0 2 2h8"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Interlinking System</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent content connections to drive traffic between your forum and main site
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button asChild variant="secondary" className="mt-4">
                <Link href="/">
                  Learn More About Features
                </Link>
              </Button>
            </div>
          </Glassmorphism>
        </div>
      </div>
    </div>
  );
}
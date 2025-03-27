import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/constants";
import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  
  // Redirect to home if already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="animated-gradient-bg fixed inset-0 z-[-1]" />
      
      <div className="flex-1 container grid md:grid-cols-2 gap-6 items-center py-12">
        {/* Registration Form */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <GradientText className="text-4xl font-bold tracking-tighter">
              Join {SITE_NAME}
            </GradientText>
            <p className="text-muted-foreground">
              Create an account to start asking questions and get answers
            </p>
          </div>
          
          <Glassmorphism className="p-1 rounded-lg">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Join our community to access all features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegisterForm />
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </Glassmorphism>
        </div>
        
        {/* Hero Section */}
        <div className="hidden md:flex flex-col space-y-6 p-6">
          <Glassmorphism className="p-6 rounded-lg space-y-6">
            <div>
              <GradientText className="text-3xl font-bold mb-2">
                AI-Powered SEO Optimization
              </GradientText>
              <p className="text-lg text-foreground/80">
                Our AI-powered platform helps you generate traffic-driving content for maximum SEO impact
              </p>
            </div>
            
            <Separator />
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z"></path>
                    <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8Z"></path>
                    <path d="M19.5 5A2.5 2.5 0 0 1 22 7.5v12a2.5 2.5 0 0 1-5 0v-12A2.5 2.5 0 0 1 19.5 5Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Traffic Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your forum's performance with comprehensive analytics dashboard
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">AI Question Suggestions</h3>
                  <p className="text-sm text-muted-foreground">
                    Get AI-generated question ideas that are optimized for search engines
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Community Engagement</h3>
                  <p className="text-sm text-muted-foreground">
                    Build a knowledge base with engaged users and AI-assisted moderation
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button asChild variant="secondary" className="mt-4">
                <Link href="/">
                  See How It Works
                </Link>
              </Button>
            </div>
          </Glassmorphism>
        </div>
      </div>
    </div>
  );
}
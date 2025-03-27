import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/constants";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  
  // Redirect to home if already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="animated-gradient-bg fixed inset-0 z-[-1]" />
      
      <div className="flex-1 container grid md:grid-cols-2 gap-6 items-center py-12">
        {/* Login Form */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <GradientText className="text-4xl font-bold tracking-tighter">
              Welcome Back
            </GradientText>
            <p className="text-muted-foreground">
              Sign in to your {SITE_NAME} account to continue
            </p>
          </div>
          
          <Glassmorphism className="p-1 rounded-lg">
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
                  Don't have an account yet?{" "}
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/register">Create Account</Link>
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
                Boost Your Online Presence
              </GradientText>
              <p className="text-lg text-foreground/80">
                Our AI-powered platform helps you create SEO-optimized content that ranks higher in search results
              </p>
            </div>
            
            <Separator />
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Engaged Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Join a thriving community of professionals sharing knowledge
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Expert Content Creation</h3>
                  <p className="text-sm text-muted-foreground">
                    Leverage AI personas to create high-quality content at different expertise levels
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 rounded-full bg-primary/10 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Increased Traffic</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent interlinking and SEO optimization drives more organic traffic to your site
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button asChild variant="secondary" className="mt-4">
                <Link href="/">
                  Learn More
                </Link>
              </Button>
            </div>
          </Glassmorphism>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailAddressPage() {
  const clerk = useClerk();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get the email from Clerk's pending session if available
    if (clerk.client?.sessions) {
      const pendingEmail = clerk.client.sessions[0]?.user?.primaryEmailAddress?.emailAddress;
      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    }
  }, [clerk.client]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Verification code required",
        description: "Please enter the verification code sent to your email."
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Try to verify with the code using Clerk's verification methods
      // Check for pending verification state (may be different based on Clerk version)
      if (clerk.session && (clerk.session.status === 'unverified' || clerk.session.status === 'needs_verification')) {
        // Use the verification method on the current session
        const result = await clerk.verifyEmailAddress({ code: verificationCode });
        
        if (result) {
          setIsVerified(true);
          toast({
            title: "Email verified!",
            description: "Your email has been successfully verified.",
          });
          
          // Wait a moment to show success state before redirecting
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      } else {
        console.error("Session not in a verification state:", clerk.session?.status);
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "Your session is not in a verification state. Please try signing up again."
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "The code you entered is invalid or has expired. Please try again."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // Resend verification email through clerk's client
      // Use more resilient approach that doesn't rely on specific session statuses
      try {
        // First try using client method
        await clerk.client.resendEmailAddressVerification();
        toast({
          title: "Verification email resent",
          description: "We've sent a new verification code to your email."
        });
      } catch (e) {
        console.log("First resend method failed, trying alternative approach");
        
        // Fall back to session methods
        if (clerk.session) {
          await clerk.session.reload();
          const emailAddress = clerk.user?.primaryEmailAddress?.emailAddress;
          
          if (emailAddress) {
            await clerk.verifyEmailAddress({ strategy: 'email_code', email: emailAddress });
            toast({
              title: "Verification email resent",
              description: "We've sent a new verification code to your email."
            });
          } else {
            throw new Error("Could not determine email address for verification");
          }
        } else {
          throw new Error("No active session found");
        }
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast({
        variant: "destructive",
        title: "Failed to resend",
        description: "We couldn't resend the verification email. Please try again later or sign up again."
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification code to {email || "your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg font-medium">Email verified successfully!</p>
              <p className="text-muted-foreground text-center mt-2">
                Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input 
                    id="verification-code"
                    placeholder="Enter the code from your email"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isVerifying || isVerified}
                  />
                </div>
                <Button 
                  onClick={handleVerify} 
                  className="w-full" 
                  disabled={isVerifying || isVerified || !verificationCode.trim()}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : "Verify Email"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
        {!isVerified && (
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              Didn't receive the code?
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleResendCode} 
              disabled={isResending || isVerified}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : "Resend Code"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
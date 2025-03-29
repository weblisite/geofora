import { Loader2 } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

/**
 * This component creates a clean container for Clerk to handle email verification
 * with fallback UI in case Clerk doesn't render properly
 */
const EmailVerificationPage = () => {
  const { client } = useClerk();
  const [verificationState, setVerificationState] = useState<'loading' | 'clerk-rendering' | 'fallback'>('loading');
  
  useEffect(() => {
    // Give Clerk a moment to initialize and render
    const timer = setTimeout(() => {
      // If the clerk element isn't visible after a delay, show our fallback
      const clerkElement = document.querySelector('[data-clerk-frontend-framework]');
      if (!clerkElement) {
        console.log('No Clerk verification element found, showing fallback');
        setVerificationState('fallback');
      } else {
        console.log('Clerk verification element found, letting Clerk handle verification');
        setVerificationState('clerk-rendering');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [client]);

  // If we're still loading, show a spinner
  if (verificationState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading verification page...</p>
      </div>
    );
  }
  
  // If Clerk is handling the rendering, just provide an empty container
  if (verificationState === 'clerk-rendering') {
    return <div id="clerk-verification-container" className="w-full min-h-screen" />;
  }
  
  // Fallback UI if Clerk doesn't render properly
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background p-4">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Email Verification</h1>
        
        <p className="text-center mb-4">
          Please check your email for a verification link. Click the link to verify your email address.
        </p>
        
        <p className="text-center text-muted-foreground text-sm">
          If you don't see the email, check your spam folder.
        </p>
        
        <div className="flex justify-center mt-6">
          <a 
            href="/sign-in" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
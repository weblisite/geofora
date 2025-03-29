import { useClerk } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function VerifyEmailAddressPage() {
  const clerk = useClerk();

  // This version doesn't auto-redirect
  // It simply displays the verification page and waits for the user
  // to verify their email by clicking the link sent to their inbox

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-bold text-center">Verify your email</h2>
          <p className="text-center text-muted-foreground">
            We've sent a verification link to your email address.
            Please check your inbox and click the link to verify your account.
          </p>
          
          {clerk.user?.emailAddresses.map((email) => (
            <div key={email.id} className="mt-4 text-center">
              <p className="font-medium">{email.emailAddress}</p>
              <p className="text-sm text-muted-foreground">
                {email.verification?.status === "verified" 
                  ? "✅ Email verified" 
                  : "⏳ Waiting for verification"}
              </p>
            </div>
          ))}
          
          <div className="mt-8">
            <button
              className="px-4 py-2 text-sm font-medium text-primary underline"
              onClick={() => clerk.user?.reload()}
            >
              I've verified my email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
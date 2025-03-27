import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Alert,
  AlertDescription,
  AlertTitle, 
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, AlertCircle, CheckCircle, Copy, ExternalLink, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DomainVerificationProps {
  forumId: number;
  domain: string;
  onVerificationComplete: () => void;
}

export default function DomainVerification({ forumId, domain, onVerificationComplete }: DomainVerificationProps) {
  const [verificationToken, setVerificationToken] = useState<string>("");
  const [verificationStarted, setVerificationStarted] = useState<boolean>(false);
  const [verificationChecked, setVerificationChecked] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const { toast } = useToast();

  // Start domain verification process
  const startVerification = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("/api/domains/verify", {
        method: "POST",
        body: JSON.stringify({
          domain,
          forumId
        })
      });
      return await result.json();
    },
    onSuccess: (data) => {
      setVerificationToken(data.verificationToken);
      setVerificationStarted(true);
      toast({
        title: "Verification started",
        description: "We've generated a verification token for your domain.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed to start",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Check domain verification status
  const checkVerification = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("/api/domains/check-verification", {
        method: "POST",
        body: JSON.stringify({
          domain,
          token: verificationToken
        })
      });
      return await result.json();
    },
    onSuccess: (data) => {
      setVerificationChecked(true);
      setVerificationSuccess(data.verified);
      if (data.verified) {
        toast({
          title: "Domain verified!",
          description: "Your domain has been successfully verified.",
        });
        onVerificationComplete();
      } else {
        toast({
          title: "Verification pending",
          description: "DNS records haven't propagated yet. This can take up to 24 hours.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification check failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The verification token has been copied to your clipboard.",
    });
  };

  return (
    <Card className="border-dark-300 bg-dark-400/30 backdrop-blur-lg">
      <CardHeader>
        <CardTitle>Domain Verification</CardTitle>
        <CardDescription>
          Verify ownership of your custom domain before we can connect it to your forum
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verificationStarted ? (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Domain verification required</AlertTitle>
              <AlertDescription>
                Before you can use <strong>{domain}</strong> with your forum, 
                you need to verify that you own this domain.
              </AlertDescription>
            </Alert>
            <div className="text-gray-400 text-sm">
              <p>We'll help you verify your domain ownership through DNS verification:</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Start the verification process to get a unique verification token</li>
                <li>Add a TXT record to your domain's DNS settings</li>
                <li>Wait for DNS changes to propagate (can take up to 24 hours)</li>
                <li>Verify your domain</li>
              </ol>
            </div>
          </>
        ) : (
          <>
            {verificationSuccess ? (
              <Alert className="border-green-600 bg-green-600/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Domain Verified!</AlertTitle>
                <AlertDescription>
                  Your domain <strong>{domain}</strong> has been successfully verified and 
                  is now connected to your forum.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert className="border-primary/40 bg-primary/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Add DNS Record</AlertTitle>
                  <AlertDescription>
                    Add the following TXT record to your domain's DNS settings:
                  </AlertDescription>
                </Alert>
                
                <div className="bg-dark-600 rounded-md p-4 font-mono text-sm">
                  <div className="mb-3">
                    <div className="text-gray-400 mb-1">Record Type:</div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary">TXT</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-gray-400 mb-1">Name/Host:</div>
                    <div className="flex justify-between items-center">
                      <span>@</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard("@")} 
                        className="h-6 px-2"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 mb-1">Value/Content:</div>
                    <div className="flex justify-between items-center break-all">
                      <span className="text-primary">formai-verify={verificationToken}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(`formai-verify=${verificationToken}`)} 
                        className="h-6 px-2 flex-shrink-0 ml-2"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="dns-help">
                    <AccordionTrigger className="text-sm text-gray-300">
                      <span className="flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        How to add a TXT record to your DNS
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 text-sm space-y-3">
                      <p>Follow these general steps to add a TXT record:</p>
                      <ol className="list-decimal ml-5 space-y-2">
                        <li>Log in to your domain registrar or DNS hosting provider (GoDaddy, Namecheap, Cloudflare, etc.)</li>
                        <li>Find the DNS management or DNS settings section</li>
                        <li>Look for an option to add a new record</li>
                        <li>Select TXT as the record type</li>
                        <li>For the Name/Host field, use @ or leave blank (represents your root domain)</li>
                        <li>For the Value/Content field, paste the verification token exactly as shown above</li>
                        <li>Save your changes</li>
                      </ol>
                      <p className="text-xs opacity-75 mt-2">
                        Note: DNS changes can take up to 24 hours to propagate, though it often happens much faster.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {verificationChecked && !verificationSuccess && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Verification Not Complete</AlertTitle>
                    <AlertDescription>
                      We couldn't verify your domain yet. This could be because:
                      <ul className="list-disc ml-5 mt-2">
                        <li>DNS changes haven't propagated yet (can take up to 24 hours)</li>
                        <li>The TXT record wasn't added correctly</li>
                        <li>The wrong verification token was used</li>
                      </ul>
                      Please check your DNS settings and try again.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!verificationStarted ? (
          <Button 
            onClick={() => startVerification.mutate()}
            disabled={startVerification.isPending}
            className="w-full"
          >
            {startVerification.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Verification
          </Button>
        ) : !verificationSuccess ? (
          <div className="flex w-full space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(`https://${domain}`, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Domain
            </Button>
            <Button 
              onClick={() => checkVerification.mutate()}
              disabled={checkVerification.isPending}
              className="flex-1"
            >
              {checkVerification.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Domain
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onVerificationComplete}
            className="w-full"
            variant="outline"
          >
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
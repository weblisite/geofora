import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

// Define a type for the subscription data
interface SubscriptionData {
  isInTrial?: boolean;
  trialPlan?: string;
  trialEndsAt?: string;
  plan?: string;
  planActiveUntil?: string;
  status?: string;
  polarSubscriptionId?: string;
}

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  
  // Get checkout ID from URL if available
  const searchParams = new URLSearchParams(window.location.search);
  const checkoutId = searchParams.get('checkout_id');

  // Fetch subscription details
  const { data: subscriptionData, isLoading } = useQuery<SubscriptionData>({
    queryKey: ['/api/users/subscription'],
    retry: 2,
  });
  
  // Check if this is a trial
  const isTrialSignup = subscriptionData?.isInTrial || false;

  // Auto-redirect to dashboard after 5 seconds
  useEffect(() => {
    if (countdown <= 0) {
      setLocation('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-100 p-4">
      <Glassmorphism className="p-8 rounded-xl max-w-md w-full text-center" border>
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="material-icons text-3xl text-green-500">check_circle</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">
          {isTrialSignup ? 'Trial Activated!' : 'Payment Successful'}
        </h1>
        
        <p className="text-gray-400 mb-6">
          {isTrialSignup 
            ? 'Your 7-day free trial has been activated. Enjoy full access to all features!'
            : 'Thank you for your subscription! Your account has been activated.'}
        </p>
        
        {checkoutId && (
          <div className="mb-4 text-xs text-gray-400 bg-dark-200 p-2 rounded-md">
            <p className="font-medium">Transaction Reference:</p>
            <p className="font-mono">{checkoutId}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="mb-6">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Loading subscription details...</p>
          </div>
        ) : subscriptionData ? (
          <Card className="bg-dark-200 p-4 mb-6 border-dark-400">
            <h3 className="font-medium mb-2">Subscription Details</h3>
            <div className="text-sm text-gray-300">
              <p>
                <span className="text-gray-400">Plan:</span> {' '}
                <span className="capitalize">
                  {isTrialSignup && subscriptionData.trialPlan 
                    ? subscriptionData.trialPlan.replace(/-/g, ' ') 
                    : subscriptionData.plan || 'Starter'}
                </span>
              </p>
              
              <p>
                <span className="text-gray-400">Status:</span> {' '}
                {isTrialSignup ? 'Free Trial' : subscriptionData.status || 'Active'}
              </p>
              
              {isTrialSignup && subscriptionData.trialEndsAt ? (
                <p>
                  <span className="text-gray-400">Trial ends:</span>{' '}
                  {new Date(subscriptionData.trialEndsAt).toLocaleDateString()}
                </p>
              ) : subscriptionData.planActiveUntil && (
                <p>
                  <span className="text-gray-400">Next billing:</span>{' '}
                  {new Date(subscriptionData.planActiveUntil).toLocaleDateString()}
                </p>
              )}
            </div>
            
            {isTrialSignup && (
              <div className="mt-3 pt-3 border-t border-dark-300 text-sm text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="material-icons text-base">credit_card</span>
                  <span>Your payment method is securely stored. You won't be charged until your trial ends, and you can cancel anytime.</span>
                </p>
              </div>
            )}
          </Card>
        ) : null}
        
        <p className="text-sm text-gray-400 mb-4">
          Redirecting to your dashboard in {countdown} seconds...
        </p>
        
        <Button 
          onClick={() => setLocation('/dashboard')}
          className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500"
        >
          Go to Dashboard Now
        </Button>
      </Glassmorphism>
    </div>
  );
}
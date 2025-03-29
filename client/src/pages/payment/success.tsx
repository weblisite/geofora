import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  // Fetch subscription details
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['/api/users/subscription'],
    retry: 2,
  });

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
        
        <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
        
        <p className="text-gray-400 mb-6">
          Thank you for your subscription! Your account has been activated.
        </p>
        
        {isLoading ? (
          <div className="mb-6">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Loading subscription details...</p>
          </div>
        ) : subscriptionData ? (
          <Card className="bg-dark-200 p-4 mb-6 border-dark-400">
            <h3 className="font-medium mb-2">Subscription Details</h3>
            <div className="text-sm text-gray-300">
              <p><span className="text-gray-400">Plan:</span> {subscriptionData.plan || 'Starter'}</p>
              <p><span className="text-gray-400">Status:</span> {subscriptionData.status || 'Active'}</p>
              {subscriptionData.planActiveUntil && (
                <p>
                  <span className="text-gray-400">Next billing:</span>{' '}
                  {new Date(subscriptionData.planActiveUntil).toLocaleDateString()}
                </p>
              )}
            </div>
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
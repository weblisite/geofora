import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { planStore } from "@/lib/planStore";
import { PLAN_INFO, POLAR_PLAN_IDS, getSubscriptionUrl, getTrialSubscriptionUrl } from "@shared/polar-service";
import { Button } from "@/components/ui/button";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function PaymentPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<typeof PLAN_INFO[keyof typeof PLAN_INFO] | null>(null);
  const [trialMode, setTrialMode] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        // Get plan from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const planFromUrl = urlParams.get('plan');
        const selectedPlan = planFromUrl || planStore.getSelectedPlan();
        
        if (!selectedPlan) {
          toast({
            title: "No plan selected",
            description: "Please select a plan from the pricing page",
            variant: "destructive"
          });
          setLocation('/');
          return;
        }
        
        setPlanType(selectedPlan);
        
        // Get plan info
        const planId = POLAR_PLAN_IDS[selectedPlan as keyof typeof POLAR_PLAN_IDS];
        const info = PLAN_INFO[planId];
        
        if (!info) {
          toast({
            title: "Invalid plan",
            description: "The selected plan is not valid",
            variant: "destructive"
          });
          setLocation('/');
          return;
        }
        
        setPlanInfo(info);
        setLoading(false);
      } catch (error) {
        console.error("Payment page initialization error:", error);
        toast({
          title: "Error",
          description: "Failed to initialize payment page",
          variant: "destructive"
        });
        setLocation('/');
      }
    };
    
    initPage();
  }, [setLocation]);

  const handleProceedToPayment = async () => {
    try {
      if (!user || !planType) {
        toast({
          title: "Missing information",
          description: "User or plan information is missing",
          variant: "destructive"
        });
        return;
      }
      
      if (!agreeToTerms) {
        toast({
          title: "Terms Agreement Required",
          description: "Please agree to the terms and conditions to continue",
          variant: "destructive"
        });
        return;
      }
      
      setLoading(true);
      
      // Store user plan selection in database
      await apiRequest('/api/users/select-plan', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          planType,
          isTrial: trialMode
        })
      });
      
      // Generate the return URL (dashboard)
      const returnUrl = `${window.location.origin}/dashboard?checkout_id={CHECKOUT_ID}`;
      
      // Get the direct checkout URL with parameters
      const subscriptionUrl = trialMode 
        ? getTrialSubscriptionUrl(planType, user.id, returnUrl)
        : getSubscriptionUrl(planType, user.id, returnUrl);
      
      // Redirect to Polar payment page
      window.location.href = subscriptionUrl;
    } catch (error) {
      console.error("Payment processing error:", error);
      setLoading(false);
      toast({
        title: "Payment Error",
        description: "Failed to process payment request",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    planStore.clearSelectedPlan();
    setLocation('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Preparing your subscription...</h2>
        </div>
      </div>
    );
  }

  if (!planInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <Glassmorphism className="p-8 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4">No Plan Selected</h2>
          <p className="text-gray-300 mb-6">Please select a plan from the pricing page.</p>
          <Button onClick={() => setLocation('/')}>
            Return to Home
          </Button>
        </Glassmorphism>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-dark-100">
      <div className="container px-4 mx-auto">
        <Glassmorphism className="p-8 rounded-xl max-w-2xl mx-auto" border>
          <h1 className="text-2xl font-bold mb-6">
            {trialMode ? "Start Your 7-Day Free Trial" : "Complete Your Subscription"}
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              {planInfo.name} Plan - {planInfo.price}
            </h2>
            
            {trialMode && (
              <div className="bg-primary-900/20 text-primary-400 border border-primary-800 p-3 rounded-lg mb-4 flex items-start">
                <span className="material-icons text-lg mr-2 mt-0.5">info</span>
                <p className="text-sm">
                  You'll get full access to all features for 7 days. Your card won't be charged until the trial ends.
                </p>
              </div>
            )}
            
            <div className="bg-dark-300 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Plan Features:</h3>
              <ul className="space-y-2">
                {planInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="material-icons text-accent-400 mr-2 mt-0.5 text-sm">check_circle</span>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-dark-200 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">What happens next:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                <li>You'll be redirected to Polar's secure payment page</li>
                <li>Enter your payment details {trialMode ? 'to set up your trial' : 'to complete the subscription'}</li>
                <li>After confirmation, you'll be returned to your dashboard</li>
                <li>Your plan features will be immediately activated</li>
                {trialMode && <li>After 7 days, your subscription will automatically begin at {planInfo.price}</li>}
              </ol>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                />
                <Label 
                  htmlFor="terms"
                  className="text-sm text-gray-300 cursor-pointer"
                >
                  I agree to the terms of service and understand that {trialMode 
                    ? `my card will be charged ${planInfo.price} after the 7-day trial ends unless I cancel.` 
                    : `my subscription will begin immediately at ${planInfo.price}.`}
                </Label>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500"
              onClick={handleProceedToPayment}
              disabled={!agreeToTerms}
            >
              <span className="material-icons mr-2">credit_card</span>
              {trialMode ? "Start Free Trial" : "Proceed to Payment"}
            </Button>
          </div>
          
          {trialMode && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setTrialMode(false)} 
                className="text-sm text-gray-400 hover:text-white underline"
              >
                I'd prefer to subscribe immediately without a trial
              </button>
            </div>
          )}
        </Glassmorphism>
      </div>
    </div>
  );
}
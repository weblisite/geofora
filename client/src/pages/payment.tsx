import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { planStore } from "@/lib/planStore";
import { PLAN_INFO, POLAR_PLAN_IDS, POLAR_CHECKOUT_LINKS } from "@shared/polar-service";
import { Button } from "@/components/ui/button";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<typeof PLAN_INFO[keyof typeof PLAN_INFO] | null>(null);

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
      
      setLoading(true);
      
      // Store user plan selection in database
      await apiRequest('/api/users/select-plan', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          planType,
          isTrial: false
        })
      });
      
      // Use direct checkout links provided by Polar.sh
      const checkoutUrl = POLAR_CHECKOUT_LINKS[planType as keyof typeof POLAR_CHECKOUT_LINKS];
      
      if (!checkoutUrl) {
        throw new Error("Invalid plan type or missing checkout URL");
      }
      
      // Redirect to Polar checkout page
      window.location.href = checkoutUrl;
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
            Complete Your Subscription
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              {planInfo.name} Plan - {planInfo.price}
            </h2>
            
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
                <li>Enter your payment details to complete the subscription</li>
                <li>After payment confirmation, you'll be returned to your dashboard</li>
                <li>Your plan features will be immediately activated</li>
              </ol>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500"
              onClick={handleProceedToPayment}
            >
              <span className="material-icons mr-2">credit_card</span>
              Proceed to Payment
            </Button>
          </div>
        </Glassmorphism>
      </div>
    </div>
  );
}
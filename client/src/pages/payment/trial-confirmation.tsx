import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { usePlanStore } from "@/lib/planStore";
import { CheckCircle, Calendar, CreditCard, AlertTriangle } from "lucide-react";

export default function TrialConfirmationPage() {
  const [, setLocation] = useLocation();
  const [agreed, setAgreed] = useState(false);
  
  // Get the selected plan from the store
  const { selectedPlanId, selectedPlanInfo } = usePlanStore();
  
  // Mutation to start trial and redirect to checkout
  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<{checkoutUrl: string}>('/api/payments/create-trial-checkout', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlanId,
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      // Redirect to Polar checkout
      window.location.href = data.checkoutUrl;
    }
  });
  
  // If no plan was selected, redirect back to pricing
  if (!selectedPlanId || !selectedPlanInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100 p-4">
        <Glassmorphism className="p-8 rounded-xl max-w-md w-full text-center" border>
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          
          <h1 className="text-2xl font-bold mb-2">No Plan Selected</h1>
          
          <p className="text-gray-400 mb-6">
            Please select a plan before proceeding to the trial confirmation.
          </p>
          
          <Button 
            onClick={() => setLocation('/pricing')}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500"
          >
            View Plans
          </Button>
        </Glassmorphism>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-100 p-4">
      <Glassmorphism className="p-8 rounded-xl max-w-lg w-full" border>
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
            <span className="material-icons text-3xl text-primary-500">card_membership</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center">Start Your 7-Day Free Trial</h1>
        
        <p className="text-gray-400 mb-6 text-center">
          You're about to start your free trial of the <span className="text-primary-500 font-medium capitalize">{selectedPlanInfo.name}</span> plan.
        </p>
        
        <Card className="bg-dark-200 p-4 mb-6 border-dark-400">
          <h3 className="font-medium mb-3 flex items-center">
            <span className="mr-2">Trial Details</span>
            <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">7 Days Free</span>
          </h3>
          
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-1 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Full Access to {selectedPlanInfo.name} Plan</p>
                <p className="text-gray-400">Try all features without limitations</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="w-4 h-4 mr-2 mt-1 text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-medium">Automatic Conversion</p>
                <p className="text-gray-400">After 7 days, your trial will convert to a full {selectedPlanInfo.name} plan subscription at {selectedPlanInfo.price}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CreditCard className="w-4 h-4 mr-2 mt-1 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Billing Details Required</p>
                <p className="text-gray-400">Your payment method will be securely stored but not charged until your trial ends</p>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="border border-dark-400 rounded-md p-4 mb-6">
          <h3 className="font-medium mb-2">What You'll Get:</h3>
          <ul className="space-y-2 text-sm">
            {selectedPlanInfo.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-start mb-6">
          <input
            type="checkbox"
            id="agree-terms"
            className="mr-2 mt-1"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label htmlFor="agree-terms" className="text-sm text-gray-400">
            I understand that by proceeding, my payment method will be stored securely and I will be automatically
            charged {selectedPlanInfo.price} after the 7-day trial period unless I cancel before then.
          </label>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={() => startTrialMutation.mutate()}
            disabled={!agreed || startTrialMutation.isPending}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 h-12"
          >
            {startTrialMutation.isPending ? (
              <span className="flex items-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Processing...
              </span>
            ) : (
              'Start My Free Trial'
            )}
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => setLocation('/pricing')}
            className="text-gray-400"
          >
            Return to Plans
          </Button>
        </div>
      </Glassmorphism>
    </div>
  );
}
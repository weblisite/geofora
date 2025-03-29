import { PRICING_PLANS } from "@/lib/constants";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/clerk-react";
import { planStore, PlanType } from "@/lib/planStore";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";

export default function Pricing() {
  const { openSignUp } = useClerk();
  const [, setLocation] = useLocation();

  // Handle plan selection and redirect to Polar.sh checkout
  const handleSelectPlan = (planName: string) => {
    // Redirect to appropriate Polar.sh checkout URL
    switch(planName.toLowerCase()) {
      case "starter": 
        window.open("https://buy.polar.sh/polar_cl_saQVhkF5OgG3xuhn3eZm5G3gQUA0rAx17BHB43INwPN", "_blank");
        break;
      case "professional": 
        window.open("https://buy.polar.sh/polar_cl_oCymEewojyAWOZOHjZJRC1PQGo0ES0Tu2eeVh1S3N6Y", "_blank");
        break;
      case "enterprise": 
        window.open("https://buy.polar.sh/polar_cl_bXNvmdougqf83av9fFAH1DA6y3ghNMzf5Kzwy38RLVX", "_blank");
        break;
      default:
        toast({
          title: "Error",
          description: "Invalid plan selected",
          variant: "destructive"
        });
        return;
    }
  };

  return (
    <section id="pricing" className="py-20 bg-dark-200">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Flexible <GradientText>Pricing</GradientText>
          </h2>
          <p className="text-gray-400">
            Choose the plan that fits your business needs and scale as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <div 
              key={index}
              className={cn(
                "glass rounded-xl overflow-hidden transition-all duration-300", 
                plan.highlighted && "transform scale-105 shadow-glow relative border border-primary-500/30"
              )}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-6 bg-dark-300 border-b border-dark-400">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.interval && (
                    <span className="text-gray-400 ml-1">/{plan.interval}</span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="material-icons text-accent-400 mr-2 mt-0.5">check_circle</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.disabledFeatures.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="material-icons text-gray-500 mr-2 mt-0.5">remove_circle</span>
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={cn(
                    "w-full mt-8 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all rounded-lg",
                    plan.highlighted
                      ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-glow"
                      : "border border-primary-500 bg-dark-200 hover:bg-primary-500/10"
                  )}
                >
                  <span>{plan.buttonText}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Not sure which plan is right for you?</p>
          <a href="https://calendly.com/cmofy/meeting" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary-400 hover:text-primary-300">
            <span>Schedule a personalized demo</span>
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  );
}

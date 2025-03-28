import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useEffect, useState } from "react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  // Auto-advance through steps every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => prev < HOW_IT_WORKS_STEPS.length ? prev + 1 : 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="py-20 bg-dark-100 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            How It <GradientText>Works</GradientText>
          </h2>
          <p className="text-gray-400">
            Our advanced AI-powered platform integrates seamlessly with your existing infrastructure to deliver immediate results.
          </p>
        </div>

        {/* Desktop Timeline View */}
        <div className="hidden md:block relative max-w-5xl mx-auto">
          {/* Timeline connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500"></div>
          
          <div className="flex justify-between relative">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div 
                key={step.id} 
                className="relative flex flex-col items-center" 
                style={{ width: `${100 / HOW_IT_WORKS_STEPS.length}%` }}
              >
                {/* Circle node */}
                <div 
                  className={`z-10 flex items-center justify-center w-16 h-16 mb-4 rounded-full transition-all duration-300 cursor-pointer glass border-2 ${
                    activeStep === step.id 
                      ? "border-primary-400 shadow-glow scale-110" 
                      : "border-primary-500/40"
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <span className={`material-icons text-2xl ${
                    activeStep === step.id ? "text-primary-400" : "text-gray-400"
                  }`}>{step.icon}</span>
                </div>
                
                {/* Step number */}
                <div className={`absolute -top-7 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                  activeStep === step.id ? "bg-primary-500" : "bg-dark-300"
                }`}>
                  <span className="text-xs font-bold">{step.id}</span>
                </div>
                
                {/* Step title (above or below based on position) */}
                <h4 className={`text-lg font-semibold mt-2 text-center transition-colors duration-300 ${
                  activeStep === step.id ? "text-white" : "text-gray-400"
                }`}>
                  {step.title}
                </h4>
              </div>
            ))}
          </div>
          
          {/* Active step description */}
          <div className="mt-12 pt-4">
            <Glassmorphism className="p-8 rounded-xl max-w-2xl mx-auto transform transition-all duration-500" border>
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <span className={`material-icons mr-3 text-primary-400`}>
                  {HOW_IT_WORKS_STEPS[activeStep - 1].icon}
                </span>
                <span>
                  {activeStep}. {HOW_IT_WORKS_STEPS[activeStep - 1].title}
                </span>
              </h3>
              <p className="text-gray-300 text-lg">
                {HOW_IT_WORKS_STEPS[activeStep - 1].description}
              </p>
            </Glassmorphism>
          </div>
        </div>

        {/* Mobile View - Vertical Steps */}
        <div className="md:hidden relative">
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500"></div>
          
          <div className="space-y-10">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div 
                key={step.id} 
                className={`relative pl-16 transition-all duration-300 ${
                  activeStep === step.id ? "opacity-100" : "opacity-60"
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                {/* Circle node */}
                <div className={`absolute left-0 z-10 flex items-center justify-center w-12 h-12 rounded-full glass border-2 ${
                  activeStep === step.id 
                    ? "border-primary-400 shadow-glow" 
                    : "border-primary-500/40"
                }`}>
                  <span className={`material-icons ${
                    activeStep === step.id ? "text-primary-400" : "text-gray-400"
                  }`}>{step.icon}</span>
                </div>
                
                {/* Step number */}
                <div className={`absolute top-0 left-0 -mt-2 -ml-2 w-6 h-6 rounded-full flex items-center justify-center ${
                  activeStep === step.id ? "bg-primary-500" : "bg-dark-300"
                }`}>
                  <span className="text-xs font-bold">{step.id}</span>
                </div>
                
                <Glassmorphism 
                  className={`p-5 rounded-xl transition-all duration-300 ${
                    activeStep === step.id ? "border-primary-400" : ""
                  }`} 
                  border
                >
                  <h3 className={`text-xl font-semibold mb-2 ${
                    activeStep === step.id ? "text-white" : "text-gray-300"
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </Glassmorphism>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
}

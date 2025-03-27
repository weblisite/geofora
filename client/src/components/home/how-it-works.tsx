import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-dark-100">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            How It <GradientText>Works</GradientText>
          </h2>
          <p className="text-gray-400">
            Our advanced AI-powered platform integrates seamlessly with your existing infrastructure to deliver immediate results.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500 hidden md:block"></div>

          <div className="space-y-12">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <div className="relative" key={step.id}>
                <div className="flex flex-col md:flex-row items-center">
                  <div className={`flex-1 order-2 md:order-${index % 2 === 0 ? '1' : '3'} mt-8 md:mt-0 ${index % 2 === 0 ? 'md:pr-10' : 'md:pl-10'}`}>
                    <Glassmorphism className={`p-6 rounded-xl ${index % 2 === 0 ? 'md:text-right' : ''}`} border>
                      <h3 className="text-xl font-semibold mb-3">{`${step.id}. ${step.title}`}</h3>
                      <p className="text-gray-400">{step.description}</p>
                    </Glassmorphism>
                  </div>

                  <div className="z-10 flex items-center justify-center w-16 h-16 order-1 md:order-2 rounded-full glass border border-primary-500 shadow-glow">
                    <span className="material-icons text-primary-400">{step.icon}</span>
                  </div>

                  <div className={`flex-1 order-3 ${index % 2 === 0 ? '' : 'mt-8 md:mt-0'}`}>
                    {/* Empty for alignment */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

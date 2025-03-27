import { BENEFITS } from "@/lib/constants";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";

export default function Benefits() {
  return (
    <section id="benefits" className="py-20 bg-dark-200 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary-500/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Why Choose <GradientText>ForumAI</GradientText>
          </h2>
          <p className="text-gray-400">
            Our platform delivers unparalleled benefits that transform your SEO strategy and boost your bottom line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {BENEFITS.map((benefit, index) => (
            <Glassmorphism key={index} className="p-8 rounded-xl" border>
              <div className={`flex items-center justify-center w-14 h-14 mb-6 rounded-lg bg-${benefit.color}-500/10 text-${benefit.color}-400`}>
                <span className="material-icons">{benefit.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </Glassmorphism>
          ))}
        </div>
      </div>
    </section>
  );
}

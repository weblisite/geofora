import { FEATURES } from "@/lib/constants";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";

export default function Features() {
  return (
    <section id="features" className="py-20 bg-dark-200">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            What We <GradientText>Offer</GradientText>
          </h2>
          <p className="text-gray-400">
            Cutting-edge AI technology engineered by Silicon Valley's finest to boost your SEO performance and drive unprecedented traffic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <Glassmorphism
              key={index}
              className="p-6 rounded-xl glow-on-hover hover:shadow-glow transition-all duration-300"
            >
              <div className={`flex items-center justify-center w-12 h-12 mb-5 rounded-lg bg-${feature.color}-500/20 text-${feature.color}-400`}>
                <span className="material-icons">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              <div className={`flex items-center text-${feature.color}-400 text-sm font-medium`}>
                <span>Learn more</span>
                <span className="material-icons text-sm ml-1">arrow_forward</span>
              </div>
            </Glassmorphism>
          ))}
        </div>
      </div>
    </section>
  );
}

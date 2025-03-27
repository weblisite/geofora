import { PAIN_POINTS } from "@/lib/constants";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";

export default function PainPoints() {
  return (
    <section className="py-16 bg-dark-100">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-4">
            Modern SEO <GradientText>Challenges</GradientText>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Traditional methods are falling behind. Today's market demands next-generation solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PAIN_POINTS.map((point, index) => (
            <Glassmorphism key={index} className="p-8 rounded-xl" border>
              <div className={`flex items-center justify-center w-14 h-14 mb-6 rounded-lg bg-${point.color}-500/10 text-${point.color}-400`}>
                <span className="material-icons">{point.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
              <p className="text-gray-400">{point.description}</p>
            </Glassmorphism>
          ))}
        </div>
      </div>
    </section>
  );
}

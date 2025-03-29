import { Link } from "wouter";
import { GradientText } from "@/components/ui/gradient-text";

export default function CTA() {
  return (
    <section className="py-20 bg-dark-200 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-900/30 to-secondary-900/30"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Step Into the Future of <GradientText>SEO Today!</GradientText>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of industry leaders who are already leveraging AI-powered forums to dominate search rankings and capture high-intent leads.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/#pricing" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-glow min-w-[200px]">
              <span>Launch Now</span>
              <span className="ml-2 material-icons">rocket_launch</span>
            </Link>

            <a href="https://calendly.com/cmofy/meeting" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all bg-dark-300 rounded-lg hover:bg-dark-400 border border-primary-500/30 min-w-[200px]">
              <span>Request Demo</span>
              <span className="ml-2 material-icons">play_circle</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

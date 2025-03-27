import { Link } from "wouter";
import { GradientText } from "@/components/ui/gradient-text";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 animated-gradient-bg">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary-500/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid items-center grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <GradientText className="mr-2">The Future of SEO:</GradientText> AI-Powered Q&A Forums
            </h1>

            <p className="mb-8 text-lg text-gray-300">
              Built by Silicon Valley's finest—our AI agents craft keyword-optimized discussions that rocket your rankings and traffic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-glow">
                <span>Launch Now</span>
                <span className="ml-2 material-icons">rocket_launch</span>
              </Link>

              <button className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all bg-dark-200 rounded-lg hover:bg-dark-300 border border-primary-500/30">
                <span>Experience the Demo</span>
                <span className="ml-2 material-icons">play_circle</span>
              </button>
            </div>

            <div className="flex items-center mt-8 space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((idx) => (
                  <img 
                    key={idx}
                    src={`https://i.pravatar.cc/100?img=${idx + 10}`}
                    alt="User" 
                    className="w-10 h-10 border-2 border-dark-100 rounded-full"
                  />
                ))}
              </div>
              <div className="flex items-center">
                <div className="flex">
                  {Array(5).fill(null).map((_, i) => (
                    <span key={i} className="material-icons text-yellow-400">star</span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-300">
                  From <span className="font-semibold text-white">500+</span> satisfied customers
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
              <div className="absolute -bottom-8 right-4 w-72 h-72 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: "1s" }}></div>

              <div className="relative glass gradient-border p-1 rounded-2xl shadow-xl overflow-hidden">
                <div className="rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1581092583548-2cbfbe1e9375?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400&q=80"
                    alt="AI-powered forum visualization"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark-200/80 to-transparent"></div>
    </section>
  );
}

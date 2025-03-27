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
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <GradientText className="block md:inline">The Future of SEO:</GradientText>{" "}
              <span className="block mt-2 md:mt-0 md:inline">AI-Powered Q&A Forums</span>
            </h1>

            <p className="mb-8 text-base md:text-lg text-gray-300">
              Built by Silicon Valley's finest—our AI agents craft keyword-optimized discussions that rocket your rankings and traffic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-base font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-glow"
              >
                <span>Launch Now</span>
                <span className="ml-2 material-icons">rocket_launch</span>
              </Link>

              <button 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-base font-medium text-white transition-all bg-dark-200 rounded-lg hover:bg-dark-300 border border-primary-500/30"
              >
                <span className="hidden sm:inline">Experience the Demo</span>
                <span className="inline sm:hidden">Try Demo</span>
                <span className="ml-2 material-icons">play_circle</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center mt-8 sm:space-x-4">
              <div className="flex -space-x-2 mb-3 sm:mb-0">
                {[1, 2, 3].map((idx) => (
                  <img 
                    key={idx}
                    src={`https://i.pravatar.cc/100?img=${idx + 10}`}
                    alt="User" 
                    className="w-10 h-10 border-2 border-dark-100 rounded-full"
                  />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex mb-1 sm:mb-0">
                  {Array(5).fill(null).map((_, i) => (
                    <span key={i} className="material-icons text-yellow-400 text-sm sm:text-base">star</span>
                  ))}
                </div>
                <span className="sm:ml-2 text-xs sm:text-sm text-gray-300">
                  From <span className="font-semibold text-white">500+</span> satisfied customers
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center mt-8 lg:mt-0">
            <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
              {/* Animated background effects */}
              <div className="absolute top-0 -left-4 w-48 md:w-72 h-48 md:h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
              <div className="absolute -bottom-8 right-4 w-48 md:w-72 h-48 md:h-72 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: "1s" }}></div>

              {/* Image container with glassmorphism effect */}
              <div className="relative glass gradient-border p-1 rounded-2xl shadow-xl overflow-hidden">
                <div className="rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1581092583548-2cbfbe1e9375?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400&q=80"
                    alt="AI-powered forum visualization"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
              
              {/* Decorative floating elements for visual interest */}
              <div className="absolute -top-6 -right-6 w-16 md:w-20 h-16 md:h-20 glass border border-primary-500/20 p-3 rounded-lg shadow-glow hidden sm:block" style={{ transform: 'rotate(15deg)' }}>
                <div className="flex items-center justify-center h-full">
                  <span className="material-icons text-2xl md:text-3xl text-primary-400">psychology</span>
                </div>
              </div>
              
              {/* Second floating element */}
              <div className="absolute -bottom-4 -left-3 w-14 md:w-16 h-14 md:h-16 glass border border-secondary-500/20 p-2 rounded-lg shadow-glow hidden sm:block" style={{ transform: 'rotate(-10deg)' }}>
                <div className="flex items-center justify-center h-full">
                  <span className="material-icons text-xl md:text-2xl text-secondary-400">auto_awesome</span>
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

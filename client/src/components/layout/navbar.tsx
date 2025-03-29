import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { GradientText } from "@/components/ui/gradient-text";
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading } = useClerkAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300 backdrop-blur-md",
        scrolled ? "bg-dark-100" : "bg-opacity-90 glass"
      )}
    >
      <div className="container flex items-center justify-between mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-primary-500 flex items-center justify-center w-10 h-10 rounded-full bg-dark-100 shadow-glow">
            <span className="material-icons">forum</span>
          </div>
          <span className="text-2xl font-bold">
            <GradientText>ForumAI</GradientText>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/#features"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-gray-300 hover:text-white transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#benefits"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Benefits
          </Link>
          <Link
            href="/#pricing"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700"></div>
          ) : user ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all border border-primary-500 rounded-lg hover:bg-primary-500/20"
              >
                <span className="material-icons mr-1 text-sm">dashboard</span>
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden md:inline-block px-4 py-2 text-sm font-medium text-white transition-all border border-primary-500 rounded-lg hover:bg-primary-500/20"
              >
                Log In
              </Link>
              <Link
                href="/#pricing"
                className="hidden md:inline-flex items-center px-6 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-glow"
              >
                <span>Launch Now</span>
                <span className="ml-2 material-icons text-sm">arrow_forward</span>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="material-icons">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-100/95 backdrop-blur-md py-4 px-4 absolute left-0 right-0 top-full border-t border-primary-500/20 shadow-lg animate-in fade-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4">
            <Link
              href="/#features"
              className="text-gray-300 hover:text-white transition-colors py-3 px-2 rounded-lg hover:bg-dark-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <span className="material-icons mr-2 text-primary-400">star</span>
                Features
              </span>
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-300 hover:text-white transition-colors py-3 px-2 rounded-lg hover:bg-dark-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <span className="material-icons mr-2 text-primary-400">info</span>
                How It Works
              </span>
            </Link>
            <Link
              href="/#benefits"
              className="text-gray-300 hover:text-white transition-colors py-3 px-2 rounded-lg hover:bg-dark-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <span className="material-icons mr-2 text-primary-400">done_all</span>
                Benefits
              </span>
            </Link>
            <Link
              href="/#pricing"
              className="text-gray-300 hover:text-white transition-colors py-3 px-2 rounded-lg hover:bg-dark-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <span className="material-icons mr-2 text-primary-400">attach_money</span>
                Pricing
              </span>
            </Link>
            {!user && (
              <Link
                href="/sign-in"
                className="text-gray-300 hover:text-white transition-colors py-3 px-2 rounded-lg hover:bg-dark-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <span className="material-icons mr-2 text-primary-400">login</span>
                  Log In
                </span>
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors py-3 px-2 rounded-lg hover:bg-dark-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <span className="material-icons mr-2 text-primary-400">dashboard</span>
                  Dashboard
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

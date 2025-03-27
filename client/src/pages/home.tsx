import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import PainPoints from "@/components/home/pain-points";
import Features from "@/components/home/features";
import HowItWorks from "@/components/home/how-it-works";
import Benefits from "@/components/home/benefits";
import ForumPreview from "@/components/home/forum-preview";
import QuestionDetailPreview from "@/components/home/question-detail-preview";
import DashboardPreview from "@/components/home/dashboard-preview";
import Pricing from "@/components/home/pricing";
import FAQ from "@/components/home/faq";
import CTA from "@/components/home/cta";
import { useEffect } from "react";

export default function HomePage() {
  // Scroll to section if hash is present in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 100,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, []);

  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(anchor.hash);
        if (element) {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 100,
            behavior: "smooth",
          });
          // Update URL without reload
          window.history.pushState(null, '', anchor.hash);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <PainPoints />
        <Features />
        <HowItWorks />
        <Benefits />
        <ForumPreview />
        <QuestionDetailPreview />
        <DashboardPreview />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

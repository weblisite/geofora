import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/home";
import ForumPage from "@/pages/forum";
import QuestionDetailPage from "@/pages/forum/[id]";
import NewQuestionPage from "@/pages/forum/new";
import DashboardPage from "@/pages/dashboard";
import KeywordAnalysisPage from "@/pages/dashboard/keyword-analysis";
import InterlinkingPage from "@/pages/dashboard/interlinking";
import LeadCapturePage from "@/pages/dashboard/lead-capture";
import CrmIntegrationsPage from "@/pages/dashboard/crm";
import AnalyticsPage from "@/pages/dashboard/analytics";
import ContentSchedulingPage from "@/pages/dashboard/content-scheduling";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
// Only keep our custom verify page, let Clerk handle email verification directly
import VerifyPage from "@/pages/verify";
import EmailVerificationPage from "@/pages/email-verification";
import UIShowcasePage from "@/pages/ui-showcase";
import DocumentationPage from "@/pages/documentation-page";
import PitchDeckPage from "@/pages/pitchdeck";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics-tracker";
import React from "react";
import { useUserSync } from "@/hooks/use-user-sync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PWAProvider, PWAInstallBanner, PWAUpdateBanner, OfflineIndicator } from "@/components/pwa/PWAProvider";
import { MobileOptimizationProvider } from "@/components/mobile/MobileOptimizationProvider";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { SkipLinks } from "@/components/accessibility/SkipLinks";

// Placeholder page components for site sections
const PartnersPage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-6">Partners</h1><p>Coming soon!</p></div>;
const AboutPage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-6">About Us</h1><p>Coming soon!</p></div>;
const PressPage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-6">Press</h1><p>Coming soon!</p></div>;
const ApiDocsPage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-6">API Documentation</h1><p>Coming soon!</p></div>;
const CaseStudiesPage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-6">Case Studies</h1><p>Coming soon!</p></div>;
const CareersPage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-6">Careers</h1><p>Coming soon!</p></div>;

function App() {
  const [location] = useLocation();
  const analyticsInitialized = React.useRef(false);
  // Use a basic loading state instead of useClerkAuth at the top level
  const [initializing, setInitializing] = useState(true);
  
  // Automatically sync Clerk users to database
  useUserSync();

  // Initialize analytics only once after component mounts
  useEffect(() => {
    if (!analyticsInitialized.current) {
      try {
        initAnalytics();
        analyticsInitialized.current = true;
        console.log("Analytics initialized successfully");
      } catch (error) {
        console.error("Failed to initialize analytics:", error);
      }
    }
    // Set initializing to false after a short delay to allow auth to load
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Track page views when location changes
  useEffect(() => {
    if (analyticsInitialized.current) {
      try {
        trackPageView();
        console.log(`Page view tracked for: ${location}`);
      } catch (error) {
        console.error("Failed to track page view:", error);
      }
    }
  }, [location]);

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PWAProvider>
        <MobileOptimizationProvider>
          <AccessibilityProvider>
            <SkipLinks />
            <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/forum" component={ForumPage} />
        <Route path="/forum/new" component={NewQuestionPage} />
        <Route path="/forum/:id" component={QuestionDetailPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/forum" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/agents" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/analytics" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/keyword-analysis" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/interlinking" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/lead-capture" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/crm" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/content-scheduling" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/integration" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/settings" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/traffic-analysis" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/conversions" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/ai-personas" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/data-export" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/setup-fee" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/business-analysis" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/industry-detection" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/brand-voice" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/accessibility" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/enhanced-analytics" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/analytics-reporting" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/realtime-analytics" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/seo-reporting" component={DashboardPage} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
        <Route path="/sign-up/verify" component={VerifyPage} />
        <Route path="/sign-up/verify-email-address" component={EmailVerificationPage} />
        {/* Legacy route redirects */}
        <Route path="/login">
          <SignInPage />
        </Route>
        <Route path="/register">
          <SignUpPage />
        </Route>
        <Route path="/auth">
          <SignInPage />
        </Route>
        <Route path="/ui-showcase" component={UIShowcasePage} />
        <Route path="/documentation" component={DocumentationPage} />
        <Route path="/pitchdeck" component={PitchDeckPage} />
        <Route path="/partners" component={PartnersPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/press" component={PressPage} />
        <Route path="/api-docs" component={ApiDocsPage} />
        <Route path="/case-studies" component={CaseStudiesPage} />
        <Route path="/careers" component={CareersPage} />
        <Route component={NotFound} />
          </Switch>
          <Toaster />
          <PWAInstallBanner />
          <PWAUpdateBanner />
          <OfflineIndicator />
          </AccessibilityProvider>
        </MobileOptimizationProvider>
      </PWAProvider>
    </ErrorBoundary>
  );
}

export default App;

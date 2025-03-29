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
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics-tracker";
import React from "react";

function App() {
  const [location] = useLocation();
  const analyticsInitialized = React.useRef(false);
  // Use a basic loading state instead of useClerkAuth at the top level
  const [initializing, setInitializing] = useState(true);

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
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/forum" component={ForumPage} />
        <Route path="/forum/new" component={NewQuestionPage} />
        <Route path="/forum/:id" component={QuestionDetailPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/forum" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/personas" component={DashboardPage} />
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
        <Route path="/partners" component={PartnersPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/press" component={PressPage} />
        <Route path="/api-docs" component={ApiDocsPage} />
        <Route path="/case-studies" component={CaseStudiesPage} />
        <Route path="/careers" component={CareersPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;

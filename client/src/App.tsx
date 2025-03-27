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
import GatedContentPage from "@/pages/dashboard/gated-content";
import CrmIntegrationsPage from "@/pages/dashboard/crm";
import AnalyticsPage from "@/pages/dashboard/analytics";
import ContentSchedulingPage from "@/pages/dashboard/content-scheduling";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import AuthPage from "@/pages/auth-page";
import UIShowcasePage from "@/pages/ui-showcase";
import DocumentationPage from "@/pages/documentation-page";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics-tracker";
import React from "react";

function App() {
  const [location] = useLocation();
  const analyticsInitialized = React.useRef(false);

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

  // Get auth state safely - the useAuth hook has a fallback when used outside AuthProvider
  const { isLoading } = useAuth();

  if (isLoading) {
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
        <ProtectedRoute path="/dashboard/analytics" component={AnalyticsPage} />
        <ProtectedRoute path="/dashboard/keyword-analysis" component={KeywordAnalysisPage} />
        <ProtectedRoute path="/dashboard/interlinking" component={InterlinkingPage} />
        <ProtectedRoute path="/dashboard/lead-capture" component={LeadCapturePage} />
        <ProtectedRoute path="/dashboard/gated-content" component={GatedContentPage} />
        <ProtectedRoute path="/dashboard/crm" component={CrmIntegrationsPage} />
        <ProtectedRoute path="/dashboard/content-scheduling" component={ContentSchedulingPage} />
        <ProtectedRoute path="/dashboard/integration" component={DashboardPage} />
        <ProtectedRoute path="/dashboard/settings" component={DashboardPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/ui-showcase" component={UIShowcasePage} />
        <Route path="/documentation" component={DocumentationPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;

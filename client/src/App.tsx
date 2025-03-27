import { Switch, Route } from "wouter";
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
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function App() {
  try {
    const { isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }
  } catch (error) {
    console.error("Auth error in App:", error);
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
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;

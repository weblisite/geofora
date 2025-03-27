import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/home";
import ForumPage from "@/pages/forum";
import QuestionDetailPage from "@/pages/forum/[id]";
import NewQuestionPage from "@/pages/forum/new";
import DashboardPage from "@/pages/dashboard";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/forum" component={ForumPage} />
        <Route path="/forum/new" component={NewQuestionPage} />
        <Route path="/forum/:id" component={QuestionDetailPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/dashboard/forum" component={DashboardPage} />
        <Route path="/dashboard/personas" component={DashboardPage} />
        <Route path="/dashboard/analytics" component={DashboardPage} />
        <Route path="/dashboard/integration" component={DashboardPage} />
        <Route path="/dashboard/settings" component={DashboardPage} />
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

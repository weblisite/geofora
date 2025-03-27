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
import NotFound from "@/pages/not-found";
//import { useAuth } from "@/hooks/use-auth";

function App() {
  // Do NOT use auth hook inside the App to avoid auth provider context issue
  // This was causing the "useAuth must be used within an AuthProvider" error
  
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <ProtectedRoute path="/forum" component={ForumPage} />
        <ProtectedRoute path="/forum/new" component={NewQuestionPage} />
        <ProtectedRoute path="/forum/:id" component={QuestionDetailPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/auth" component={LoginPage} /> {/* Default auth route redirects to login */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;

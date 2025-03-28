import { useAuth } from "@/hooks/use-auth";
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Try-catch block to handle potential errors when using auth hooks
  try {
    // We use both auth systems during the migration
    const { user: legacyUser, isLoading: legacyLoading } = useAuth();
    const { user: clerkUser, isLoading: clerkLoading } = useClerkAuth();

    const isLoading = legacyLoading || clerkLoading;
    const isAuthenticated = !!legacyUser || !!clerkUser;

    if (isLoading) {
      return (
        <Route path={path}>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        </Route>
      );
    }

    if (!isAuthenticated) {
      return (
        <Route path={path}>
          <Redirect to="/auth" />
        </Route>
      );
    }

    return <Route path={path} component={Component} />;
  } catch (error) {
    // If there's an error with the auth context, redirect to login
    console.error("Auth error:", error);
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
}
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
    // Now exclusively using Clerk auth
    const { user: clerkUser, isLoading: clerkLoading } = useClerkAuth();

    const isLoading = clerkLoading;
    const isAuthenticated = !!clerkUser;

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
          <Redirect to="/sign-in" />
        </Route>
      );
    }

    return <Route path={path} component={Component} />;
  } catch (error) {
    // If there's an error with the auth context, redirect to login
    console.error("Auth error:", error);
    return (
      <Route path={path}>
        <Redirect to="/sign-in" />
      </Route>
    );
  }
}
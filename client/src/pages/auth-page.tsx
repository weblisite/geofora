import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";

export default function AuthPage() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const [page, setPage] = useState<"login" | "register">("login");
  
  // Determine which form to show based on the URL path
  useEffect(() => {
    if (location === "/login") {
      setPage("login");
    } else if (location === "/register") {
      setPage("register");
    } else {
      // Default to login for /auth or any other path
      setPage("login"); 
    }
  }, [location]);

  // Redirect to home if already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return page === "login" ? <LoginPage /> : <RegisterPage />;
}
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { AppClerkProvider } from "./hooks/use-clerk-auth";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AppClerkProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppClerkProvider>
  </QueryClientProvider>
);

import { useUser } from "@clerk/clerk-react";
import { createContext, useContext, ReactNode } from "react";

interface ClerkAuthContextType {
  user: ReturnType<typeof useUser>["user"];
  isLoading: boolean;
  isSignedIn: boolean;
}

// Default context state
const defaultContext: ClerkAuthContextType = {
  user: null,
  isLoading: true,
  isSignedIn: false,
};

// Create the auth context
const ClerkAuthContext = createContext<ClerkAuthContextType>(defaultContext);

// Provider component that wraps your app and provides the auth context
export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();

  const value = {
    user,
    isLoading: !isLoaded,
    isSignedIn: isSignedIn || false,
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
}

// Hook to use the auth context
export function useClerkAuth() {
  const context = useContext(ClerkAuthContext);
  
  if (context === undefined) {
    console.warn("useClerkAuth was used outside of ClerkAuthProvider; returning default context");
    return defaultContext;
  }
  
  return context;
}
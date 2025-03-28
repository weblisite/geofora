import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  RedirectToSignIn, 
  useUser 
} from '@clerk/clerk-react';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query';
import { User } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Create a Clerk auth context
type ClerkAuthContextType = {
  user: User | null;
  clerkUser: ReturnType<typeof useUser>['user'] | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
};

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

// Provider component for Clerk auth
export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  
  // Define state for the user from our database
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoadingDbUser, setIsLoadingDbUser] = useState<boolean>(false);

  // Fetch user from our database when Clerk user is loaded and signed in
  useEffect(() => {
    const fetchUserFromDb = async () => {
      if (isClerkLoaded && isSignedIn && clerkUser) {
        setIsLoadingDbUser(true);
        try {
          // Try to fetch user from our database based on Clerk user ID
          const response = await apiRequest(`/api/user/${clerkUser.id}`, {
            method: 'GET'
          });
          
          if (response.ok) {
            const userData = await response.json();
            setDbUser(userData);
          } else {
            // User doesn't exist in our database yet, we need to create them
            const createResponse = await apiRequest('/api/user', {
              method: 'POST',
              body: JSON.stringify({
                clerkUserId: clerkUser.id,
                username: clerkUser.username || `user_${clerkUser.id}`,
                email: clerkUser.primaryEmailAddress?.emailAddress || '',
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                avatar: clerkUser.imageUrl || '',
              })
            });
            
            if (createResponse.ok) {
              const newUserData = await createResponse.json();
              setDbUser(newUserData);
              toast({
                title: 'Account created',
                description: 'Your account has been created in our system.',
              });
            } else {
              throw new Error('Failed to create user account');
            }
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'An error occurred fetching user data',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingDbUser(false);
        }
      } else if (isClerkLoaded && !isSignedIn) {
        // Clear user data when signed out
        setDbUser(null);
      }
    };

    fetchUserFromDb();
  }, [isClerkLoaded, isSignedIn, clerkUser, toast]);

  // Sign out function
  const signOut = async () => {
    try {
      // We'll use Clerk's signOut method in the components
      setDbUser(null);
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out',
      });
      setLocation('/');
    } catch (error) {
      toast({
        title: 'Sign out failed',
        description: error instanceof Error ? error.message : 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  // Combine loading states
  const isLoading = !isClerkLoaded || isLoadingDbUser;

  return (
    <ClerkAuthContext.Provider
      value={{
        user: dbUser,
        clerkUser,
        isLoading,
        error: null,
        signOut,
      }}
    >
      {children}
    </ClerkAuthContext.Provider>
  );
}

// Custom hook to use the Clerk auth context
export function useClerkAuth() {
  const context = useContext(ClerkAuthContext);
  
  if (!context) {
    console.warn('useClerkAuth was used outside of ClerkAuthProvider; returning default context');
    return {
      user: null,
      clerkUser: null,
      isLoading: false,
      error: new Error('ClerkAuthProvider not available'),
      signOut: async () => {},
    };
  }
  
  return context;
}

// AppClerkProvider component to wrap the entire app
export function AppClerkProvider({ children }: { children: ReactNode }) {
  const publishableKey = import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string;
  
  if (!publishableKey) {
    console.error('Missing Clerk publishable key');
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkAuthProvider>
        {children}
      </ClerkAuthProvider>
    </ClerkProvider>
  );
}

// ProtectedByClerk component to protect routes
export function ProtectedByClerk({ children }: { children: ReactNode }) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ClerkAuthProvider } from '@/hooks/use-clerk-auth';
import { ENV } from '@/lib/env';

// Get the Clerk publishable key from our environment utility
const clerkPubKey: string = ENV.CLERK_PUBLISHABLE_KEY || '';

// Logging to debug the environment variable issue
console.log('Clerk publishable key status:', {
  envUtilKey: ENV.CLERK_PUBLISHABLE_KEY ? 'Present' : 'Missing',
  finalKey: clerkPubKey ? 'Using a key' : 'No key available'
});

if (!clerkPubKey) {
  console.error('Missing Clerk publishable key');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ClerkAuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ClerkAuthProvider>
    </ClerkProvider>
  </React.StrictMode>
);
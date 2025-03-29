import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to check if the user has an active subscription
 * If not, redirect to the billing section of settings
 * 
 * @param excludePaths - paths that should not trigger a subscription check
 * @param silent - if true, don't show a toast notification when redirecting
 * @returns object with subscription status information
 */
export function useSubscriptionCheck(
  excludePaths: string[] = ['/dashboard/settings'],
  silent: boolean = false
) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { userId } = useAuth();
  const [checked, setChecked] = useState(false);

  // Query subscription data from API
  const { 
    data: subscription, 
    isLoading: isLoadingSubscription,
    error: subscriptionError 
  } = useQuery({
    queryKey: ['/api/users/subscription'],
    enabled: !!userId
  });

  // Check subscription status and redirect if needed
  useEffect(() => {
    if (!userId || isLoadingSubscription || subscriptionError || checked) {
      return;
    }

    // Skip check for excluded paths - typically settings page with billing tab
    const shouldSkipCheck = excludePaths.some(path => location.startsWith(path));
    if (shouldSkipCheck) {
      setChecked(true);
      return;
    }

    // If subscription is inactive or doesn't exist, redirect to settings/billing
    if (subscription && subscription.status !== 'active') {
      if (!silent) {
        toast({
          title: 'Subscription Required',
          description: 'Please choose a subscription plan to continue.',
          variant: 'default'
        });
      }
      setLocation('/dashboard/settings?tab=billing');
    }

    setChecked(true);
  }, [userId, subscription, isLoadingSubscription, subscriptionError, location, setLocation, excludePaths, silent, checked]);

  return {
    subscription,
    isActive: subscription?.status === 'active',
    plan: subscription?.plan,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    checked
  };
}
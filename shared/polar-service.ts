/**
 * Polar.sh API configurations with actual product IDs
 */
export const POLAR_PLAN_IDS = {
  starter: '9dbc8276-eb2a-4b8a-81ec-e3c7962ed314',
  professional: 'cec301e0-e05e-4515-9bc3-297e6833496a',
  enterprise: '5cea5e8b-dd39-4c28-bcb0-0912b17bfcba'
};

/**
 * Handles API requests to Polar.sh
 */
export const polarApi = {
  /**
   * Get subscription information for a user
   */
  getSubscription: async (accessToken: string) => {
    const response = await fetch('https://api.polar.sh/v1/subscriptions', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription information');
    }
    
    return response.json();
  },
  
  /**
   * Get details of a specific subscription by ID
   */
  getSubscriptionById: async (subscriptionId: string, accessToken: string) => {
    const response = await fetch(`https://api.polar.sh/v1/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription details');
    }
    
    return response.json();
  },
  
  /**
   * Get billing history (invoices) for a user
   */
  getBillingHistory: async (accessToken: string) => {
    const response = await fetch('https://api.polar.sh/v1/invoices', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch billing history');
    }
    
    return response.json();
  },
  
  /**
   * Create a new subscription
   */
  createSubscription: async (planId: string, userId: string, accessToken: string) => {
    const response = await fetch('https://api.polar.sh/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plan_id: planId,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }
    
    return response.json();
  },
  
  /**
   * Create a checkout session directly through Polar API
   * @param productId - The Polar product ID
   * @param userId - The Clerk user ID (used for customer identification)
   * @param userEmail - User email for pre-filling checkout form
   * @param userName - User name for pre-filling checkout form
   * @param successUrl - URL to redirect after successful checkout
   * @param withTrial - Whether to include a 7-day free trial
   * @returns Checkout session data including URL and client secret
   */
  createCheckoutSession: async (
    productId: string,
    userId: string,
    userEmail: string,
    userName: string,
    successUrl: string,
    withTrial: boolean = true
  ) => {
    try {
      const polarAccessToken = typeof window === 'undefined' 
        ? process.env.POLAR_ACCESS_TOKEN 
        : import.meta.env.VITE_POLAR_ACCESS_TOKEN;
        
      if (!polarAccessToken) {
        throw new Error('Polar access token not configured');
      }
      
      // Prepare the checkout session request
      const payload: any = {
        products: [productId],
        customer_email: userEmail,
        customer_name: userName,
        customer_external_id: userId, // Use Clerk ID as external ID
        success_url: successUrl,
        metadata: {
          clerkUserId: userId,
          isTrialSignup: withTrial
        }
      };
      
      // If this is a trial, add trial-specific parameters
      if (withTrial) {
        payload.metadata.trialPeriodDays = 7;
        // Trial periods are set at the product level in Polar
        // But we can add this to the metadata for our reference
      }
      
      // Make the API request to create the checkout session
      const response = await fetch('https://api.polar.sh/v1/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${polarAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create Polar checkout session:', errorData);
        throw new Error(`Failed to create checkout session: ${response.statusText}`);
      }
      
      // Return the checkout session data
      const sessionData = await response.json();
      return sessionData;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }
};

/**
 * Get URL for subscribing to a specific plan
 */
export const getSubscriptionUrl = (planId: string, userId: string, returnUrl: string) => {
  return `https://polar.sh/subscribe/${planId}?user_id=${userId}&return_url=${encodeURIComponent(returnUrl)}`;
};

/**
 * Specifies trial-specific parameters for the subscription
 * @param planId - The plan ID 
 * @param userId - The user ID
 * @param returnUrl - The URL to return to after payment
 * @returns Subscription URL with trial parameters
 */
export const getTrialSubscriptionUrl = (planId: string, userId: string, returnUrl: string) => {
  // For trial, we use the same subscription URL but with trial parameters
  // Polar allows setting trial_period_days parameter
  return `https://polar.sh/subscribe/${planId}?user_id=${userId}&return_url=${encodeURIComponent(returnUrl)}&trial_period_days=7`;
};

/**
 * Plan information interface
 */
export interface PlanInfo {
  id: string;
  name: string;
  price: string;
  features: string[];
}

/**
 * Map of plan information by plan ID
 */
export const PLAN_INFO: Record<string, PlanInfo> = {
  [POLAR_PLAN_IDS.starter]: {
    id: POLAR_PLAN_IDS.starter,
    name: 'Starter',
    price: '$99/month',
    features: [
      'Up to 500 AI-generated questions',
      'Up to 10,000 AI-generated answers',
      '20 AI personas',
      'Basic keyword optimization',
      'Lead capture forms',
      'Standard analytics',
    ]
  },
  [POLAR_PLAN_IDS.professional]: {
    id: POLAR_PLAN_IDS.professional,
    name: 'Professional',
    price: '$199/month',
    features: [
      'Unlimited AI-generated questions',
      'Up to 50,000 AI-generated answers',
      '100 AI personas',
      'Advanced keyword optimization',
      'Premium lead capture system',
      'Comprehensive analytics',
      'Custom branding',
      'Advanced interlinking',
    ]
  },
  [POLAR_PLAN_IDS.enterprise]: {
    id: POLAR_PLAN_IDS.enterprise,
    name: 'Enterprise',
    price: '$399/month',
    features: [
      'Everything in Professional',
      'Unlimited AI-generated answers',
      'Unlimited AI personas',
      'Enterprise-grade security',
      'Custom AI training',
      'Advanced API access',
      'Dedicated support team',
      'Custom integrations',
    ]
  }
};
/**
 * Polar.sh API configurations with actual product IDs and checkout links
 */
export const POLAR_PLAN_IDS = {
  starter: '9dbc8276-eb2a-4b8a-81ec-e3c7962ed314',
  professional: 'cec301e0-e05e-4515-9bc3-297e6833496a',
  enterprise: '5cea5e8b-dd39-4c28-bcb0-0912b17bfcba'
};

/**
 * Direct checkout links from Polar dashboard
 */
export const POLAR_CHECKOUT_LINKS = {
  starter: 'https://buy.polar.sh/polar_cl_saQVhkF5OgG3xuhn3eZm5G3gQUA0rAx17BHB43INwPN',
  professional: 'https://buy.polar.sh/polar_cl_oCymEewojyAWOZOHjZJRC1PQGo0ES0Tu2eeVh1S3N6Y',
  enterprise: 'https://buy.polar.sh/polar_cl_bXNvmdougqf83av9fFAH1DA6y3ghNMzf5Kzwy38RLVX'
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
  }
};

/**
 * Get URL for subscribing to a specific plan
 * @param planType - The plan type (starter, professional, enterprise)
 * @param userId - The user ID
 * @param returnUrl - The URL to return to after payment
 * @returns Subscription URL with proper parameters
 */
export const getSubscriptionUrl = (planType: string, userId: string, returnUrl: string) => {
  // Get the direct checkout link for the specified plan type
  const baseUrl = POLAR_CHECKOUT_LINKS[planType as keyof typeof POLAR_CHECKOUT_LINKS];
  
  if (!baseUrl) {
    throw new Error(`Invalid plan type: ${planType}`);
  }
  
  // For Polar checkout URLs, we need to use their specific format
  const polarUrl = new URL(baseUrl);
  
  // Add parameters to the URL - user_id and return_url
  polarUrl.searchParams.append('user_id', userId);
  polarUrl.searchParams.append('return_url', returnUrl);
  
  return polarUrl.toString();
};

/**
 * Specifies trial-specific parameters for the subscription
 * @param planType - The plan type (starter, professional, enterprise)
 * @param userId - The user ID
 * @param returnUrl - The URL to return to after payment
 * @returns Subscription URL with trial parameters
 */
export const getTrialSubscriptionUrl = (planType: string, userId: string, returnUrl: string) => {
  // Get the direct checkout link for the specified plan type
  const baseUrl = POLAR_CHECKOUT_LINKS[planType as keyof typeof POLAR_CHECKOUT_LINKS];
  
  if (!baseUrl) {
    throw new Error(`Invalid plan type: ${planType}`);
  }
  
  // For Polar checkout URLs, we need to use their specific format
  const polarUrl = new URL(baseUrl);
  
  // Add basic parameters - user_id and return_url
  polarUrl.searchParams.append('user_id', userId);
  polarUrl.searchParams.append('return_url', returnUrl);
  
  // Try multiple possible trial parameter formats
  // One of these might be the correct format for Polar
  polarUrl.searchParams.append('trial_period_days', '7');
  polarUrl.searchParams.append('trial_days', '7');
  polarUrl.searchParams.append('trial_period', '7');
  polarUrl.searchParams.append('trial', '7');
  
  return polarUrl.toString();
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
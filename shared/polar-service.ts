/**
 * Polar.sh API configurations
 */
export const POLAR_PLAN_IDS = {
  starter: 'starter-plan',
  professional: 'professional-plan',
  enterprise: 'enterprise-plan'
};

/**
 * Handles API requests to Polar.sh
 */
export const polarApi = {
  /**
   * Get subscription information
   */
  getSubscription: async (userId: string, accessToken: string) => {
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
 */
export const getSubscriptionUrl = (planId: string, userId: string, returnUrl: string) => {
  return `https://polar.sh/subscribe/${planId}?user_id=${userId}&return_url=${encodeURIComponent(returnUrl)}`;
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
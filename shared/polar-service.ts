/**
 * Polar.sh API configurations with actual product IDs
 */
export const POLAR_PLAN_IDS = {
  starter: 'd0730b9c-f150-47fb-b07c-8e523b246db8',
  professional: '66a68545-b8ea-46ca-b508-fc39bf0a8c50',
  enterprise: '80465f02-cc68-4791-a688-b6238dfdbd5c',
  setupFee: '1038c474-8c95-4d7d-be31-f23edbbb2bae'
};

/**
 * Direct checkout links for Polar.sh
 * These are the actual working checkout links from the Polar dashboard
 */
export const POLAR_CHECKOUT_LINKS = {
  starter: `https://buy.polar.sh/polar_cl_z9PxBnvvDTjfSb4IDOmOM30W2bfIwFaHt16bc4DiGaH`,
  professional: `https://buy.polar.sh/polar_cl_nNegJ32BTcR5bIUglohIVHhs1LAeQWDadbzBd2ySeZe`,
  enterprise: `https://buy.polar.sh/polar_cl_H7ppbjjjsOm32HWpElBG4Xt9BbPxm9hMrtNW81LfOyo`,
  setupFee: `https://buy.polar.sh/polar_cl_T0pfP9bMQg3bsxRGp6WemJcviEfGcPXRs85nx3pd2Qh`
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
 * Map of plan information by plan ID - Updated for PRD
 */
export const PLAN_INFO: Record<string, PlanInfo> = {
  [POLAR_PLAN_IDS.starter]: {
    id: POLAR_PLAN_IDS.starter,
    name: 'Starter',
    price: '$299/month',
    features: [
      '1 AI Provider (OpenAI)',
      '2 AI Personas (LegacyBot, Scholar)',
      '30 questions per day',
      '2 responses per question',
      '60 AI conversations per day',
      'Basic Business Analysis',
      'Standard SEO Features',
      'Email Support',
      'Up to 900 Q&A pairs per month',
      'Basic Analytics Dashboard',
      'Data Anonymization Pipeline',
      'Consent Management System'
    ]
  },
  [POLAR_PLAN_IDS.professional]: {
    id: POLAR_PLAN_IDS.professional,
    name: 'Pro',
    price: '$499/month',
    features: [
      '3 AI Providers (OpenAI, Anthropic, DeepSeek)',
      '5 AI Personas (LegacyBot, Scholar, Sage, TechnicalExpert, MetaLlama)',
      '100 questions per day',
      '5 responses per question',
      '500 AI conversations per day',
      'Advanced Business Analysis',
      'Advanced SEO Features',
      'Priority Support',
      'Up to 3,000 Q&A pairs per month',
      'Advanced Analytics Dashboard',
      'Brand Voice Integration',
      'Industry Detection Algorithm',
      'Sequential Response System',
      'Context Awareness System',
      'Personality Consistency System'
    ]
  },
  [POLAR_PLAN_IDS.enterprise]: {
    id: POLAR_PLAN_IDS.enterprise,
    name: 'Enterprise',
    price: '$999/month',
    features: [
      'All 6 AI Providers (OpenAI, Anthropic, DeepSeek, Google, Meta, XAI)',
      'All 8 AI Personas (LegacyBot, Scholar, Sage, TechnicalExpert, MetaLlama, Oracle, GlobalContext, GrokWit)',
      '250 questions per day',
      '8 responses per question',
      '2,000 AI conversations per day',
      'Complete Business Analysis Suite',
      'Complete SEO Suite',
      'Dedicated Support',
      'Up to 7,500 Q&A pairs per month',
      'Complete Analytics Suite',
      'Complete Brand Voice Integration',
      'Complete Industry Detection',
      'Complete Sequential Responses',
      'Context Awareness System',
      'Personality Consistency System',
      'Data Export Functionality',
      'Privacy Controls & GDPR Compliance',
      'Custom Integrations',
      'SLA Guarantee',
      'Custom AI Model Training ($2K-$10K per model)'
    ]
  }
};

/**
 * Setup fee configuration for PRD
 */
export const SETUP_FEE_CONFIG = {
  AMOUNT: 100000, // $1,000 in cents
  CURRENCY: 'usd',
  DESCRIPTION: 'One-time setup fee for GEOFORA platform access',
  REQUIRED_FOR: ['starter', 'professional', 'enterprise'] as const
} as const;
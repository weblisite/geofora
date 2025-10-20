/**
 * Industry Detection Algorithm
 * Implements PRD requirements for intelligent industry detection
 */

import { aiProviderGateway } from '../ai-providers/gateway';
import { AIChatMessage } from '../ai-providers/types';

export interface IndustryProfile {
  industry: string;
  subIndustry?: string;
  confidence: number;
  keywords: string[];
  competitors: string[];
  trends: string[];
  marketSize?: string;
  growthRate?: string;
  targetAudience: string[];
  painPoints: string[];
  opportunities: string[];
}

export interface IndustryDetectionResult {
  primaryIndustry: IndustryProfile;
  secondaryIndustries: IndustryProfile[];
  detectedKeywords: string[];
  industryScore: number;
  recommendations: string[];
}

export interface IndustryData {
  name: string;
  keywords: string[];
  competitors: string[];
  trends: string[];
  marketSize: string;
  growthRate: string;
  targetAudience: string[];
  painPoints: string[];
  opportunities: string[];
}

// Comprehensive industry database
const INDUSTRY_DATABASE: Record<string, IndustryData> = {
  'technology': {
    name: 'Technology',
    keywords: ['software', 'SaaS', 'AI', 'machine learning', 'cloud', 'API', 'development', 'programming', 'tech', 'innovation', 'digital', 'automation'],
    competitors: ['Microsoft', 'Google', 'Amazon', 'Salesforce', 'Oracle', 'IBM', 'Adobe'],
    trends: ['AI Integration', 'Cloud Migration', 'DevOps', 'Microservices', 'Edge Computing', 'Quantum Computing'],
    marketSize: '$5.2 trillion',
    growthRate: '8.5%',
    targetAudience: ['Developers', 'CTOs', 'IT Managers', 'Startups', 'Enterprises'],
    painPoints: ['Scalability', 'Security', 'Integration', 'Cost Management', 'Talent Acquisition'],
    opportunities: ['AI Adoption', 'Digital Transformation', 'Cloud Services', 'Cybersecurity']
  },
  'healthcare': {
    name: 'Healthcare',
    keywords: ['medical', 'health', 'patient', 'hospital', 'clinic', 'pharmaceutical', 'telemedicine', 'EHR', 'diagnosis', 'treatment', 'wellness'],
    competitors: ['Epic', 'Cerner', 'Allscripts', 'athenahealth', 'NextGen', 'Meditech'],
    trends: ['Telemedicine', 'AI Diagnostics', 'Wearable Technology', 'Precision Medicine', 'Digital Health'],
    marketSize: '$4.1 trillion',
    growthRate: '6.2%',
    targetAudience: ['Doctors', 'Nurses', 'Healthcare Administrators', 'Patients', 'Medical Researchers'],
    painPoints: ['Regulatory Compliance', 'Data Security', 'Interoperability', 'Cost Reduction', 'Patient Outcomes'],
    opportunities: ['Digital Health', 'AI Diagnostics', 'Telemedicine', 'Precision Medicine']
  },
  'finance': {
    name: 'Financial Services',
    keywords: ['banking', 'fintech', 'investment', 'trading', 'payment', 'lending', 'insurance', 'wealth management', 'cryptocurrency', 'blockchain'],
    competitors: ['JPMorgan', 'Bank of America', 'Wells Fargo', 'Goldman Sachs', 'PayPal', 'Square', 'Stripe'],
    trends: ['Digital Banking', 'Cryptocurrency', 'AI Trading', 'Open Banking', 'RegTech', 'InsurTech'],
    marketSize: '$2.7 trillion',
    growthRate: '7.8%',
    targetAudience: ['Bankers', 'Investors', 'Financial Advisors', 'Small Businesses', 'Consumers'],
    painPoints: ['Regulatory Compliance', 'Fraud Prevention', 'Customer Experience', 'Digital Transformation', 'Risk Management'],
    opportunities: ['Fintech Innovation', 'Digital Banking', 'Cryptocurrency', 'AI Trading']
  },
  'ecommerce': {
    name: 'E-commerce',
    keywords: ['online store', 'shopping', 'retail', 'marketplace', 'inventory', 'shipping', 'customer service', 'sales', 'marketing', 'conversion'],
    competitors: ['Amazon', 'eBay', 'Shopify', 'WooCommerce', 'Magento', 'BigCommerce'],
    trends: ['Mobile Commerce', 'Social Commerce', 'Voice Commerce', 'AR/VR Shopping', 'Subscription Models'],
    marketSize: '$4.9 trillion',
    growthRate: '12.4%',
    targetAudience: ['Online Retailers', 'Small Businesses', 'Consumers', 'Marketing Teams'],
    painPoints: ['Customer Acquisition', 'Inventory Management', 'Shipping Costs', 'Competition', 'Customer Retention'],
    opportunities: ['Mobile Commerce', 'Social Commerce', 'Personalization', 'Omnichannel']
  },
  'education': {
    name: 'Education',
    keywords: ['learning', 'training', 'course', 'student', 'teacher', 'school', 'university', 'online learning', 'edtech', 'certification'],
    competitors: ['Coursera', 'Udemy', 'Khan Academy', 'edX', 'Blackboard', 'Canvas'],
    trends: ['Online Learning', 'AI Tutoring', 'Microlearning', 'VR Education', 'Gamification'],
    marketSize: '$1.6 trillion',
    growthRate: '9.1%',
    targetAudience: ['Students', 'Teachers', 'Educational Institutions', 'Corporate Trainers'],
    painPoints: ['Student Engagement', 'Accessibility', 'Cost', 'Technology Integration', 'Assessment'],
    opportunities: ['Online Learning', 'AI Tutoring', 'Personalized Education', 'Skill Development']
  },
  'manufacturing': {
    name: 'Manufacturing',
    keywords: ['production', 'factory', 'automation', 'supply chain', 'quality control', 'machinery', 'industrial', 'logistics', 'inventory'],
    competitors: ['General Electric', 'Siemens', 'Caterpillar', '3M', 'Honeywell', 'Schneider Electric'],
    trends: ['Industry 4.0', 'IoT', 'Robotics', 'Predictive Maintenance', 'Smart Manufacturing'],
    marketSize: '$2.3 trillion',
    growthRate: '5.7%',
    targetAudience: ['Manufacturing Managers', 'Engineers', 'Operations Teams', 'Supply Chain Managers'],
    painPoints: ['Efficiency', 'Quality Control', 'Supply Chain', 'Cost Reduction', 'Sustainability'],
    opportunities: ['Automation', 'IoT Integration', 'Predictive Maintenance', 'Smart Manufacturing']
  },
  'realestate': {
    name: 'Real Estate',
    keywords: ['property', 'real estate', 'housing', 'commercial', 'residential', 'brokerage', 'mortgage', 'investment', 'development'],
    competitors: ['Zillow', 'Realtor.com', 'Redfin', 'Compass', 'Keller Williams', 'RE/MAX'],
    trends: ['PropTech', 'Virtual Tours', 'AI Valuation', 'Smart Buildings', 'Sustainable Development'],
    marketSize: '$3.7 trillion',
    growthRate: '4.3%',
    targetAudience: ['Real Estate Agents', 'Property Investors', 'Home Buyers', 'Developers'],
    painPoints: ['Market Volatility', 'Transaction Costs', 'Regulatory Changes', 'Technology Adoption'],
    opportunities: ['PropTech', 'Virtual Tours', 'AI Valuation', 'Smart Buildings']
  },
  'marketing': {
    name: 'Marketing & Advertising',
    keywords: ['marketing', 'advertising', 'brand', 'campaign', 'social media', 'content', 'SEO', 'analytics', 'conversion', 'lead generation'],
    competitors: ['Google', 'Facebook', 'Amazon', 'Adobe', 'HubSpot', 'Salesforce'],
    trends: ['AI Marketing', 'Personalization', 'Voice Search', 'Video Marketing', 'Privacy-First Marketing'],
    marketSize: '$1.3 trillion',
    growthRate: '11.2%',
    targetAudience: ['Marketing Managers', 'Brand Managers', 'Content Creators', 'Agencies'],
    painPoints: ['ROI Measurement', 'Customer Acquisition', 'Data Privacy', 'Content Creation', 'Competition'],
    opportunities: ['AI Marketing', 'Personalization', 'Video Marketing', 'Privacy-First Marketing']
  },
  'consulting': {
    name: 'Professional Services',
    keywords: ['consulting', 'advisory', 'strategy', 'management', 'business', 'professional services', 'expertise', 'solutions'],
    competitors: ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'PwC', 'EY'],
    trends: ['Digital Transformation', 'AI Consulting', 'Sustainability', 'Remote Consulting', 'Industry Specialization'],
    marketSize: '$1.8 trillion',
    growthRate: '6.8%',
    targetAudience: ['Business Leaders', 'C-Suite Executives', 'Management Teams', 'Entrepreneurs'],
    painPoints: ['Digital Transformation', 'Competitive Advantage', 'Operational Efficiency', 'Talent Management'],
    opportunities: ['Digital Transformation', 'AI Consulting', 'Sustainability', 'Industry Specialization']
  },
  'retail': {
    name: 'Retail',
    keywords: ['retail', 'store', 'shopping', 'customer', 'inventory', 'sales', 'merchandise', 'brand', 'consumer'],
    competitors: ['Walmart', 'Target', 'Costco', 'Home Depot', 'Lowe\'s', 'Best Buy'],
    trends: ['Omnichannel', 'Personalization', 'Sustainability', 'Contactless Commerce', 'Social Commerce'],
    marketSize: '$5.1 trillion',
    growthRate: '3.9%',
    targetAudience: ['Retail Managers', 'Store Owners', 'Brand Managers', 'Consumers'],
    painPoints: ['Competition', 'Customer Experience', 'Inventory Management', 'Digital Transformation'],
    opportunities: ['Omnichannel', 'Personalization', 'Sustainability', 'Contactless Commerce']
  }
};

export class IndustryDetectionAlgorithm {
  private industryDatabase: Record<string, IndustryData>;

  constructor(industryDatabase: Record<string, IndustryData> = INDUSTRY_DATABASE) {
    this.industryDatabase = industryDatabase;
  }

  /**
   * Detect industry from text content
   */
  async detectIndustryFromText(text: string): Promise<IndustryDetectionResult> {
    try {
      // Extract keywords from text
      const extractedKeywords = this.extractKeywords(text);
      
      // Score industries based on keyword matches
      const industryScores = this.scoreIndustries(extractedKeywords);
      
      // Get primary industry
      const primaryIndustry = this.getIndustryProfile(industryScores[0].industry);
      
      // Get secondary industries
      const secondaryIndustries = industryScores
        .slice(1, 4)
        .map(score => this.getIndustryProfile(score.industry));
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(primaryIndustry, extractedKeywords);
      
      return {
        primaryIndustry,
        secondaryIndustries,
        detectedKeywords: extractedKeywords,
        industryScore: industryScores[0].score,
        recommendations
      };
    } catch (error) {
      console.error('Error detecting industry from text:', error);
      throw error;
    }
  }

  /**
   * Detect industry from website content
   */
  async detectIndustryFromWebsite(websiteUrl: string): Promise<IndustryDetectionResult> {
    try {
      // This would typically scrape the website content
      // For now, we'll use a mock implementation
      const mockContent = await this.scrapeWebsiteContent(websiteUrl);
      return this.detectIndustryFromText(mockContent);
    } catch (error) {
      console.error('Error detecting industry from website:', error);
      throw error;
    }
  }

  /**
   * Detect industry from business description
   */
  async detectIndustryFromDescription(description: string): Promise<IndustryDetectionResult> {
    try {
      // Use AI to enhance industry detection
      const enhancedDescription = await this.enhanceDescriptionWithAI(description);
      return this.detectIndustryFromText(enhancedDescription);
    } catch (error) {
      console.error('Error detecting industry from description:', error);
      throw error;
    }
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Remove common stop words
    const stopWords = new Set([
      'this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been',
      'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like',
      'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
    ]);

    const filteredWords = words.filter(word => !stopWords.has(word));
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    filteredWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * Score industries based on keyword matches
   */
  private scoreIndustries(keywords: string[]): Array<{ industry: string; score: number }> {
    const scores: Array<{ industry: string; score: number }> = [];

    for (const [industryName, industryData] of Object.entries(this.industryDatabase)) {
      let score = 0;
      
      // Score based on keyword matches
      keywords.forEach(keyword => {
        if (industryData.keywords.includes(keyword)) {
          score += 2; // Exact match
        } else if (industryData.keywords.some(ik => ik.includes(keyword) || keyword.includes(ik))) {
          score += 1; // Partial match
        }
      });

      // Bonus for multiple keyword matches
      const exactMatches = keywords.filter(keyword => industryData.keywords.includes(keyword)).length;
      if (exactMatches > 0) {
        score += exactMatches * 0.5;
      }

      scores.push({ industry: industryName, score });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get industry profile
   */
  private getIndustryProfile(industryName: string): IndustryProfile {
    const industryData = this.industryDatabase[industryName];
    if (!industryData) {
      throw new Error(`Industry ${industryName} not found in database`);
    }

    return {
      industry: industryData.name,
      confidence: 0.8, // This would be calculated based on score
      keywords: industryData.keywords,
      competitors: industryData.competitors,
      trends: industryData.trends,
      marketSize: industryData.marketSize,
      growthRate: industryData.growthRate,
      targetAudience: industryData.targetAudience,
      painPoints: industryData.painPoints,
      opportunities: industryData.opportunities
    };
  }

  /**
   * Generate recommendations based on industry
   */
  private generateRecommendations(industry: IndustryProfile, keywords: string[]): string[] {
    const recommendations: string[] = [];

    // Industry-specific recommendations
    recommendations.push(`Focus on ${industry.trends[0]} to stay competitive in ${industry.industry}`);
    recommendations.push(`Address ${industry.painPoints[0]} to improve customer satisfaction`);
    recommendations.push(`Explore ${industry.opportunities[0]} for growth opportunities`);

    // Keyword-based recommendations
    if (keywords.includes('ai') || keywords.includes('artificial intelligence')) {
      recommendations.push('Consider AI integration for competitive advantage');
    }
    if (keywords.includes('mobile') || keywords.includes('app')) {
      recommendations.push('Develop mobile-first strategies for better user engagement');
    }
    if (keywords.includes('cloud') || keywords.includes('saas')) {
      recommendations.push('Implement cloud-based solutions for scalability');
    }

    return recommendations;
  }

  /**
   * Enhance description with AI
   */
  private async enhanceDescriptionWithAI(description: string): Promise<string> {
    try {
      const prompt = `Analyze the following business description and provide additional context about the industry, market, and business model. Return a comprehensive description that includes industry-specific terminology and context.

Business Description: ${description}

Provide an enhanced description that includes:
1. Industry classification
2. Market context
3. Business model insights
4. Key terminology
5. Competitive landscape`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 500
      });

      return `${description} ${response.content}`;
    } catch (error) {
      console.error('Error enhancing description with AI:', error);
      return description; // Return original if AI enhancement fails
    }
  }

  /**
   * Scrape website content (mock implementation)
   */
  private async scrapeWebsiteContent(websiteUrl: string): Promise<string> {
    // This would typically use a web scraping library
    // For now, return mock content based on URL
    const mockContent = `
      This is a mock website content for ${websiteUrl}.
      The website appears to be related to technology and software development.
      It offers various services including web development, mobile apps, and cloud solutions.
      The company focuses on innovation and digital transformation.
    `;
    
    return mockContent;
  }

  /**
   * Get industry insights
   */
  async getIndustryInsights(industry: string): Promise<{
    marketTrends: string[];
    growthOpportunities: string[];
    competitiveLandscape: string[];
    targetAudience: string[];
    painPoints: string[];
  }> {
    const industryData = this.industryDatabase[industry.toLowerCase()];
    if (!industryData) {
      throw new Error(`Industry ${industry} not found`);
    }

    return {
      marketTrends: industryData.trends,
      growthOpportunities: industryData.opportunities,
      competitiveLandscape: industryData.competitors,
      targetAudience: industryData.targetAudience,
      painPoints: industryData.painPoints
    };
  }

  /**
   * Compare industries
   */
  compareIndustries(industry1: string, industry2: string): {
    similarities: string[];
    differences: string[];
    recommendations: string[];
  } {
    const data1 = this.industryDatabase[industry1.toLowerCase()];
    const data2 = this.industryDatabase[industry2.toLowerCase()];

    if (!data1 || !data2) {
      throw new Error('One or both industries not found');
    }

    const similarities = data1.keywords.filter(keyword => 
      data2.keywords.includes(keyword)
    );

    const differences = [
      ...data1.keywords.filter(keyword => !data2.keywords.includes(keyword)),
      ...data2.keywords.filter(keyword => !data1.keywords.includes(keyword))
    ];

    const recommendations = [
      `Consider ${data1.name} trends: ${data1.trends[0]}`,
      `Consider ${data2.name} trends: ${data2.trends[0]}`,
      `Address common pain points: ${data1.painPoints[0]}`
    ];

    return {
      similarities,
      differences,
      recommendations
    };
  }

  /**
   * Get all available industries
   */
  getAllIndustries(): string[] {
    return Object.keys(this.industryDatabase);
  }

  /**
   * Add custom industry
   */
  addCustomIndustry(industryName: string, industryData: IndustryData): void {
    this.industryDatabase[industryName.toLowerCase()] = industryData;
  }

  /**
   * Update industry data
   */
  updateIndustryData(industryName: string, updates: Partial<IndustryData>): void {
    const industryData = this.industryDatabase[industryName.toLowerCase()];
    if (industryData) {
      Object.assign(industryData, updates);
    }
  }

  /**
   * Get industry statistics
   */
  getIndustryStatistics(): {
    totalIndustries: number;
    averageKeywordsPerIndustry: number;
    totalKeywords: number;
    mostCommonKeywords: string[];
  } {
    const industries = Object.values(this.industryDatabase);
    const totalKeywords = industries.reduce((sum, industry) => sum + industry.keywords.length, 0);
    
    // Find most common keywords across industries
    const keywordCount: Record<string, number> = {};
    industries.forEach(industry => {
      industry.keywords.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });

    const mostCommonKeywords = Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);

    return {
      totalIndustries: industries.length,
      averageKeywordsPerIndustry: totalKeywords / industries.length,
      totalKeywords,
      mostCommonKeywords
    };
  }
}

// Export singleton instance
export const industryDetectionAlgorithm = new IndustryDetectionAlgorithm();

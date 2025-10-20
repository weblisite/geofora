/**
 * Business Analysis Engine
 * Implements PRD requirements for business context integration and industry detection
 */

export interface BusinessContext {
  organizationId: number;
  industry: string;
  brandVoice: string;
  targetKeywords: string[];
  websiteUrl?: string;
  productDescription?: string;
  companyName?: string;
  businessType?: string;
  targetAudience?: string;
  valueProposition?: string;
}

export interface IndustryAnalysis {
  detectedIndustry: string;
  confidence: number;
  keywords: string[];
  competitors: string[];
  marketSize?: string;
  trends: string[];
}

export interface BusinessProfile {
  context: BusinessContext;
  industryAnalysis: IndustryAnalysis;
  seoKeywords: string[];
  contentStrategy: ContentStrategy;
  brandGuidelines: BrandGuidelines;
}

export interface ContentStrategy {
  tone: string;
  style: string;
  topics: string[];
  keywords: string[];
  contentTypes: string[];
}

export interface BrandGuidelines {
  voice: string;
  personality: string[];
  values: string[];
  messaging: string[];
  avoidTerms: string[];
}

export class BusinessAnalysisEngine {
  private industryKeywords: Record<string, string[]> = {
    'technology': ['software', 'app', 'tech', 'digital', 'innovation', 'AI', 'machine learning', 'cloud', 'saas'],
    'software-development': ['software', 'development', 'programming', 'coding', 'application', 'api', 'framework'],
    'mobile-apps': ['mobile', 'app', 'iOS', 'Android', 'smartphone', 'tablet', 'app store'],
    'web-development': ['web', 'website', 'frontend', 'backend', 'full-stack', 'react', 'node', 'javascript'],
    'cybersecurity': ['security', 'cybersecurity', 'protection', 'threat', 'vulnerability', 'firewall', 'encryption'],
    'artificial-intelligence': ['AI', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network'],
    'data-science': ['data science', 'analytics', 'big data', 'statistics', 'modeling', 'python', 'r'],
    'cloud-computing': ['cloud', 'AWS', 'Azure', 'Google Cloud', 'infrastructure', 'serverless'],
    'blockchain': ['blockchain', 'cryptocurrency', 'DeFi', 'NFT', 'smart contracts', 'ethereum'],
    'virtual-reality': ['VR', 'virtual reality', 'augmented reality', 'AR', 'immersive', 'metaverse'],
    'robotics': ['robotics', 'automation', 'AI', 'manufacturing', 'industrial', 'robot'],
    'quantum-computing': ['quantum computing', 'quantum', 'computing', 'physics', 'algorithm'],
    'nanotechnology': ['nanotechnology', 'nano', 'materials science', 'engineering'],
    'biotechnology': ['biotechnology', 'biotech', 'life sciences', 'genetics', 'pharmaceutical'],
    'healthcare': ['healthcare', 'medical', 'health', 'medicine', 'clinical', 'patient', 'hospital'],
    'finance': ['finance', 'banking', 'fintech', 'investment', 'trading', 'cryptocurrency'],
    'e-commerce': ['e-commerce', 'online store', 'shopping', 'retail', 'marketplace', 'amazon'],
    'education': ['education', 'learning', 'training', 'course', 'university', 'student'],
    'marketing': ['marketing', 'advertising', 'promotion', 'brand', 'campaign', 'social media'],
    'consulting': ['consulting', 'advisory', 'strategy', 'business', 'management', 'consultant']
  };

  /**
   * Analyze business context from website and provided information
   */
  async analyzeBusiness(
    websiteUrl?: string,
    productDescription?: string,
    companyName?: string,
    additionalInfo?: string
  ): Promise<BusinessProfile> {
    try {
      // Step 1: Detect industry
      const industryAnalysis = await this.detectIndustry(websiteUrl, productDescription, companyName, additionalInfo);
      
      // Step 2: Extract business context
      const context = await this.extractBusinessContext(industryAnalysis, websiteUrl, productDescription, companyName);
      
      // Step 3: Generate SEO keywords
      const seoKeywords = await this.generateSEOKeywords(context, industryAnalysis);
      
      // Step 4: Create content strategy
      const contentStrategy = await this.createContentStrategy(context, industryAnalysis);
      
      // Step 5: Define brand guidelines
      const brandGuidelines = await this.createBrandGuidelines(context, industryAnalysis);

      return {
        context,
        industryAnalysis,
        seoKeywords,
        contentStrategy,
        brandGuidelines
      };
    } catch (error) {
      console.error('Error analyzing business:', error);
      throw error;
    }
  }

  /**
   * Detect industry using multi-layered approach as per PRD
   */
  private async detectIndustry(
    websiteUrl?: string,
    productDescription?: string,
    companyName?: string,
    additionalInfo?: string
  ): Promise<IndustryAnalysis> {
    const allText = [productDescription, companyName, additionalInfo].filter(Boolean).join(' ');
    
    // Keyword-based detection
    const keywordScores: Record<string, number> = {};
    
    for (const [industry, keywords] of Object.entries(this.industryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = allText.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      keywordScores[industry] = score;
    }

    // Find the industry with highest score
    const detectedIndustry = Object.entries(keywordScores)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    const confidence = Math.min(keywordScores[detectedIndustry] / 10, 1);

    // Generate industry-specific insights
    const industryKeywords = this.industryKeywords[detectedIndustry] || [];
    const competitors = this.getIndustryCompetitors(detectedIndustry);
    const trends = this.getIndustryTrends(detectedIndustry);

    return {
      detectedIndustry,
      confidence,
      keywords: industryKeywords,
      competitors,
      trends
    };
  }

  /**
   * Extract business context from analysis
   */
  private async extractBusinessContext(
    industryAnalysis: IndustryAnalysis,
    websiteUrl?: string,
    productDescription?: string,
    companyName?: string
  ): Promise<BusinessContext> {
    return {
      organizationId: 0, // Will be set by caller
      industry: industryAnalysis.detectedIndustry,
      brandVoice: this.determineBrandVoice(industryAnalysis.detectedIndustry),
      targetKeywords: industryAnalysis.keywords.slice(0, 10),
      websiteUrl,
      productDescription,
      companyName,
      businessType: this.determineBusinessType(industryAnalysis.detectedIndustry),
      targetAudience: this.determineTargetAudience(industryAnalysis.detectedIndustry),
      valueProposition: this.generateValueProposition(industryAnalysis.detectedIndustry)
    };
  }

  /**
   * Generate SEO keywords based on business context
   */
  private async generateSEOKeywords(
    context: BusinessContext,
    industryAnalysis: IndustryAnalysis
  ): Promise<string[]> {
    const keywords = new Set<string>();
    
    // Add industry keywords
    industryAnalysis.keywords.forEach(keyword => keywords.add(keyword));
    
    // Add business-specific keywords
    if (context.productDescription) {
      const words = context.productDescription.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !['the', 'and', 'for', 'with', 'this', 'that'].includes(word)) {
          keywords.add(word);
        }
      });
    }
    
    // Add company name variations
    if (context.companyName) {
      keywords.add(context.companyName.toLowerCase());
      const nameWords = context.companyName.toLowerCase().split(/\s+/);
      nameWords.forEach(word => keywords.add(word));
    }
    
    return Array.from(keywords).slice(0, 50);
  }

  /**
   * Create content strategy based on business analysis
   */
  private async createContentStrategy(
    context: BusinessContext,
    industryAnalysis: IndustryAnalysis
  ): Promise<ContentStrategy> {
    return {
      tone: context.brandVoice,
      style: this.determineContentStyle(context.industry),
      topics: this.generateContentTopics(context.industry),
      keywords: context.targetKeywords,
      contentTypes: this.determineContentTypes(context.industry)
    };
  }

  /**
   * Create brand guidelines based on analysis
   */
  private async createBrandGuidelines(
    context: BusinessContext,
    industryAnalysis: IndustryAnalysis
  ): Promise<BrandGuidelines> {
    return {
      voice: context.brandVoice,
      personality: this.determineBrandPersonality(context.industry),
      values: this.determineBrandValues(context.industry),
      messaging: this.generateMessaging(context.industry),
      avoidTerms: this.determineAvoidTerms(context.industry)
    };
  }

  /**
   * Determine brand voice based on industry
   */
  private determineBrandVoice(industry: string): string {
    const voiceMap: Record<string, string> = {
      'technology': 'innovative and forward-thinking',
      'healthcare': 'professional and trustworthy',
      'finance': 'reliable and secure',
      'education': 'inspiring and knowledgeable',
      'marketing': 'creative and engaging',
      'consulting': 'expert and strategic',
      'e-commerce': 'friendly and helpful',
      'cybersecurity': 'technical and security-focused',
      'artificial-intelligence': 'cutting-edge and intelligent',
      'data-science': 'analytical and precise'
    };
    
    return voiceMap[industry] || 'professional and informative';
  }

  /**
   * Determine business type
   */
  private determineBusinessType(industry: string): string {
    if (['software-development', 'mobile-apps', 'web-development'].includes(industry)) {
      return 'SaaS';
    } else if (['e-commerce'].includes(industry)) {
      return 'E-commerce';
    } else if (['consulting'].includes(industry)) {
      return 'Consulting';
    } else if (['education'].includes(industry)) {
      return 'Education';
    } else {
      return 'Technology';
    }
  }

  /**
   * Determine target audience
   */
  private determineTargetAudience(industry: string): string {
    const audienceMap: Record<string, string> = {
      'technology': 'tech professionals and businesses',
      'healthcare': 'healthcare professionals and patients',
      'finance': 'financial professionals and consumers',
      'education': 'students and educators',
      'marketing': 'marketers and business owners',
      'consulting': 'business leaders and executives',
      'e-commerce': 'online shoppers and retailers',
      'cybersecurity': 'IT professionals and security teams',
      'artificial-intelligence': 'developers and data scientists',
      'data-science': 'analysts and researchers'
    };
    
    return audienceMap[industry] || 'business professionals';
  }

  /**
   * Generate value proposition
   */
  private generateValueProposition(industry: string): string {
    const propositions: Record<string, string> = {
      'technology': 'Innovative solutions that drive digital transformation',
      'healthcare': 'Improving patient outcomes through technology',
      'finance': 'Secure and efficient financial solutions',
      'education': 'Empowering learning through technology',
      'marketing': 'Data-driven marketing strategies that deliver results',
      'consulting': 'Strategic guidance for business growth',
      'e-commerce': 'Seamless online shopping experiences',
      'cybersecurity': 'Protecting businesses from digital threats',
      'artificial-intelligence': 'AI-powered solutions for modern challenges',
      'data-science': 'Transforming data into actionable insights'
    };
    
    return propositions[industry] || 'Delivering value through innovation';
  }

  /**
   * Get industry competitors
   */
  private getIndustryCompetitors(industry: string): string[] {
    const competitors: Record<string, string[]> = {
      'technology': ['Microsoft', 'Google', 'Apple', 'Amazon'],
      'healthcare': ['Epic', 'Cerner', 'Allscripts', 'athenahealth'],
      'finance': ['PayPal', 'Stripe', 'Square', 'Adyen'],
      'education': ['Coursera', 'Udemy', 'Khan Academy', 'edX'],
      'marketing': ['HubSpot', 'Salesforce', 'Adobe', 'Mailchimp'],
      'consulting': ['McKinsey', 'BCG', 'Bain', 'Deloitte'],
      'e-commerce': ['Amazon', 'Shopify', 'WooCommerce', 'Magento'],
      'cybersecurity': ['CrowdStrike', 'Palo Alto', 'Fortinet', 'Check Point'],
      'artificial-intelligence': ['OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI'],
      'data-science': ['Tableau', 'Power BI', 'Looker', 'Qlik']
    };
    
    return competitors[industry] || [];
  }

  /**
   * Get industry trends
   */
  private getIndustryTrends(industry: string): string[] {
    const trends: Record<string, string[]> = {
      'technology': ['AI integration', 'Cloud migration', 'Digital transformation'],
      'healthcare': ['Telemedicine', 'AI diagnostics', 'Patient data analytics'],
      'finance': ['Digital banking', 'Cryptocurrency', 'Fintech innovation'],
      'education': ['Online learning', 'AI tutoring', 'Personalized education'],
      'marketing': ['AI automation', 'Personalization', 'Omnichannel marketing'],
      'consulting': ['Digital strategy', 'Change management', 'Data-driven decisions'],
      'e-commerce': ['Mobile commerce', 'Social selling', 'Subscription models'],
      'cybersecurity': ['Zero trust', 'AI security', 'Cloud security'],
      'artificial-intelligence': ['Generative AI', 'Machine learning', 'AI ethics'],
      'data-science': ['Real-time analytics', 'Predictive modeling', 'Data privacy']
    };
    
    return trends[industry] || [];
  }

  /**
   * Determine content style
   */
  private determineContentStyle(industry: string): string {
    const styleMap: Record<string, string> = {
      'technology': 'Technical and detailed',
      'healthcare': 'Professional and evidence-based',
      'finance': 'Clear and authoritative',
      'education': 'Engaging and educational',
      'marketing': 'Creative and persuasive',
      'consulting': 'Strategic and analytical',
      'e-commerce': 'Friendly and helpful',
      'cybersecurity': 'Technical and security-focused',
      'artificial-intelligence': 'Cutting-edge and innovative',
      'data-science': 'Analytical and data-driven'
    };
    
    return styleMap[industry] || 'Professional and informative';
  }

  /**
   * Generate content topics
   */
  private generateContentTopics(industry: string): string[] {
    const topics: Record<string, string[]> = {
      'technology': ['Software development', 'Cloud computing', 'AI and ML', 'Cybersecurity'],
      'healthcare': ['Patient care', 'Medical technology', 'Healthcare data', 'Telemedicine'],
      'finance': ['Digital banking', 'Investment strategies', 'Financial planning', 'Fintech'],
      'education': ['Learning methods', 'Educational technology', 'Student success', 'Online learning'],
      'marketing': ['Digital marketing', 'Content strategy', 'Social media', 'Brand building'],
      'consulting': ['Business strategy', 'Process improvement', 'Change management', 'Growth'],
      'e-commerce': ['Online selling', 'Customer experience', 'Inventory management', 'Marketing'],
      'cybersecurity': ['Threat protection', 'Security best practices', 'Compliance', 'Risk management'],
      'artificial-intelligence': ['AI applications', 'Machine learning', 'Automation', 'AI ethics'],
      'data-science': ['Data analysis', 'Predictive modeling', 'Business intelligence', 'Data visualization']
    };
    
    return topics[industry] || ['Industry insights', 'Best practices', 'Trends', 'Solutions'];
  }

  /**
   * Determine content types
   */
  private determineContentTypes(industry: string): string[] {
    return ['How-to guides', 'Case studies', 'Industry insights', 'Product tutorials', 'Best practices'];
  }

  /**
   * Determine brand personality
   */
  private determineBrandPersonality(industry: string): string[] {
    const personality: Record<string, string[]> = {
      'technology': ['Innovative', 'Reliable', 'Forward-thinking'],
      'healthcare': ['Trustworthy', 'Caring', 'Professional'],
      'finance': ['Secure', 'Reliable', 'Transparent'],
      'education': ['Inspiring', 'Knowledgeable', 'Supportive'],
      'marketing': ['Creative', 'Dynamic', 'Results-oriented'],
      'consulting': ['Expert', 'Strategic', 'Analytical'],
      'e-commerce': ['Friendly', 'Helpful', 'Convenient'],
      'cybersecurity': ['Vigilant', 'Technical', 'Protective'],
      'artificial-intelligence': ['Intelligent', 'Cutting-edge', 'Efficient'],
      'data-science': ['Analytical', 'Precise', 'Insightful']
    };
    
    return personality[industry] || ['Professional', 'Reliable', 'Innovative'];
  }

  /**
   * Determine brand values
   */
  private determineBrandValues(industry: string): string[] {
    const values: Record<string, string[]> = {
      'technology': ['Innovation', 'Quality', 'User experience'],
      'healthcare': ['Patient care', 'Safety', 'Excellence'],
      'finance': ['Security', 'Transparency', 'Integrity'],
      'education': ['Learning', 'Accessibility', 'Excellence'],
      'marketing': ['Creativity', 'Results', 'Customer focus'],
      'consulting': ['Excellence', 'Integrity', 'Client success'],
      'e-commerce': ['Customer satisfaction', 'Convenience', 'Quality'],
      'cybersecurity': ['Protection', 'Vigilance', 'Reliability'],
      'artificial-intelligence': ['Innovation', 'Efficiency', 'Ethics'],
      'data-science': ['Accuracy', 'Insight', 'Innovation']
    };
    
    return values[industry] || ['Quality', 'Innovation', 'Customer focus'];
  }

  /**
   * Generate messaging
   */
  private generateMessaging(industry: string): string[] {
    const messaging: Record<string, string[]> = {
      'technology': ['Innovation drives success', 'Technology for everyone', 'Building the future'],
      'healthcare': ['Better health outcomes', 'Caring for communities', 'Medical excellence'],
      'finance': ['Secure financial solutions', 'Building financial futures', 'Trust in every transaction'],
      'education': ['Empowering learners', 'Knowledge changes lives', 'Education for all'],
      'marketing': ['Creative solutions', 'Results that matter', 'Building brands'],
      'consulting': ['Strategic excellence', 'Driving business success', 'Expert guidance'],
      'e-commerce': ['Shopping made simple', 'Quality products', 'Customer first'],
      'cybersecurity': ['Protecting what matters', 'Security first', 'Defending digital assets'],
      'artificial-intelligence': ['AI for good', 'Intelligent solutions', 'Future of automation'],
      'data-science': ['Data-driven decisions', 'Insights that matter', 'Analytics excellence']
    };
    
    return messaging[industry] || ['Excellence in everything', 'Customer focused', 'Innovation driven'];
  }

  /**
   * Determine terms to avoid
   */
  private determineAvoidTerms(industry: string): string[] {
    const avoidTerms: Record<string, string[]> = {
      'healthcare': ['guaranteed cure', 'miracle', 'instant results'],
      'finance': ['guaranteed returns', 'risk-free', 'get rich quick'],
      'education': ['guaranteed success', 'easy degree', 'no effort'],
      'cybersecurity': ['100% secure', 'hack-proof', 'unbreakable'],
      'artificial-intelligence': ['perfect AI', 'flawless', 'human replacement']
    };
    
    return avoidTerms[industry] || ['guaranteed', 'perfect', 'instant'];
  }
}

// Export singleton instance
export const businessAnalysisEngine = new BusinessAnalysisEngine();

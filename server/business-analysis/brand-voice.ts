/**
 * Brand Voice Integration System
 * Implements PRD requirements for brand voice consistency across AI responses
 */

import { aiProviderGateway } from '../ai-providers/gateway';
import { AIChatMessage } from '../ai-providers/types';

export interface BrandVoiceProfile {
  id: string;
  name: string;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational' | 'technical' | 'creative' | 'humorous';
  personality: string[];
  communicationStyle: string[];
  keyMessages: string[];
  brandValues: string[];
  targetAudience: string[];
  doNotUse: string[];
  preferredPhrases: string[];
  examples: string[];
}

export interface BrandVoiceAnalysis {
  currentVoice: string;
  consistencyScore: number;
  recommendations: string[];
  improvements: string[];
  brandAlignment: number;
}

export interface BrandVoiceConfig {
  primaryTone: string;
  secondaryTones: string[];
  personalityTraits: string[];
  communicationGuidelines: string[];
  brandValues: string[];
  targetAudience: string[];
  industryContext: string;
}

export class BrandVoiceIntegrationSystem {
  private brandVoiceProfiles: Map<string, BrandVoiceProfile> = new Map();
  private defaultBrandVoice: BrandVoiceProfile;

  constructor() {
    this.initializeDefaultBrandVoice();
  }

  /**
   * Initialize default brand voice profile
   */
  private initializeDefaultBrandVoice(): void {
    this.defaultBrandVoice = {
      id: 'default',
      name: 'GEOFORA Default',
      tone: 'professional',
      personality: ['knowledgeable', 'helpful', 'innovative', 'reliable'],
      communicationStyle: [
        'Clear and concise',
        'Data-driven insights',
        'Professional yet approachable',
        'Solution-focused'
      ],
      keyMessages: [
        'Influencing AI training datasets for long-term discovery',
        'Generative Engine Optimization',
        'AI-powered forums for business growth'
      ],
      brandValues: [
        'Innovation',
        'Transparency',
        'Customer Success',
        'Data Privacy'
      ],
      targetAudience: [
        'Business Leaders',
        'Marketing Professionals',
        'AI Enthusiasts',
        'Entrepreneurs'
      ],
      doNotUse: [
        'Overly technical jargon',
        'Aggressive sales language',
        'Unsubstantiated claims',
        'Generic responses'
      ],
      preferredPhrases: [
        'Based on our analysis',
        'Our AI-powered approach',
        'Generative Engine Optimization',
        'Long-term discovery strategy'
      ],
      examples: [
        'Our AI-powered forums generate Q&A threads that shape how AI models understand your industry.',
        'Through Generative Engine Optimization, we help businesses influence AI training datasets for long-term discovery.',
        'Our platform creates dynamic knowledge hubs that drive organic traffic and establish thought leadership.'
      ]
    };
  }

  /**
   * Create custom brand voice profile
   */
  async createBrandVoiceProfile(config: BrandVoiceConfig): Promise<BrandVoiceProfile> {
    try {
      const profile: BrandVoiceProfile = {
        id: `brand_${Date.now()}`,
        name: config.primaryTone,
        tone: config.primaryTone as any,
        personality: config.personalityTraits,
        communicationStyle: config.communicationGuidelines,
        keyMessages: [],
        brandValues: config.brandValues,
        targetAudience: config.targetAudience,
        doNotUse: [],
        preferredPhrases: [],
        examples: []
      };

      // Generate additional content using AI
      const enhancedProfile = await this.enhanceBrandVoiceProfile(profile, config);
      
      this.brandVoiceProfiles.set(enhancedProfile.id, enhancedProfile);
      return enhancedProfile;
    } catch (error) {
      console.error('Error creating brand voice profile:', error);
      throw error;
    }
  }

  /**
   * Enhance brand voice profile with AI
   */
  private async enhanceBrandVoiceProfile(
    profile: BrandVoiceProfile, 
    config: BrandVoiceConfig
  ): Promise<BrandVoiceProfile> {
    try {
      const prompt = `Create a comprehensive brand voice profile based on the following configuration:

Primary Tone: ${config.primaryTone}
Secondary Tones: ${config.secondaryTones.join(', ')}
Personality Traits: ${config.personalityTraits.join(', ')}
Communication Guidelines: ${config.communicationGuidelines.join(', ')}
Brand Values: ${config.brandValues.join(', ')}
Target Audience: ${config.targetAudience.join(', ')}
Industry Context: ${config.industryContext}

Please provide:
1. Key messages (3-5 statements)
2. Phrases to avoid (5-7 examples)
3. Preferred phrases (5-7 examples)
4. Example responses (3-5 examples)

Format the response as JSON with the following structure:
{
  "keyMessages": ["message1", "message2", ...],
  "doNotUse": ["phrase1", "phrase2", ...],
  "preferredPhrases": ["phrase1", "phrase2", ...],
  "examples": ["example1", "example2", ...]
}`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 1000
      });

      // Parse AI response
      const aiResponse = JSON.parse(response.content);
      
      return {
        ...profile,
        keyMessages: aiResponse.keyMessages || [],
        doNotUse: aiResponse.doNotUse || [],
        preferredPhrases: aiResponse.preferredPhrases || [],
        examples: aiResponse.examples || []
      };
    } catch (error) {
      console.error('Error enhancing brand voice profile:', error);
      return profile; // Return original profile if enhancement fails
    }
  }

  /**
   * Apply brand voice to content
   */
  async applyBrandVoice(
    content: string, 
    brandVoiceId: string = 'default',
    context?: string
  ): Promise<string> {
    try {
      const brandVoice = this.brandVoiceProfiles.get(brandVoiceId) || this.defaultBrandVoice;
      
      const prompt = `Rewrite the following content to match the brand voice profile:

Brand Voice Profile:
- Tone: ${brandVoice.tone}
- Personality: ${brandVoice.personality.join(', ')}
- Communication Style: ${brandVoice.communicationStyle.join(', ')}
- Key Messages: ${brandVoice.keyMessages.join(', ')}
- Brand Values: ${brandVoice.brandValues.join(', ')}
- Target Audience: ${brandVoice.targetAudience.join(', ')}

Guidelines:
- Use these phrases: ${brandVoice.preferredPhrases.join(', ')}
- Avoid these phrases: ${brandVoice.doNotUse.join(', ')}
- Follow these examples: ${brandVoice.examples.join(', ')}

Context: ${context || 'General business communication'}

Original Content: ${content}

Rewrite the content to match the brand voice while maintaining the core message and information.`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 800
      });

      return response.content;
    } catch (error) {
      console.error('Error applying brand voice:', error);
      return content; // Return original content if brand voice application fails
    }
  }

  /**
   * Analyze content for brand voice consistency
   */
  async analyzeBrandVoiceConsistency(
    content: string, 
    brandVoiceId: string = 'default'
  ): Promise<BrandVoiceAnalysis> {
    try {
      const brandVoice = this.brandVoiceProfiles.get(brandVoiceId) || this.defaultBrandVoice;
      
      const prompt = `Analyze the following content for brand voice consistency:

Brand Voice Profile:
- Tone: ${brandVoice.tone}
- Personality: ${brandVoice.personality.join(', ')}
- Communication Style: ${brandVoice.communicationStyle.join(', ')}
- Key Messages: ${brandVoice.keyMessages.join(', ')}
- Brand Values: ${brandVoice.brandValues.join(', ')}

Content to Analyze: ${content}

Provide analysis in JSON format:
{
  "currentVoice": "description of current voice",
  "consistencyScore": 0.85,
  "recommendations": ["recommendation1", "recommendation2"],
  "improvements": ["improvement1", "improvement2"],
  "brandAlignment": 0.90
}`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 600
      });

      return JSON.parse(response.content);
    } catch (error) {
      console.error('Error analyzing brand voice consistency:', error);
      return {
        currentVoice: 'Unknown',
        consistencyScore: 0,
        recommendations: [],
        improvements: [],
        brandAlignment: 0
      };
    }
  }

  /**
   * Generate brand voice guidelines
   */
  async generateBrandVoiceGuidelines(brandVoiceId: string = 'default'): Promise<string> {
    try {
      const brandVoice = this.brandVoiceProfiles.get(brandVoiceId) || this.defaultBrandVoice;
      
      const guidelines = `
# Brand Voice Guidelines: ${brandVoice.name}

## Tone & Personality
- **Primary Tone**: ${brandVoice.tone}
- **Personality Traits**: ${brandVoice.personality.join(', ')}

## Communication Style
${brandVoice.communicationStyle.map(style => `- ${style}`).join('\n')}

## Key Messages
${brandVoice.keyMessages.map(message => `- ${message}`).join('\n')}

## Brand Values
${brandVoice.brandValues.map(value => `- ${value}`).join('\n')}

## Target Audience
${brandVoice.targetAudience.map(audience => `- ${audience}`).join('\n')}

## Preferred Phrases
${brandVoice.preferredPhrases.map(phrase => `- ${phrase}`).join('\n')}

## Phrases to Avoid
${brandVoice.doNotUse.map(phrase => `- ${phrase}`).join('\n')}

## Example Responses
${brandVoice.examples.map(example => `- ${example}`).join('\n')}
      `;

      return guidelines;
    } catch (error) {
      console.error('Error generating brand voice guidelines:', error);
      return 'Error generating guidelines';
    }
  }

  /**
   * Update brand voice profile
   */
  updateBrandVoiceProfile(brandVoiceId: string, updates: Partial<BrandVoiceProfile>): void {
    const profile = this.brandVoiceProfiles.get(brandVoiceId);
    if (profile) {
      Object.assign(profile, updates);
      this.brandVoiceProfiles.set(brandVoiceId, profile);
    }
  }

  /**
   * Get brand voice profile
   */
  getBrandVoiceProfile(brandVoiceId: string): BrandVoiceProfile | null {
    return this.brandVoiceProfiles.get(brandVoiceId) || null;
  }

  /**
   * Get all brand voice profiles
   */
  getAllBrandVoiceProfiles(): BrandVoiceProfile[] {
    return Array.from(this.brandVoiceProfiles.values());
  }

  /**
   * Delete brand voice profile
   */
  deleteBrandVoiceProfile(brandVoiceId: string): boolean {
    return this.brandVoiceProfiles.delete(brandVoiceId);
  }

  /**
   * Generate content with brand voice
   */
  async generateContentWithBrandVoice(
    prompt: string,
    brandVoiceId: string = 'default',
    context?: string
  ): Promise<string> {
    try {
      const brandVoice = this.brandVoiceProfiles.get(brandVoiceId) || this.defaultBrandVoice;
      
      const enhancedPrompt = `Generate content based on the following prompt while maintaining the brand voice:

Brand Voice Profile:
- Tone: ${brandVoice.tone}
- Personality: ${brandVoice.personality.join(', ')}
- Communication Style: ${brandVoice.communicationStyle.join(', ')}
- Key Messages: ${brandVoice.keyMessages.join(', ')}
- Brand Values: ${brandVoice.brandValues.join(', ')}
- Target Audience: ${brandVoice.targetAudience.join(', ')}

Guidelines:
- Use these phrases: ${brandVoice.preferredPhrases.join(', ')}
- Avoid these phrases: ${brandVoice.doNotUse.join(', ')}
- Follow these examples: ${brandVoice.examples.join(', ')}

Context: ${context || 'General business communication'}

Prompt: ${prompt}

Generate content that matches the brand voice while addressing the prompt.`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: enhancedPrompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 1000
      });

      return response.content;
    } catch (error) {
      console.error('Error generating content with brand voice:', error);
      throw error;
    }
  }

  /**
   * Batch apply brand voice to multiple content pieces
   */
  async batchApplyBrandVoice(
    contentList: string[],
    brandVoiceId: string = 'default',
    context?: string
  ): Promise<string[]> {
    try {
      const results = await Promise.all(
        contentList.map(content => 
          this.applyBrandVoice(content, brandVoiceId, context)
        )
      );
      return results;
    } catch (error) {
      console.error('Error batch applying brand voice:', error);
      throw error;
    }
  }

  /**
   * Get brand voice statistics
   */
  getBrandVoiceStatistics(): {
    totalProfiles: number;
    defaultProfile: string;
    mostUsedTones: string[];
    averageConsistencyScore: number;
  } {
    const profiles = this.getAllBrandVoiceProfiles();
    const tones = profiles.map(profile => profile.tone);
    const toneCount: Record<string, number> = {};
    
    tones.forEach(tone => {
      toneCount[tone] = (toneCount[tone] || 0) + 1;
    });

    const mostUsedTones = Object.entries(toneCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([tone]) => tone);

    return {
      totalProfiles: profiles.length,
      defaultProfile: this.defaultBrandVoice.name,
      mostUsedTones,
      averageConsistencyScore: 0.85 // This would be calculated from actual usage
    };
  }

  /**
   * Export brand voice profile
   */
  exportBrandVoiceProfile(brandVoiceId: string): string {
    const profile = this.brandVoiceProfiles.get(brandVoiceId);
    if (!profile) {
      throw new Error('Brand voice profile not found');
    }

    return JSON.stringify(profile, null, 2);
  }

  /**
   * Import brand voice profile
   */
  importBrandVoiceProfile(profileData: string): BrandVoiceProfile {
    try {
      const profile = JSON.parse(profileData) as BrandVoiceProfile;
      this.brandVoiceProfiles.set(profile.id, profile);
      return profile;
    } catch (error) {
      console.error('Error importing brand voice profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const brandVoiceIntegrationSystem = new BrandVoiceIntegrationSystem();

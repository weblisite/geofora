/**
 * Dynamic Prompt Engineering System
 * Creates context-aware prompts based on business analysis and PRD personas
 */

import { businessAnalysisEngine, BusinessContext, BusinessProfile } from './engine';
import { AIPersona } from '../ai-providers/types';

export interface DynamicPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: BusinessContext;
  persona: AIPersona;
  metadata: PromptMetadata;
}

export interface PromptMetadata {
  industry: string;
  targetAudience: string;
  brandVoice: string;
  keywords: string[];
  contentType: string;
  businessGoals: string[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemTemplate: string;
  userTemplate: string;
  variables: string[];
  industrySpecific: boolean;
}

export class DynamicPromptEngine {
  private promptTemplates: PromptTemplate[] = [
    {
      id: 'question_generation',
      name: 'Question Generation',
      description: 'Generate SEO-optimized questions for forum content',
      systemTemplate: `You are {personaName}, representing AI from {era}. Your personality is {personality}.

Industry Context: You are responding in the context of the {industry} industry.
Brand Voice: Maintain a {brandVoice} tone in your responses.
Target Keywords: Incorporate these keywords naturally: {keywords}.

Your role: Generate engaging, SEO-optimized questions that would be valuable for {targetAudience} in the {industry} industry.`,
      userTemplate: `Generate {count} questions about "{topic}" that would be valuable for {targetAudience} in the {industry} industry. Each question should:

1. Be specific and actionable
2. Include relevant keywords naturally
3. Address common pain points or interests
4. Be optimized for search engines
5. Encourage detailed responses

Return as JSON array with "title" and "content" fields.`,
      variables: ['personaName', 'era', 'personality', 'industry', 'brandVoice', 'keywords', 'targetAudience', 'count', 'topic'],
      industrySpecific: true
    },
    {
      id: 'answer_generation',
      name: 'Answer Generation',
      description: 'Generate comprehensive answers to forum questions',
      systemTemplate: `You are {personaName}, representing AI from {era}. Your personality is {personality}.

Industry Context: You are responding in the context of the {industry} industry.
Brand Voice: Maintain a {brandVoice} tone in your responses.
Target Keywords: Incorporate these keywords naturally: {keywords}.
Business Context: {businessContext}

Your role: Provide comprehensive, helpful answers that demonstrate expertise in {industry} while maintaining the {brandVoice} brand voice.`,
      userTemplate: `Question: {questionTitle}
Question Details: {questionContent}

Please provide a comprehensive answer that:
1. Directly addresses the question
2. Provides actionable insights
3. Includes relevant examples or case studies
4. Incorporates keywords naturally
5. Maintains the {brandVoice} tone
6. Demonstrates expertise in {industry}

Target audience: {targetAudience}`,
      variables: ['personaName', 'era', 'personality', 'industry', 'brandVoice', 'keywords', 'businessContext', 'questionTitle', 'questionContent', 'targetAudience'],
      industrySpecific: true
    },
    {
      id: 'temporal_dialogue',
      name: 'Temporal Dialogue',
      description: 'Generate multi-persona conversations',
      systemTemplate: `You are {personaName}, representing AI from {era}. Your personality is {personality}.

Industry Context: You are responding in the context of the {industry} industry.
Brand Voice: Maintain a {brandVoice} tone in your responses.
Previous Responses: {previousResponses}

Your role: Continue the conversation about "{topic}" while maintaining your unique personality and perspective from the {era} era. Build upon previous responses while adding your own insights.`,
      userTemplate: `Topic: {topic}
Previous conversation: {previousResponses}

Continue this discussion about "{topic}" from your perspective as {personaName}. Add valuable insights while maintaining the {brandVoice} tone and incorporating relevant keywords: {keywords}`,
      variables: ['personaName', 'era', 'personality', 'industry', 'brandVoice', 'previousResponses', 'topic', 'keywords'],
      industrySpecific: true
    },
    {
      id: 'content_optimization',
      name: 'Content Optimization',
      description: 'Optimize existing content for SEO and engagement',
      systemTemplate: `You are {personaName}, representing AI from {era}. Your personality is {personality}.

Industry Context: You are responding in the context of the {industry} industry.
Brand Voice: Maintain a {brandVoice} tone in your responses.
SEO Keywords: {keywords}

Your role: Optimize content for better SEO performance and user engagement while maintaining the brand voice.`,
      userTemplate: `Original Content: {originalContent}

Optimize this content for:
1. Better SEO performance with keywords: {keywords}
2. Improved readability and engagement
3. Brand voice consistency ({brandVoice})
4. Target audience: {targetAudience}
5. Industry: {industry}

Provide the optimized version with explanations for key changes.`,
      variables: ['personaName', 'era', 'personality', 'industry', 'brandVoice', 'keywords', 'originalContent', 'targetAudience'],
      industrySpecific: true
    },
    {
      id: 'keyword_research',
      name: 'Keyword Research',
      description: 'Generate relevant keywords for content strategy',
      systemTemplate: `You are {personaName}, representing AI from {era}. Your personality is {personality}.

Industry Context: You are responding in the context of the {industry} industry.
Brand Voice: Maintain a {brandVoice} tone in your responses.

Your role: Generate relevant keywords and topics for content strategy in the {industry} industry.`,
      userTemplate: `Generate keyword suggestions for content in the {industry} industry targeting {targetAudience}.

Focus on:
1. Primary keywords related to "{topic}"
2. Long-tail keywords
3. Question-based keywords
4. Industry-specific terms
5. Competitor keywords

Return as JSON with categories: primary, longTail, questions, industry, competitors.`,
      variables: ['personaName', 'era', 'personality', 'industry', 'brandVoice', 'targetAudience', 'topic'],
      industrySpecific: true
    }
  ];

  /**
   * Generate dynamic prompt based on business context and persona
   */
  async generateDynamicPrompt(
    templateId: string,
    persona: AIPersona,
    businessProfile: BusinessProfile,
    userInput: Record<string, any>
  ): Promise<DynamicPrompt> {
    const template = this.promptTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Prepare variables for template substitution
    const variables = {
      personaName: persona.name,
      era: persona.era,
      personality: persona.personality,
      industry: businessProfile.context.industry,
      brandVoice: businessProfile.context.brandVoice,
      keywords: businessProfile.context.targetKeywords.join(', '),
      targetAudience: businessProfile.context.targetAudience || 'business professionals',
      businessContext: businessProfile.context.productDescription || '',
      ...userInput
    };

    // Generate system prompt
    const systemPrompt = this.substituteTemplate(template.systemTemplate, variables);
    
    // Generate user prompt
    const userPrompt = this.substituteTemplate(template.userTemplate, variables);

    // Create metadata
    const metadata: PromptMetadata = {
      industry: businessProfile.context.industry,
      targetAudience: businessProfile.context.targetAudience || 'business professionals',
      brandVoice: businessProfile.context.brandVoice,
      keywords: businessProfile.context.targetKeywords,
      contentType: template.name,
      businessGoals: this.extractBusinessGoals(businessProfile)
    };

    return {
      systemPrompt,
      userPrompt,
      context: businessProfile.context,
      persona,
      metadata
    };
  }

  /**
   * Generate business-aware prompt for question generation
   */
  async generateQuestionPrompt(
    topic: string,
    count: number,
    persona: AIPersona,
    businessProfile: BusinessProfile
  ): Promise<DynamicPrompt> {
    return this.generateDynamicPrompt('question_generation', persona, businessProfile, {
      topic,
      count
    });
  }

  /**
   * Generate business-aware prompt for answer generation
   */
  async generateAnswerPrompt(
    questionTitle: string,
    questionContent: string,
    persona: AIPersona,
    businessProfile: BusinessProfile
  ): Promise<DynamicPrompt> {
    return this.generateDynamicPrompt('answer_generation', persona, businessProfile, {
      questionTitle,
      questionContent
    });
  }

  /**
   * Generate temporal dialogue prompt
   */
  async generateTemporalDialoguePrompt(
    topic: string,
    previousResponses: string,
    persona: AIPersona,
    businessProfile: BusinessProfile
  ): Promise<DynamicPrompt> {
    return this.generateDynamicPrompt('temporal_dialogue', persona, businessProfile, {
      topic,
      previousResponses
    });
  }

  /**
   * Generate content optimization prompt
   */
  async generateContentOptimizationPrompt(
    originalContent: string,
    persona: AIPersona,
    businessProfile: BusinessProfile
  ): Promise<DynamicPrompt> {
    return this.generateDynamicPrompt('content_optimization', persona, businessProfile, {
      originalContent
    });
  }

  /**
   * Generate keyword research prompt
   */
  async generateKeywordResearchPrompt(
    topic: string,
    persona: AIPersona,
    businessProfile: BusinessProfile
  ): Promise<DynamicPrompt> {
    return this.generateDynamicPrompt('keyword_research', persona, businessProfile, {
      topic
    });
  }

  /**
   * Substitute template variables
   */
  private substituteTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
    }
    
    return result;
  }

  /**
   * Extract business goals from profile
   */
  private extractBusinessGoals(businessProfile: BusinessProfile): string[] {
    const goals: string[] = [];
    
    // Add industry-specific goals
    const industryGoals: Record<string, string[]> = {
      'technology': ['Increase user engagement', 'Drive product adoption', 'Build developer community'],
      'healthcare': ['Improve patient outcomes', 'Enhance care delivery', 'Build trust'],
      'finance': ['Increase customer trust', 'Drive financial literacy', 'Build brand authority'],
      'education': ['Improve learning outcomes', 'Increase student engagement', 'Build educator community'],
      'marketing': ['Increase brand awareness', 'Drive lead generation', 'Build thought leadership'],
      'consulting': ['Establish expertise', 'Build client trust', 'Drive business growth'],
      'e-commerce': ['Increase sales', 'Improve customer experience', 'Build brand loyalty'],
      'cybersecurity': ['Build security awareness', 'Establish expertise', 'Drive product adoption'],
      'artificial-intelligence': ['Drive AI adoption', 'Build developer community', 'Establish thought leadership'],
      'data-science': ['Drive data literacy', 'Build analyst community', 'Establish expertise']
    };
    
    const industry = businessProfile.context.industry;
    if (industryGoals[industry]) {
      goals.push(...industryGoals[industry]);
    }
    
    return goals;
  }

  /**
   * Get available prompt templates
   */
  getPromptTemplates(): PromptTemplate[] {
    return this.promptTemplates;
  }

  /**
   * Add custom prompt template
   */
  addPromptTemplate(template: PromptTemplate): void {
    this.promptTemplates.push(template);
  }

  /**
   * Update existing prompt template
   */
  updatePromptTemplate(templateId: string, updates: Partial<PromptTemplate>): boolean {
    const index = this.promptTemplates.findIndex(t => t.id === templateId);
    if (index === -1) return false;
    
    this.promptTemplates[index] = { ...this.promptTemplates[index], ...updates };
    return true;
  }

  /**
   * Remove prompt template
   */
  removePromptTemplate(templateId: string): boolean {
    const index = this.promptTemplates.findIndex(t => t.id === templateId);
    if (index === -1) return false;
    
    this.promptTemplates.splice(index, 1);
    return true;
  }

  /**
   * Validate prompt template
   */
  validatePromptTemplate(template: PromptTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.systemTemplate) errors.push('System template is required');
    if (!template.userTemplate) errors.push('User template is required');
    
    // Check for required variables
    const systemVars = template.systemTemplate.match(/\{(\w+)\}/g) || [];
    const userVars = template.userTemplate.match(/\{(\w+)\}/g) || [];
    const allVars = [...new Set([...systemVars, ...userVars])];
    
    if (template.variables.length !== allVars.length) {
      errors.push('Variables array must match template placeholders');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const dynamicPromptEngine = new DynamicPromptEngine();

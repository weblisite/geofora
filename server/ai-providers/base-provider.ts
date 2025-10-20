/**
 * Base AI Provider Interface
 * Abstract class that all AI providers must implement
 */

import { AIRequest, AIResponse, ProviderStatus } from './types';

export abstract class BaseAIProvider {
  protected apiKey: string;
  protected baseUrl: string;
  protected name: string;

  constructor(apiKey: string, baseUrl: string, name: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.name = name;
  }

  /**
   * Generate AI response
   */
  abstract generate(request: AIRequest): Promise<AIResponse>;

  /**
   * Health check for the provider
   */
  abstract healthCheck(): Promise<boolean>;

  /**
   * Get provider capabilities
   */
  abstract getCapabilities(): any;

  /**
   * Validate API key
   */
  abstract validateApiKey(): Promise<boolean>;

  /**
   * Get available models
   */
  abstract getAvailableModels(): Promise<string[]>;

  /**
   * Calculate token usage
   */
  abstract calculateTokenUsage(messages: any[]): number;

  /**
   * Handle provider-specific errors
   */
  protected handleError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message;
      
      switch (status) {
        case 401:
          return new Error(`Invalid API key for ${this.name}`);
        case 429:
          return new Error(`Rate limit exceeded for ${this.name}`);
        case 500:
          return new Error(`Internal server error from ${this.name}`);
        default:
          return new Error(`${this.name} error: ${message}`);
      }
    }
    
    return new Error(`${this.name} error: ${error.message}`);
  }

  /**
   * Create standardized response
   */
  protected createResponse(
    content: string,
    model: string,
    usage: any,
    metadata?: Record<string, any>
  ): AIResponse {
    return {
      content,
      model,
      provider: this.name,
      usage: {
        promptTokens: usage.prompt_tokens || usage.promptTokens || 0,
        completionTokens: usage.completion_tokens || usage.completionTokens || 0,
        totalTokens: usage.total_tokens || usage.totalTokens || 0
      },
      timestamp: new Date(),
      metadata
    };
  }

  /**
   * Build system prompt with business context
   */
  protected buildSystemPrompt(basePrompt: string, businessContext?: any): string {
    if (!businessContext) return basePrompt;

    let contextPrompt = basePrompt;
    
    if (businessContext.industry) {
      contextPrompt += `\n\nIndustry Context: You are responding in the context of the ${businessContext.industry} industry.`;
    }
    
    if (businessContext.brandVoice) {
      contextPrompt += `\n\nBrand Voice: Maintain a ${businessContext.brandVoice} tone in your responses.`;
    }
    
    if (businessContext.targetKeywords && businessContext.targetKeywords.length > 0) {
      contextPrompt += `\n\nTarget Keywords: Incorporate these keywords naturally: ${businessContext.targetKeywords.join(', ')}.`;
    }
    
    if (businessContext.productDescription) {
      contextPrompt += `\n\nProduct Context: ${businessContext.productDescription}`;
    }

    return contextPrompt;
  }
}

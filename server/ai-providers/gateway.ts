/**
 * Unified AI Provider Gateway
 * Central interface for managing all AI providers as specified in PRD
 */

import { 
  AIProvider, 
  AIModel, 
  AIRequest, 
  AIResponse, 
  AIPersona, 
  AIProviderError, 
  ProviderStatus,
  PRD_PERSONAS,
  PROVIDER_CONFIGS
} from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { DeepSeekProvider } from './providers/deepseek';
import { GoogleProvider } from './providers/google';
import { MetaProvider } from './providers/meta';
import { XAIProvider } from './providers/xai';

export class AIProviderGateway {
  private providers: Map<string, AIProvider> = new Map();
  private models: Map<string, AIModel> = new Map();
  private personas: Map<string, AIPersona> = new Map();
  private providerInstances: Map<string, any> = new Map();
  private statusCache: Map<string, ProviderStatus> = new Map();
  private rateLimitTracker: Map<string, { tokens: number; requests: number; resetTime: number }> = new Map();

  constructor() {
    this.initializeProviders();
    this.initializePersonas();
    this.startHealthChecks();
  }

  private initializeProviders(): void {
    // Initialize OpenAI
    const openaiProvider = new OpenAIProvider();
    this.providerInstances.set('openai', openaiProvider);
    this.providers.set('openai', {
      ...PROVIDER_CONFIGS.openai,
      apiKey: process.env.OPENAI_API_KEY || '',
      isActive: !!process.env.OPENAI_API_KEY
    });

    // Initialize Anthropic
    const anthropicProvider = new AnthropicProvider();
    this.providerInstances.set('anthropic', anthropicProvider);
    this.providers.set('anthropic', {
      ...PROVIDER_CONFIGS.anthropic,
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      isActive: !!process.env.ANTHROPIC_API_KEY
    });

    // Initialize DeepSeek
    const deepseekProvider = new DeepSeekProvider();
    this.providerInstances.set('deepseek', deepseekProvider);
    this.providers.set('deepseek', {
      ...PROVIDER_CONFIGS.deepseek,
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      isActive: !!process.env.DEEPSEEK_API_KEY
    });

    // Initialize Google DeepMind
    const googleProvider = new GoogleProvider();
    this.providerInstances.set('google', googleProvider);
    this.providers.set('google', {
      ...PROVIDER_CONFIGS.google,
      apiKey: process.env.GOOGLE_API_KEY || '',
      isActive: !!process.env.GOOGLE_API_KEY
    });

    // Initialize Meta AI
    const metaProvider = new MetaProvider();
    this.providerInstances.set('meta', metaProvider);
    this.providers.set('meta', {
      ...PROVIDER_CONFIGS.meta,
      apiKey: process.env.META_API_KEY || '',
      isActive: !!process.env.META_API_KEY
    });

    // Initialize XAI
    const xaiProvider = new XAIProvider();
    this.providerInstances.set('xai', xaiProvider);
    this.providers.set('xai', {
      ...PROVIDER_CONFIGS.xai,
      apiKey: process.env.XAI_API_KEY || '',
      isActive: !!process.env.XAI_API_KEY
    });
  }

  private initializePersonas(): void {
    PRD_PERSONAS.forEach(persona => {
      this.personas.set(persona.id, persona);
    });
  }

  private startHealthChecks(): void {
    // Check provider health every 5 minutes
    setInterval(() => {
      this.checkAllProvidersHealth();
    }, 5 * 60 * 1000);
  }

  private async checkAllProvidersHealth(): Promise<void> {
    for (const [providerId, provider] of this.providers) {
      if (!provider.isActive) continue;

      try {
        const startTime = Date.now();
        const providerInstance = this.providerInstances.get(providerId);
        
        if (providerInstance && typeof providerInstance.healthCheck === 'function') {
          await providerInstance.healthCheck();
          
          const responseTime = Date.now() - startTime;
          this.statusCache.set(providerId, {
            provider: providerId,
            isHealthy: true,
            lastChecked: new Date(),
            errorRate: 0,
            averageResponseTime: responseTime
          });
        }
      } catch (error) {
        this.statusCache.set(providerId, {
          provider: providerId,
          isHealthy: false,
          lastChecked: new Date(),
          errorRate: 1,
          averageResponseTime: 0
        });
      }
    }
  }

  /**
   * Generate content using a specific persona
   */
  async generateWithPersona(
    personaId: string, 
    prompt: string, 
    businessContext?: any
  ): Promise<AIResponse> {
    const persona = this.personas.get(personaId);
    if (!persona) {
      throw new Error(`Persona ${personaId} not found`);
    }

    const provider = this.providers.get(persona.provider);
    if (!provider || !provider.isActive) {
      throw new Error(`Provider ${persona.provider} is not available`);
    }

    // Check rate limits
    if (!this.checkRateLimit(persona.provider)) {
      throw new Error(`Rate limit exceeded for provider ${persona.provider}`);
    }

    const request: AIRequest = {
      model: persona.model,
      messages: [
        { role: 'system', content: persona.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: persona.temperature,
      maxTokens: persona.maxTokens,
      businessContext
    };

    try {
      const providerInstance = this.providerInstances.get(persona.provider);
      const response = await providerInstance.generate(request);
      
      // Update rate limit tracking
      this.updateRateLimit(persona.provider, response.usage.totalTokens, 1);
      
      return response;
    } catch (error) {
      // Try fallback provider if available
      const fallbackResponse = await this.tryFallbackProvider(personaId, prompt, businessContext);
      if (fallbackResponse) {
        return fallbackResponse;
      }
      
      throw this.createProviderError(error, persona.provider, persona.model);
    }
  }

  /**
   * Generate temporal dialogue - multiple AI personas responding sequentially
   */
  async generateTemporalDialogue(
    initialPrompt: string,
    personaIds: string[],
    businessContext?: any
  ): Promise<AIResponse[]> {
    const responses: AIResponse[] = [];
    let currentContext = initialPrompt;

    for (const personaId of personaIds) {
      try {
        const response = await this.generateWithPersona(personaId, currentContext, businessContext);
        responses.push(response);
        
        // Update context for next persona
        currentContext += `\n\nPrevious response from ${this.personas.get(personaId)?.name}: ${response.content}`;
      } catch (error) {
        console.error(`Error generating response for persona ${personaId}:`, error);
        // Continue with next persona
      }
    }

    return responses;
  }

  /**
   * Get available personas for a specific plan
   */
  getPersonasForPlan(plan: 'starter' | 'pro' | 'enterprise'): AIPersona[] {
    const personas = Array.from(this.personas.values());
    
    switch (plan) {
      case 'starter':
        // Only OpenAI personas
        return personas.filter(p => p.provider === 'openai');
      case 'pro':
        // OpenAI, Anthropic, DeepSeek
        return personas.filter(p => ['openai', 'anthropic', 'deepseek'].includes(p.provider));
      case 'enterprise':
        // All personas
        return personas;
      default:
        return [];
    }
  }

  /**
   * Get provider status
   */
  getProviderStatus(providerId: string): ProviderStatus | undefined {
    return this.statusCache.get(providerId);
  }

  /**
   * Get all provider statuses
   */
  getAllProviderStatuses(): ProviderStatus[] {
    return Array.from(this.statusCache.values());
  }

  /**
   * Check rate limits for a provider
   */
  private checkRateLimit(providerId: string): boolean {
    const provider = this.providers.get(providerId);
    if (!provider) return false;

    const tracker = this.rateLimitTracker.get(providerId);
    if (!tracker) return true;

    const now = Date.now();
    if (now > tracker.resetTime) {
      // Reset counters
      this.rateLimitTracker.set(providerId, {
        tokens: 0,
        requests: 0,
        resetTime: now + 60000 // Reset every minute
      });
      return true;
    }

    return (
      tracker.tokens < provider.rateLimits.tokensPerMinute &&
      tracker.requests < provider.rateLimits.requestsPerMinute
    );
  }

  /**
   * Update rate limit tracking
   */
  private updateRateLimit(providerId: string, tokens: number, requests: number): void {
    const tracker = this.rateLimitTracker.get(providerId) || {
      tokens: 0,
      requests: 0,
      resetTime: Date.now() + 60000
    };

    tracker.tokens += tokens;
    tracker.requests += requests;

    this.rateLimitTracker.set(providerId, tracker);
  }

  /**
   * Try fallback provider if primary fails
   */
  private async tryFallbackProvider(
    personaId: string, 
    prompt: string, 
    businessContext?: any
  ): Promise<AIResponse | null> {
    const persona = this.personas.get(personaId);
    if (!persona) return null;

    // Try OpenAI as fallback for most providers
    const fallbackProvider = 'openai';
    if (fallbackProvider === persona.provider) return null;

    const fallbackPersona = Array.from(this.personas.values())
      .find(p => p.provider === fallbackProvider && p.knowledgeLevel === persona.knowledgeLevel);

    if (!fallbackPersona) return null;

    try {
      return await this.generateWithPersona(fallbackPersona.id, prompt, businessContext);
    } catch (error) {
      return null;
    }
  }

  /**
   * Create provider error
   */
  private createProviderError(error: any, provider: string, model: string): AIProviderError {
    const providerError = new Error(`AI Provider Error: ${error.message}`) as AIProviderError;
    providerError.provider = provider;
    providerError.model = model;
    providerError.statusCode = error.status || error.statusCode;
    providerError.retryable = this.isRetryableError(error);
    return providerError;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableStatusCodes = [429, 500, 502, 503, 504];
    const retryableMessages = ['rate limit', 'timeout', 'connection', 'network'];
    
    if (retryableStatusCodes.includes(error.status || error.statusCode)) {
      return true;
    }
    
    const message = error.message?.toLowerCase() || '';
    return retryableMessages.some(keyword => message.includes(keyword));
  }

  /**
   * Get usage statistics for billing
   */
  getUsageStats(organizationId: string, startDate: Date, endDate: Date): any {
    // This would integrate with your analytics system
    // For now, return mock data
    return {
      totalTokens: 0,
      totalRequests: 0,
      providerBreakdown: {},
      costEstimate: 0
    };
  }
}

// Export singleton instance
export const aiProviderGateway = new AIProviderGateway();

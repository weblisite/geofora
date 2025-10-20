/**
 * AI Provider Rate Limiting and Fallback System
 * Implements PRD requirements for robust AI provider management
 */

import { aiProviderGateway } from '../ai-providers/gateway';
import { AIProviderName, AIChatMessage, AIGenerateResponse, AIGenerateOptions } from '../ai-providers/types';

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  tokensPerMinute: number;
  tokensPerHour: number;
  tokensPerDay: number;
}

export interface ProviderStatus {
  name: AIProviderName;
  isHealthy: boolean;
  lastHealthCheck: Date;
  errorCount: number;
  successCount: number;
  averageResponseTime: number;
  rateLimitRemaining: number;
  rateLimitReset: Date;
  lastError?: string;
}

export interface FallbackConfig {
  primaryProvider: AIProviderName;
  fallbackProviders: AIProviderName[];
  maxRetries: number;
  retryDelay: number;
  healthCheckInterval: number;
  circuitBreakerThreshold: number;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: Date;
  nextAttemptTime: Date;
}

export class AIRateLimitFallbackSystem {
  private providerStatuses: Map<AIProviderName, ProviderStatus> = new Map();
  private rateLimitConfigs: Map<AIProviderName, RateLimitConfig> = new Map();
  private circuitBreakers: Map<AIProviderName, CircuitBreakerState> = new Map();
  private requestCounts: Map<AIProviderName, { count: number; resetTime: Date }> = new Map();
  private tokenCounts: Map<AIProviderName, { count: number; resetTime: Date }> = new Map();

  constructor() {
    this.initializeProviderConfigs();
    this.startHealthChecks();
  }

  /**
   * Initialize provider configurations
   */
  private initializeProviderConfigs(): void {
    // OpenAI configuration
    this.rateLimitConfigs.set('openai', {
      requestsPerMinute: 60,
      requestsPerHour: 3600,
      requestsPerDay: 100000,
      tokensPerMinute: 150000,
      tokensPerHour: 1000000,
      tokensPerDay: 10000000
    });

    // Anthropic configuration
    this.rateLimitConfigs.set('anthropic', {
      requestsPerMinute: 30,
      requestsPerHour: 1800,
      requestsPerDay: 50000,
      tokensPerMinute: 100000,
      tokensPerHour: 500000,
      tokensPerDay: 5000000
    });

    // DeepSeek configuration
    this.rateLimitConfigs.set('deepseek', {
      requestsPerMinute: 40,
      requestsPerHour: 2400,
      requestsPerDay: 75000,
      tokensPerMinute: 120000,
      tokensPerHour: 750000,
      tokensPerDay: 7500000
    });

    // Google configuration
    this.rateLimitConfigs.set('google', {
      requestsPerMinute: 50,
      requestsPerHour: 3000,
      requestsPerDay: 80000,
      tokensPerMinute: 130000,
      tokensPerHour: 800000,
      tokensPerDay: 8000000
    });

    // Meta configuration
    this.rateLimitConfigs.set('meta', {
      requestsPerMinute: 35,
      requestsPerHour: 2100,
      requestsPerDay: 60000,
      tokensPerMinute: 110000,
      tokensPerHour: 600000,
      tokensPerDay: 6000000
    });

    // XAI configuration
    this.rateLimitConfigs.set('xai', {
      requestsPerMinute: 25,
      requestsPerHour: 1500,
      requestsPerDay: 40000,
      tokensPerMinute: 90000,
      tokensPerHour: 400000,
      tokensPerDay: 4000000
    });

    // Initialize provider statuses
    const providers: AIProviderName[] = ['openai', 'anthropic', 'deepseek', 'google', 'meta', 'xai'];
    providers.forEach(provider => {
      this.providerStatuses.set(provider, {
        name: provider,
        isHealthy: true,
        lastHealthCheck: new Date(),
        errorCount: 0,
        successCount: 0,
        averageResponseTime: 0,
        rateLimitRemaining: this.rateLimitConfigs.get(provider)?.requestsPerMinute || 0,
        rateLimitReset: new Date(Date.now() + 60000)
      });

      this.circuitBreakers.set(provider, {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: new Date(),
        nextAttemptTime: new Date()
      });
    });
  }

  /**
   * Generate content with rate limiting and fallback
   */
  async generateWithFallback(
    primaryProvider: AIProviderName,
    messages: AIChatMessage[],
    options?: AIGenerateOptions,
    fallbackProviders: AIProviderName[] = []
  ): Promise<AIGenerateResponse> {
    const providers = [primaryProvider, ...fallbackProviders];
    
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      
      try {
        // Check if provider is healthy and not rate limited
        if (!this.isProviderAvailable(provider)) {
          console.warn(`Provider ${provider} is not available, trying next provider`);
          continue;
        }

        // Check rate limits
        if (!this.checkRateLimit(provider, messages)) {
          console.warn(`Rate limit exceeded for provider ${provider}, trying next provider`);
          continue;
        }

        // Generate content
        const startTime = Date.now();
        const response = await aiProviderGateway.generate(provider, messages, options);
        const responseTime = Date.now() - startTime;

        // Update success metrics
        this.updateSuccessMetrics(provider, responseTime);
        
        // Update rate limit counters
        this.updateRateLimitCounters(provider, messages, response);

        return response;
      } catch (error) {
        console.error(`Error with provider ${provider}:`, error);
        
        // Update failure metrics
        this.updateFailureMetrics(provider, error);
        
        // If this is the last provider, throw the error
        if (i === providers.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All providers failed to generate content');
  }

  /**
   * Generate content with persona and fallback
   */
  async generateWithPersonaAndFallback(
    personaName: string,
    userPrompt: string,
    businessContext?: any,
    fallbackPersonas: string[] = []
  ): Promise<AIGenerateResponse & { provider: string; model: string }> {
    const personas = [personaName, ...fallbackPersonas];
    
    for (const persona of personas) {
      try {
        const response = await aiProviderGateway.generateWithPersona(
          persona,
          userPrompt,
          businessContext
        );
        
        // Update success metrics for the provider used
        const provider = response.provider.toLowerCase() as AIProviderName;
        this.updateSuccessMetrics(provider, 0);
        
        return response;
      } catch (error) {
        console.error(`Error with persona ${persona}:`, error);
        
        // Update failure metrics
        const provider = 'openai' as AIProviderName; // Default fallback
        this.updateFailureMetrics(provider, error);
        
        // If this is the last persona, throw the error
        if (persona === personas[personas.length - 1]) {
          throw error;
        }
      }
    }

    throw new Error('All personas failed to generate content');
  }

  /**
   * Check if provider is available
   */
  private isProviderAvailable(provider: AIProviderName): boolean {
    const status = this.providerStatuses.get(provider);
    const circuitBreaker = this.circuitBreakers.get(provider);
    
    if (!status || !circuitBreaker) {
      return false;
    }

    // Check circuit breaker
    if (circuitBreaker.isOpen) {
      if (new Date() < circuitBreaker.nextAttemptTime) {
        return false;
      } else {
        // Reset circuit breaker
        circuitBreaker.isOpen = false;
        circuitBreaker.failureCount = 0;
      }
    }

    return status.isHealthy;
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(provider: AIProviderName, messages: AIChatMessage[]): boolean {
    const config = this.rateLimitConfigs.get(provider);
    const status = this.providerStatuses.get(provider);
    
    if (!config || !status) {
      return false;
    }

    // Check request rate limits
    const requestCount = this.getRequestCount(provider);
    if (requestCount >= config.requestsPerMinute) {
      return false;
    }

    // Check token rate limits
    const estimatedTokens = this.estimateTokens(messages);
    const tokenCount = this.getTokenCount(provider);
    if (tokenCount + estimatedTokens >= config.tokensPerMinute) {
      return false;
    }

    return true;
  }

  /**
   * Update success metrics
   */
  private updateSuccessMetrics(provider: AIProviderName, responseTime: number): void {
    const status = this.providerStatuses.get(provider);
    if (!status) return;

    status.successCount++;
    status.isHealthy = true;
    status.lastHealthCheck = new Date();
    
    // Update average response time
    status.averageResponseTime = (status.averageResponseTime * (status.successCount - 1) + responseTime) / status.successCount;

    // Reset circuit breaker on success
    const circuitBreaker = this.circuitBreakers.get(provider);
    if (circuitBreaker) {
      circuitBreaker.failureCount = 0;
      circuitBreaker.isOpen = false;
    }
  }

  /**
   * Update failure metrics
   */
  private updateFailureMetrics(provider: AIProviderName, error: any): void {
    const status = this.providerStatuses.get(provider);
    const circuitBreaker = this.circuitBreakers.get(provider);
    
    if (!status || !circuitBreaker) return;

    status.errorCount++;
    status.lastError = error.message || 'Unknown error';
    
    // Update circuit breaker
    circuitBreaker.failureCount++;
    circuitBreaker.lastFailureTime = new Date();
    
    // Open circuit breaker if threshold exceeded
    if (circuitBreaker.failureCount >= 5) { // Threshold of 5 failures
      circuitBreaker.isOpen = true;
      circuitBreaker.nextAttemptTime = new Date(Date.now() + 300000); // 5 minutes
      status.isHealthy = false;
    }
  }

  /**
   * Update rate limit counters
   */
  private updateRateLimitCounters(provider: AIProviderName, messages: AIChatMessage[], response: AIGenerateResponse): void {
    const requestCount = this.getRequestCount(provider);
    const tokenCount = this.getTokenCount(provider);
    
    // Update request count
    this.requestCounts.set(provider, {
      count: requestCount + 1,
      resetTime: new Date(Date.now() + 60000)
    });

    // Update token count
    const tokensUsed = response.usage?.total_tokens || 0;
    this.tokenCounts.set(provider, {
      count: tokenCount + tokensUsed,
      resetTime: new Date(Date.now() + 60000)
    });
  }

  /**
   * Get current request count for provider
   */
  private getRequestCount(provider: AIProviderName): number {
    const count = this.requestCounts.get(provider);
    if (!count || new Date() > count.resetTime) {
      return 0;
    }
    return count.count;
  }

  /**
   * Get current token count for provider
   */
  private getTokenCount(provider: AIProviderName): number {
    const count = this.tokenCounts.get(provider);
    if (!count || new Date() > count.resetTime) {
      return 0;
    }
    return count.count;
  }

  /**
   * Estimate tokens in messages
   */
  private estimateTokens(messages: AIChatMessage[]): number {
    const totalText = messages.map(msg => msg.content).join(' ');
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(totalText.length / 4);
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Check every minute
  }

  /**
   * Perform health checks on all providers
   */
  private async performHealthChecks(): Promise<void> {
    const providers: AIProviderName[] = ['openai', 'anthropic', 'deepseek', 'google', 'meta', 'xai'];
    
    for (const provider of providers) {
      try {
        const startTime = Date.now();
        
        // Simple health check - try to generate a minimal response
        await aiProviderGateway.generate(provider, [
          { role: 'user', content: 'Hello' }
        ], { maxTokens: 10 });
        
        const responseTime = Date.now() - startTime;
        this.updateSuccessMetrics(provider, responseTime);
      } catch (error) {
        this.updateFailureMetrics(provider, error);
      }
    }
  }

  /**
   * Get provider status
   */
  getProviderStatus(provider: AIProviderName): ProviderStatus | null {
    return this.providerStatuses.get(provider) || null;
  }

  /**
   * Get all provider statuses
   */
  getAllProviderStatuses(): ProviderStatus[] {
    return Array.from(this.providerStatuses.values());
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): {
    totalProviders: number;
    healthyProviders: number;
    unhealthyProviders: number;
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
  } {
    const statuses = this.getAllProviderStatuses();
    
    return {
      totalProviders: statuses.length,
      healthyProviders: statuses.filter(s => s.isHealthy).length,
      unhealthyProviders: statuses.filter(s => !s.isHealthy).length,
      totalRequests: statuses.reduce((sum, s) => sum + s.successCount, 0),
      totalErrors: statuses.reduce((sum, s) => sum + s.errorCount, 0),
      averageResponseTime: statuses.reduce((sum, s) => sum + s.averageResponseTime, 0) / statuses.length
    };
  }

  /**
   * Reset provider status
   */
  resetProviderStatus(provider: AIProviderName): void {
    const status = this.providerStatuses.get(provider);
    const circuitBreaker = this.circuitBreakers.get(provider);
    
    if (status) {
      status.isHealthy = true;
      status.errorCount = 0;
      status.successCount = 0;
      status.averageResponseTime = 0;
      status.lastError = undefined;
    }
    
    if (circuitBreaker) {
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = 0;
    }
  }

  /**
   * Update rate limit configuration
   */
  updateRateLimitConfig(provider: AIProviderName, config: RateLimitConfig): void {
    this.rateLimitConfigs.set(provider, config);
  }

  /**
   * Get rate limit configuration
   */
  getRateLimitConfig(provider: AIProviderName): RateLimitConfig | null {
    return this.rateLimitConfigs.get(provider) || null;
  }

  /**
   * Get recommended fallback providers
   */
  getRecommendedFallbackProviders(primaryProvider: AIProviderName): AIProviderName[] {
    const allProviders: AIProviderName[] = ['openai', 'anthropic', 'deepseek', 'google', 'meta', 'xai'];
    const healthyProviders = allProviders.filter(provider => 
      provider !== primaryProvider && this.isProviderAvailable(provider)
    );
    
    // Sort by success rate and response time
    return healthyProviders.sort((a, b) => {
      const statusA = this.providerStatuses.get(a);
      const statusB = this.providerStatuses.get(b);
      
      if (!statusA || !statusB) return 0;
      
      const successRateA = statusA.successCount / (statusA.successCount + statusA.errorCount);
      const successRateB = statusB.successCount / (statusB.successCount + statusB.errorCount);
      
      if (successRateA !== successRateB) {
        return successRateB - successRateA;
      }
      
      return statusA.averageResponseTime - statusB.averageResponseTime;
    });
  }
}

// Export singleton instance
export const aiRateLimitFallbackSystem = new AIRateLimitFallbackSystem();

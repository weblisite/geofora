/**
 * Anthropic Provider Implementation
 * Handles Anthropic Claude API integration
 */

import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from '../base-provider';
import { AIRequest, AIResponse } from '../types';

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    super(apiKey, 'https://api.anthropic.com', 'Anthropic');
    
    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(
        request.systemPrompt || 'You are a helpful AI assistant.',
        request.businessContext
      );

      // Anthropic uses a different message format
      const messages = request.messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }));

      const response = await this.client.messages.create({
        model: request.model,
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        system: systemPrompt,
        messages: messages as any,
      });

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        throw new Error('No text response from Anthropic');
      }

      return this.createResponse(
        content.text,
        request.model,
        {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens
        },
        {
          stopReason: response.stop_reason,
          model: response.model
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Anthropic doesn't have a models endpoint, so we'll try a simple request
      await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      });
      return true;
    } catch (error) {
      console.error(`Anthropic health check failed:`, error);
      return false;
    }
  }

  getCapabilities() {
    return {
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: false,
      maxContextLength: 200000,
      supportedModels: ['claude-3-sonnet-20240229', 'claude-3-haiku', 'claude-3-opus']
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    // Anthropic doesn't provide a models endpoint
    return ['claude-3-sonnet-20240229', 'claude-3-haiku', 'claude-3-opus'];
  }

  calculateTokenUsage(messages: any[]): number {
    // Simple estimation for Anthropic
    let totalTokens = 0;
    
    for (const message of messages) {
      // Rough estimation: 1 token ≈ 4 characters
      totalTokens += Math.ceil(message.content.length / 4);
    }
    
    return totalTokens;
  }
}

/**
 * OpenAI Provider Implementation
 * Handles OpenAI API integration with the unified interface
 */

import OpenAI from 'openai';
import { BaseAIProvider } from '../base-provider';
import { AIRequest, AIResponse } from './types';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || '';
    super(apiKey, 'https://api.openai.com/v1', 'OpenAI');
    
    this.client = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(
        request.systemPrompt || 'You are a helpful AI assistant.',
        request.businessContext
      );

      const messages = [
        { role: 'system', content: systemPrompt },
        ...request.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: messages as any,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000,
        stream: request.stream || false,
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new Error('No response from OpenAI');
      }

      return this.createResponse(
        choice.message.content || '',
        request.model,
        response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        {
          finishReason: choice.finish_reason,
          model: response.model
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error(`OpenAI health check failed:`, error);
      return false;
    }
  }

  getCapabilities() {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      maxContextLength: 128000,
      supportedModels: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      return response.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id);
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      return ['gpt-4', 'gpt-3.5-turbo'];
    }
  }

  calculateTokenUsage(messages: any[]): number {
    // Simple estimation - OpenAI provides actual usage in response
    let totalTokens = 0;
    
    for (const message of messages) {
      // Rough estimation: 1 token ≈ 4 characters
      totalTokens += Math.ceil(message.content.length / 4);
    }
    
    return totalTokens;
  }
}

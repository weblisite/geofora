/**
 * DeepSeek Provider Implementation
 * Handles DeepSeek API integration
 */

import { BaseAIProvider } from '../base-provider';
import { AIRequest, AIResponse } from '../types';

export class DeepSeekProvider extends BaseAIProvider {
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY || '';
    super(apiKey, 'https://api.deepseek.com/v1', 'DeepSeek');
    this.baseUrl = 'https://api.deepseek.com/v1';
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

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          stream: request.stream || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('No response from DeepSeek');
      }

      return this.createResponse(
        data.choices[0].message.content || '',
        request.model,
        data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        {
          finishReason: data.choices[0].finish_reason,
          model: data.model
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error(`DeepSeek health check failed:`, error);
      return false;
    }
  }

  getCapabilities() {
    return {
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: false,
      maxContextLength: 64000,
      supportedModels: ['deepseek-chat', 'deepseek-coder']
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.data
        .filter((model: any) => model.id.includes('deepseek'))
        .map((model: any) => model.id);
    } catch (error) {
      console.error('Error fetching DeepSeek models:', error);
      return ['deepseek-chat', 'deepseek-coder'];
    }
  }

  calculateTokenUsage(messages: any[]): number {
    // Simple estimation for DeepSeek
    let totalTokens = 0;
    
    for (const message of messages) {
      // Rough estimation: 1 token ≈ 4 characters
      totalTokens += Math.ceil(message.content.length / 4);
    }
    
    return totalTokens;
  }
}

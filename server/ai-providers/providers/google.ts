/**
 * Google DeepMind Provider Implementation
 * Handles Google Gemini API integration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from '../base-provider';
import { AIRequest, AIResponse } from '../types';

export class GoogleProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || '';
    super(apiKey, 'https://generativelanguage.googleapis.com', 'Google DeepMind');
    
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(
        request.systemPrompt || 'You are a helpful AI assistant.',
        request.businessContext
      );

      const model = this.client.getGenerativeModel({ 
        model: request.model,
        systemInstruction: systemPrompt
      });

      // Convert messages to Gemini format
      const userMessage = request.messages
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n\n');

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 1000,
        },
      });

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response from Google Gemini');
      }

      // Estimate token usage (Gemini doesn't provide exact counts in free tier)
      const estimatedTokens = Math.ceil(text.length / 4);

      return this.createResponse(
        text,
        request.model,
        {
          prompt_tokens: estimatedTokens,
          completion_tokens: estimatedTokens,
          total_tokens: estimatedTokens * 2
        },
        {
          finishReason: 'stop',
          model: request.model
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      await model.generateContent('Hello');
      return true;
    } catch (error) {
      console.error(`Google Gemini health check failed:`, error);
      return false;
    }
  }

  getCapabilities() {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      maxContextLength: 1000000,
      supportedModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-ultra']
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      await model.generateContent('Hello');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    // Google doesn't provide a models endpoint in the same way
    return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-ultra'];
  }

  calculateTokenUsage(messages: any[]): number {
    // Simple estimation for Google Gemini
    let totalTokens = 0;
    
    for (const message of messages) {
      // Rough estimation: 1 token ≈ 4 characters
      totalTokens += Math.ceil(message.content.length / 4);
    }
    
    return totalTokens;
  }
}

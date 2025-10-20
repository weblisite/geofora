/**
 * Sequential Response System
 * Implements PRD requirements for natural, multi-turn conversations with sequential response generation
 */

import { aiProviderGateway } from '../ai-providers/gateway';
import { AIChatMessage } from '../ai-providers/types';
import { db } from '../db';
import { questions, answers, forums } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export interface SequentialResponse {
  id: string;
  personaName: string;
  content: string;
  timestamp: Date;
  order: number;
  context: string;
  references: string[];
  followUpQuestions: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface ConversationThread {
  id: string;
  questionId: number;
  responses: SequentialResponse[];
  currentPersona: string;
  conversationFlow: 'linear' | 'branching' | 'collaborative';
  context: string;
  businessContext?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseContext {
  previousResponses: SequentialResponse[];
  businessContext?: any;
  userPreferences?: any;
  conversationHistory: AIChatMessage[];
  currentTopic: string;
  relatedTopics: string[];
}

export interface SequentialResponseConfig {
  maxResponses: number;
  responseInterval: number; // milliseconds
  personaRotation: boolean;
  contextRetention: number; // number of previous responses to consider
  followUpGeneration: boolean;
  sentimentAnalysis: boolean;
  referenceTracking: boolean;
}

export class SequentialResponseSystem {
  private activeConversations: Map<string, ConversationThread> = new Map();
  private defaultConfig: SequentialResponseConfig;

  constructor() {
    this.defaultConfig = {
      maxResponses: 5,
      responseInterval: 2000,
      personaRotation: true,
      contextRetention: 3,
      followUpGeneration: true,
      sentimentAnalysis: true,
      referenceTracking: true
    };
  }

  /**
   * Start a new sequential conversation
   */
  async startSequentialConversation(
    questionId: number,
    initialPersona: string,
    businessContext?: any,
    config?: Partial<SequentialResponseConfig>
  ): Promise<ConversationThread> {
    try {
      const conversationId = `conv_${questionId}_${Date.now()}`;
      const mergedConfig = { ...this.defaultConfig, ...config };

      // Get question details
      const question = await db.query.questions.findFirst({
        where: eq(questions.id, questionId),
        with: {
          forum: true
        }
      });

      if (!question) {
        throw new Error(`Question with ID ${questionId} not found`);
      }

      const thread: ConversationThread = {
        id: conversationId,
        questionId,
        responses: [],
        currentPersona: initialPersona,
        conversationFlow: 'collaborative',
        context: question.content,
        businessContext,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.activeConversations.set(conversationId, thread);

      // Generate initial response
      await this.generateSequentialResponse(conversationId, mergedConfig);

      return thread;
    } catch (error) {
      console.error('Error starting sequential conversation:', error);
      throw error;
    }
  }

  /**
   * Generate the next sequential response
   */
  async generateSequentialResponse(
    conversationId: string,
    config?: Partial<SequentialResponseConfig>
  ): Promise<SequentialResponse> {
    try {
      const thread = this.activeConversations.get(conversationId);
      if (!thread) {
        throw new Error(`Conversation thread ${conversationId} not found`);
      }

      const mergedConfig = { ...this.defaultConfig, ...config };
      
      // Check if we've reached max responses
      if (thread.responses.length >= mergedConfig.maxResponses) {
        throw new Error('Maximum responses reached for this conversation');
      }

      // Determine next persona
      const nextPersona = this.determineNextPersona(thread, mergedConfig);
      
      // Build response context
      const responseContext = this.buildResponseContext(thread, mergedConfig);
      
      // Generate response
      const response = await this.generateResponseWithContext(
        nextPersona,
        responseContext,
        thread
      );

      // Add response to thread
      thread.responses.push(response);
      thread.currentPersona = nextPersona;
      thread.updatedAt = new Date();

      // Generate follow-up questions if enabled
      if (mergedConfig.followUpGeneration) {
        response.followUpQuestions = await this.generateFollowUpQuestions(
          response,
          thread,
          mergedConfig
        );
      }

      // Update conversation flow
      this.updateConversationFlow(thread, response);

      return response;
    } catch (error) {
      console.error('Error generating sequential response:', error);
      throw error;
    }
  }

  /**
   * Determine the next persona to respond
   */
  private determineNextPersona(
    thread: ConversationThread,
    config: SequentialResponseConfig
  ): string {
    if (!config.personaRotation) {
      return thread.currentPersona;
    }

    // Define persona rotation order based on PRD
    const personaRotation = [
      'LegacyBot', 'Scholar', 'Sage', 'TechnicalExpert',
      'MetaLlama', 'Oracle', 'GlobalContext', 'GrokWit'
    ];

    const currentIndex = personaRotation.indexOf(thread.currentPersona);
    const nextIndex = (currentIndex + 1) % personaRotation.length;
    
    return personaRotation[nextIndex];
  }

  /**
   * Build response context from conversation history
   */
  private buildResponseContext(
    thread: ConversationThread,
    config: SequentialResponseConfig
  ): ResponseContext {
    const recentResponses = thread.responses.slice(-config.contextRetention);
    
    const conversationHistory: AIChatMessage[] = [
      { role: 'system', content: `You are participating in a sequential conversation about: ${thread.context}` }
    ];

    // Add previous responses to context
    recentResponses.forEach((response, index) => {
      conversationHistory.push({
        role: 'assistant',
        content: `[${response.personaName}]: ${response.content}`
      });
    });

    // Extract current topic and related topics
    const currentTopic = this.extractCurrentTopic(thread);
    const relatedTopics = this.extractRelatedTopics(thread);

    return {
      previousResponses: recentResponses,
      businessContext: thread.businessContext,
      conversationHistory,
      currentTopic,
      relatedTopics
    };
  }

  /**
   * Generate response with context
   */
  private async generateResponseWithContext(
    personaName: string,
    context: ResponseContext,
    thread: ConversationThread
  ): Promise<SequentialResponse> {
    try {
      // Build enhanced prompt with context
      const prompt = this.buildContextualPrompt(personaName, context, thread);
      
      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generateWithPersona(
        personaName,
        prompt,
        thread.businessContext
      );

      // Analyze sentiment
      const sentiment = await this.analyzeSentiment(response.content);
      
      // Extract references
      const references = await this.extractReferences(response.content, context);
      
      // Calculate confidence
      const confidence = await this.calculateConfidence(response.content, context);

      const sequentialResponse: SequentialResponse = {
        id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        personaName,
        content: response.content,
        timestamp: new Date(),
        order: thread.responses.length + 1,
        context: thread.context,
        references,
        followUpQuestions: [],
        sentiment,
        confidence
      };

      return sequentialResponse;
    } catch (error) {
      console.error('Error generating response with context:', error);
      throw error;
    }
  }

  /**
   * Build contextual prompt for response generation
   */
  private buildContextualPrompt(
    personaName: string,
    context: ResponseContext,
    thread: ConversationThread
  ): string {
    let prompt = `You are ${personaName}, participating in a sequential conversation about: ${thread.context}\n\n`;

    // Add conversation history
    if (context.previousResponses.length > 0) {
      prompt += `Previous responses in this conversation:\n`;
      context.previousResponses.forEach((response, index) => {
        prompt += `${index + 1}. [${response.personaName}]: ${response.content}\n`;
      });
      prompt += `\n`;
    }

    // Add business context if available
    if (context.businessContext) {
      prompt += `Business Context: ${JSON.stringify(context.businessContext)}\n\n`;
    }

    // Add current topic
    if (context.currentTopic) {
      prompt += `Current Topic: ${context.currentTopic}\n\n`;
    }

    // Add related topics
    if (context.relatedTopics.length > 0) {
      prompt += `Related Topics: ${context.relatedTopics.join(', ')}\n\n`;
    }

    prompt += `Please provide your response as ${personaName}, considering the conversation context and building upon previous responses. Make your response natural and engaging, and ensure it adds value to the ongoing discussion.`;

    return prompt;
  }

  /**
   * Generate follow-up questions
   */
  private async generateFollowUpQuestions(
    response: SequentialResponse,
    thread: ConversationThread,
    config: SequentialResponseConfig
  ): Promise<string[]> {
    try {
      const prompt = `Based on this response from ${response.personaName}: "${response.content}"

Generate 2-3 follow-up questions that would naturally continue this conversation. The questions should:
1. Build upon the current response
2. Encourage further discussion
3. Be relevant to the topic: ${thread.context}
4. Be engaging and thought-provoking

Return only the questions, one per line.`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const aiResponse = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 200
      });

      return aiResponse.content
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return [];
    }
  }

  /**
   * Analyze sentiment of response
   */
  private async analyzeSentiment(content: string): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      const prompt = `Analyze the sentiment of this text and return only one word: "positive", "neutral", or "negative".

Text: "${content}"`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 10
      });

      const sentiment = response.content.toLowerCase().trim();
      if (['positive', 'neutral', 'negative'].includes(sentiment)) {
        return sentiment as 'positive' | 'neutral' | 'negative';
      }
      
      return 'neutral';
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 'neutral';
    }
  }

  /**
   * Extract references from response
   */
  private async extractReferences(
    content: string,
    context: ResponseContext
  ): Promise<string[]> {
    try {
      const prompt = `Extract any references, citations, or mentions of specific topics, companies, technologies, or concepts from this text. Return them as a comma-separated list.

Text: "${content}"`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 100
      });

      return response.content
        .split(',')
        .map(ref => ref.trim())
        .filter(ref => ref.length > 0);
    } catch (error) {
      console.error('Error extracting references:', error);
      return [];
    }
  }

  /**
   * Calculate confidence score
   */
  private async calculateConfidence(
    content: string,
    context: ResponseContext
  ): Promise<number> {
    try {
      const prompt = `Rate the confidence level of this response on a scale of 0.0 to 1.0, considering:
1. Factual accuracy
2. Completeness
3. Relevance to the topic
4. Clarity and coherence

Response: "${content}"

Return only a number between 0.0 and 1.0.`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 10
      });

      const confidence = parseFloat(response.content.trim());
      return isNaN(confidence) ? 0.5 : Math.max(0, Math.min(1, confidence));
    } catch (error) {
      console.error('Error calculating confidence:', error);
      return 0.5;
    }
  }

  /**
   * Extract current topic from conversation
   */
  private extractCurrentTopic(thread: ConversationThread): string {
    if (thread.responses.length === 0) {
      return thread.context;
    }

    const lastResponse = thread.responses[thread.responses.length - 1];
    return lastResponse.content.substring(0, 100) + '...';
  }

  /**
   * Extract related topics from conversation
   */
  private extractRelatedTopics(thread: ConversationThread): string[] {
    const topics: string[] = [];
    
    thread.responses.forEach(response => {
      topics.push(...response.references);
    });

    // Remove duplicates and return top 5
    return [...new Set(topics)].slice(0, 5);
  }

  /**
   * Update conversation flow based on response
   */
  private updateConversationFlow(thread: ConversationThread, response: SequentialResponse): void {
    // Analyze response characteristics to determine flow type
    if (response.followUpQuestions.length > 0) {
      thread.conversationFlow = 'branching';
    } else if (response.references.length > 0) {
      thread.conversationFlow = 'collaborative';
    } else {
      thread.conversationFlow = 'linear';
    }
  }

  /**
   * Get conversation thread
   */
  getConversationThread(conversationId: string): ConversationThread | null {
    return this.activeConversations.get(conversationId) || null;
  }

  /**
   * Get all active conversations
   */
  getAllActiveConversations(): ConversationThread[] {
    return Array.from(this.activeConversations.values());
  }

  /**
   * End conversation thread
   */
  endConversationThread(conversationId: string): boolean {
    return this.activeConversations.delete(conversationId);
  }

  /**
   * Get conversation statistics
   */
  getConversationStatistics(): {
    activeConversations: number;
    totalResponses: number;
    averageResponsesPerConversation: number;
    personaDistribution: Record<string, number>;
    sentimentDistribution: Record<string, number>;
  } {
    const conversations = this.getAllActiveConversations();
    const totalResponses = conversations.reduce((sum, conv) => sum + conv.responses.length, 0);
    
    const personaDistribution: Record<string, number> = {};
    const sentimentDistribution: Record<string, number> = {};
    
    conversations.forEach(conv => {
      conv.responses.forEach(response => {
        personaDistribution[response.personaName] = (personaDistribution[response.personaName] || 0) + 1;
        sentimentDistribution[response.sentiment] = (sentimentDistribution[response.sentiment] || 0) + 1;
      });
    });

    return {
      activeConversations: conversations.length,
      totalResponses,
      averageResponsesPerConversation: conversations.length > 0 ? totalResponses / conversations.length : 0,
      personaDistribution,
      sentimentDistribution
    };
  }

  /**
   * Update conversation configuration
   */
  updateConversationConfig(conversationId: string, config: Partial<SequentialResponseConfig>): void {
    const thread = this.activeConversations.get(conversationId);
    if (thread) {
      // Update configuration for this specific conversation
      // This would be stored in the thread or a separate config map
    }
  }

  /**
   * Get conversation analytics
   */
  getConversationAnalytics(conversationId: string): {
    responseCount: number;
    averageConfidence: number;
    sentimentTrend: string[];
    topicEvolution: string[];
    personaEngagement: Record<string, number>;
  } | null {
    const thread = this.activeConversations.get(conversationId);
    if (!thread) return null;

    const responses = thread.responses;
    const averageConfidence = responses.reduce((sum, resp) => sum + resp.confidence, 0) / responses.length;
    const sentimentTrend = responses.map(resp => resp.sentiment);
    const topicEvolution = responses.map(resp => resp.content.substring(0, 50));
    
    const personaEngagement: Record<string, number> = {};
    responses.forEach(response => {
      personaEngagement[response.personaName] = (personaEngagement[response.personaName] || 0) + 1;
    });

    return {
      responseCount: responses.length,
      averageConfidence,
      sentimentTrend,
      topicEvolution,
      personaEngagement
    };
  }
}

// Export singleton instance
export const sequentialResponseSystem = new SequentialResponseSystem();

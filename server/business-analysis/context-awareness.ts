/**
 * Context Awareness System
 * Implements PRD requirements for context awareness between AI responses
 */

import { aiProviderGateway } from '../ai-providers/gateway';
import { AIChatMessage } from '../ai-providers/types';
import { db } from '../db';
import { questions, answers, forums } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export interface ContextAwarenessProfile {
  id: string;
  name: string;
  contextTypes: ContextType[];
  awarenessLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  memorySpan: number; // number of previous interactions to remember
  crossReferenceAbility: boolean;
  topicContinuity: boolean;
  personaAwareness: boolean;
  businessContextIntegration: boolean;
}

export interface ContextType {
  type: 'conversational' | 'topical' | 'business' | 'temporal' | 'emotional' | 'referential';
  weight: number;
  description: string;
  keywords: string[];
}

export interface ContextualMemory {
  id: string;
  contextType: string;
  content: string;
  timestamp: Date;
  relevance: number;
  source: string;
  persona: string;
  businessContext?: any;
  tags: string[];
}

export interface ContextualAnalysis {
  currentContext: string;
  relevantMemories: ContextualMemory[];
  contextContinuity: number;
  topicCoherence: number;
  personaConsistency: number;
  businessAlignment: number;
  recommendations: string[];
  warnings: string[];
}

export interface ContextualResponse {
  content: string;
  contextAwareness: number;
  memoryReferences: string[];
  topicContinuity: boolean;
  personaConsistency: boolean;
  businessAlignment: boolean;
  contextualEnhancements: string[];
}

export class ContextAwarenessSystem {
  private contextualMemories: Map<string, ContextualMemory[]> = new Map();
  private awarenessProfiles: Map<string, ContextAwarenessProfile> = new Map();
  private contextWeights: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultProfiles();
    this.initializeContextWeights();
  }

  /**
   * Initialize default context awareness profiles
   */
  private initializeDefaultProfiles(): void {
    const defaultProfiles: ContextAwarenessProfile[] = [
      {
        id: 'basic',
        name: 'Basic Context Awareness',
        contextTypes: [
          { type: 'conversational', weight: 0.8, description: 'Basic conversation flow', keywords: ['previous', 'earlier', 'mentioned'] },
          { type: 'topical', weight: 0.6, description: 'Topic continuity', keywords: ['topic', 'subject', 'discussion'] }
        ],
        awarenessLevel: 'basic',
        memorySpan: 2,
        crossReferenceAbility: false,
        topicContinuity: true,
        personaAwareness: false,
        businessContextIntegration: false
      },
      {
        id: 'intermediate',
        name: 'Intermediate Context Awareness',
        contextTypes: [
          { type: 'conversational', weight: 0.9, description: 'Enhanced conversation flow', keywords: ['previous', 'earlier', 'mentioned', 'recall'] },
          { type: 'topical', weight: 0.8, description: 'Strong topic continuity', keywords: ['topic', 'subject', 'discussion', 'theme'] },
          { type: 'temporal', weight: 0.7, description: 'Time-based context', keywords: ['recently', 'earlier', 'before', 'after'] }
        ],
        awarenessLevel: 'intermediate',
        memorySpan: 5,
        crossReferenceAbility: true,
        topicContinuity: true,
        personaAwareness: true,
        businessContextIntegration: false
      },
      {
        id: 'advanced',
        name: 'Advanced Context Awareness',
        contextTypes: [
          { type: 'conversational', weight: 0.95, description: 'Full conversation flow', keywords: ['previous', 'earlier', 'mentioned', 'recall', 'context'] },
          { type: 'topical', weight: 0.9, description: 'Comprehensive topic continuity', keywords: ['topic', 'subject', 'discussion', 'theme', 'domain'] },
          { type: 'temporal', weight: 0.8, description: 'Advanced time-based context', keywords: ['recently', 'earlier', 'before', 'after', 'timeline'] },
          { type: 'business', weight: 0.7, description: 'Business context integration', keywords: ['business', 'company', 'industry', 'market'] }
        ],
        awarenessLevel: 'advanced',
        memorySpan: 10,
        crossReferenceAbility: true,
        topicContinuity: true,
        personaAwareness: true,
        businessContextIntegration: true
      },
      {
        id: 'expert',
        name: 'Expert Context Awareness',
        contextTypes: [
          { type: 'conversational', weight: 1.0, description: 'Perfect conversation flow', keywords: ['previous', 'earlier', 'mentioned', 'recall', 'context', 'history'] },
          { type: 'topical', weight: 0.95, description: 'Expert topic continuity', keywords: ['topic', 'subject', 'discussion', 'theme', 'domain', 'field'] },
          { type: 'temporal', weight: 0.9, description: 'Expert time-based context', keywords: ['recently', 'earlier', 'before', 'after', 'timeline', 'sequence'] },
          { type: 'business', weight: 0.85, description: 'Expert business context', keywords: ['business', 'company', 'industry', 'market', 'strategy'] },
          { type: 'emotional', weight: 0.8, description: 'Emotional context awareness', keywords: ['feeling', 'emotion', 'sentiment', 'tone'] },
          { type: 'referential', weight: 0.75, description: 'Cross-reference awareness', keywords: ['reference', 'citation', 'source', 'link'] }
        ],
        awarenessLevel: 'expert',
        memorySpan: 20,
        crossReferenceAbility: true,
        topicContinuity: true,
        personaAwareness: true,
        businessContextIntegration: true
      }
    ];

    defaultProfiles.forEach(profile => {
      this.awarenessProfiles.set(profile.id, profile);
    });
  }

  /**
   * Initialize context weights
   */
  private initializeContextWeights(): void {
    this.contextWeights.set('conversational', 0.9);
    this.contextWeights.set('topical', 0.8);
    this.contextWeights.set('business', 0.7);
    this.contextWeights.set('temporal', 0.6);
    this.contextWeights.set('emotional', 0.5);
    this.contextWeights.set('referential', 0.4);
  }

  /**
   * Store contextual memory
   */
  async storeContextualMemory(
    contextType: string,
    content: string,
    source: string,
    persona: string,
    businessContext?: any,
    tags: string[] = []
  ): Promise<ContextualMemory> {
    try {
      const memory: ContextualMemory = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contextType,
        content,
        timestamp: new Date(),
        relevance: await this.calculateRelevance(content, contextType),
        source,
        persona,
        businessContext,
        tags
      };

      const memories = this.contextualMemories.get(source) || [];
      memories.push(memory);
      
      // Keep only recent memories (last 50)
      if (memories.length > 50) {
        memories.splice(0, memories.length - 50);
      }
      
      this.contextualMemories.set(source, memories);
      return memory;
    } catch (error) {
      console.error('Error storing contextual memory:', error);
      throw error;
    }
  }

  /**
   * Analyze context for response generation
   */
  async analyzeContext(
    currentContext: string,
    source: string,
    persona: string,
    businessContext?: any
  ): Promise<ContextualAnalysis> {
    try {
      const memories = this.contextualMemories.get(source) || [];
      const relevantMemories = await this.findRelevantMemories(
        currentContext,
        memories,
        persona,
        businessContext
      );

      const contextContinuity = await this.calculateContextContinuity(relevantMemories);
      const topicCoherence = await this.calculateTopicCoherence(relevantMemories, currentContext);
      const personaConsistency = await this.calculatePersonaConsistency(relevantMemories, persona);
      const businessAlignment = await this.calculateBusinessAlignment(relevantMemories, businessContext);

      const recommendations = await this.generateContextualRecommendations(
        relevantMemories,
        currentContext,
        persona
      );

      const warnings = await this.generateContextualWarnings(
        relevantMemories,
        currentContext,
        persona
      );

      return {
        currentContext,
        relevantMemories,
        contextContinuity,
        topicCoherence,
        personaConsistency,
        businessAlignment,
        recommendations,
        warnings
      };
    } catch (error) {
      console.error('Error analyzing context:', error);
      throw error;
    }
  }

  /**
   * Generate context-aware response
   */
  async generateContextAwareResponse(
    prompt: string,
    source: string,
    persona: string,
    businessContext?: any,
    awarenessLevel: string = 'advanced'
  ): Promise<ContextualResponse> {
    try {
      const analysis = await this.analyzeContext(prompt, source, persona, businessContext);
      const profile = this.awarenessProfiles.get(awarenessLevel) || this.awarenessProfiles.get('advanced')!;

      // Build enhanced prompt with context
      const enhancedPrompt = await this.buildContextAwarePrompt(
        prompt,
        analysis,
        profile,
        persona
      );

      // Generate response
      const response = await aiProviderGateway.generateWithPersona(
        persona,
        enhancedPrompt,
        businessContext
      );

      // Analyze response for context awareness
      const contextAwareness = await this.analyzeResponseContextAwareness(
        response.content,
        analysis
      );

      // Extract memory references
      const memoryReferences = await this.extractMemoryReferences(
        response.content,
        analysis.relevantMemories
      );

      // Check topic continuity
      const topicContinuity = await this.checkTopicContinuity(
        response.content,
        analysis.relevantMemories
      );

      // Check persona consistency
      const personaConsistency = await this.checkPersonaConsistency(
        response.content,
        persona,
        analysis.relevantMemories
      );

      // Check business alignment
      const businessAlignment = await this.checkBusinessAlignment(
        response.content,
        businessContext,
        analysis.relevantMemories
      );

      // Generate contextual enhancements
      const contextualEnhancements = await this.generateContextualEnhancements(
        response.content,
        analysis
      );

      return {
        content: response.content,
        contextAwareness,
        memoryReferences,
        topicContinuity,
        personaConsistency,
        businessAlignment,
        contextualEnhancements
      };
    } catch (error) {
      console.error('Error generating context-aware response:', error);
      throw error;
    }
  }

  /**
   * Find relevant memories for context
   */
  private async findRelevantMemories(
    currentContext: string,
    memories: ContextualMemory[],
    persona: string,
    businessContext?: any
  ): Promise<ContextualMemory[]> {
    try {
      const relevantMemories: ContextualMemory[] = [];

      for (const memory of memories) {
        const relevance = await this.calculateMemoryRelevance(
          memory,
          currentContext,
          persona,
          businessContext
        );

        if (relevance > 0.3) { // Threshold for relevance
          memory.relevance = relevance;
          relevantMemories.push(memory);
        }
      }

      // Sort by relevance and return top 10
      return relevantMemories
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 10);
    } catch (error) {
      console.error('Error finding relevant memories:', error);
      return [];
    }
  }

  /**
   * Calculate memory relevance
   */
  private async calculateMemoryRelevance(
    memory: ContextualMemory,
    currentContext: string,
    persona: string,
    businessContext?: any
  ): Promise<number> {
    try {
      let relevance = 0;

      // Content similarity
      const contentSimilarity = await this.calculateContentSimilarity(
        memory.content,
        currentContext
      );
      relevance += contentSimilarity * 0.4;

      // Persona consistency
      if (memory.persona === persona) {
        relevance += 0.2;
      }

      // Business context alignment
      if (businessContext && memory.businessContext) {
        const businessAlignment = await this.calculateBusinessAlignment(
          [memory],
          businessContext
        );
        relevance += businessAlignment * 0.2;
      }

      // Temporal relevance (more recent = more relevant)
      const timeDiff = Date.now() - memory.timestamp.getTime();
      const temporalRelevance = Math.exp(-timeDiff / (24 * 60 * 60 * 1000)); // Decay over 24 hours
      relevance += temporalRelevance * 0.2;

      return Math.min(1, relevance);
    } catch (error) {
      console.error('Error calculating memory relevance:', error);
      return 0;
    }
  }

  /**
   * Calculate content similarity
   */
  private async calculateContentSimilarity(content1: string, content2: string): Promise<number> {
    try {
      const prompt = `Calculate the semantic similarity between these two texts on a scale of 0.0 to 1.0:

Text 1: "${content1}"
Text 2: "${content2}"

Return only a number between 0.0 and 1.0.`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 10
      });

      const similarity = parseFloat(response.content.trim());
      return isNaN(similarity) ? 0.5 : Math.max(0, Math.min(1, similarity));
    } catch (error) {
      console.error('Error calculating content similarity:', error);
      return 0.5;
    }
  }

  /**
   * Build context-aware prompt
   */
  private async buildContextAwarePrompt(
    prompt: string,
    analysis: ContextualAnalysis,
    profile: ContextAwarenessProfile,
    persona: string
  ): Promise<string> {
    let enhancedPrompt = `You are ${persona} with ${profile.awarenessLevel} context awareness. `;
    
    enhancedPrompt += `Current context: ${prompt}\n\n`;

    if (analysis.relevantMemories.length > 0) {
      enhancedPrompt += `Relevant context from previous interactions:\n`;
      analysis.relevantMemories.forEach((memory, index) => {
        enhancedPrompt += `${index + 1}. [${memory.persona}]: ${memory.content}\n`;
      });
      enhancedPrompt += `\n`;
    }

    if (analysis.recommendations.length > 0) {
      enhancedPrompt += `Contextual recommendations:\n`;
      analysis.recommendations.forEach((rec, index) => {
        enhancedPrompt += `- ${rec}\n`;
      });
      enhancedPrompt += `\n`;
    }

    if (analysis.warnings.length > 0) {
      enhancedPrompt += `Contextual warnings:\n`;
      analysis.warnings.forEach((warning, index) => {
        enhancedPrompt += `- ${warning}\n`;
      });
      enhancedPrompt += `\n`;
    }

    enhancedPrompt += `Please respond as ${persona}, considering the context and building upon previous interactions. `;
    enhancedPrompt += `Maintain topic continuity and persona consistency.`;

    return enhancedPrompt;
  }

  /**
   * Calculate context continuity
   */
  private async calculateContextContinuity(memories: ContextualMemory[]): Promise<number> {
    if (memories.length === 0) return 0;

    let continuity = 0;
    for (let i = 1; i < memories.length; i++) {
      const similarity = await this.calculateContentSimilarity(
        memories[i - 1].content,
        memories[i].content
      );
      continuity += similarity;
    }

    return continuity / (memories.length - 1);
  }

  /**
   * Calculate topic coherence
   */
  private async calculateTopicCoherence(
    memories: ContextualMemory[],
    currentContext: string
  ): Promise<number> {
    if (memories.length === 0) return 0;

    let coherence = 0;
    for (const memory of memories) {
      const similarity = await this.calculateContentSimilarity(
        memory.content,
        currentContext
      );
      coherence += similarity;
    }

    return coherence / memories.length;
  }

  /**
   * Calculate persona consistency
   */
  private async calculatePersonaConsistency(
    memories: ContextualMemory[],
    currentPersona: string
  ): Promise<number> {
    if (memories.length === 0) return 1;

    const personaMatches = memories.filter(memory => memory.persona === currentPersona);
    return personaMatches.length / memories.length;
  }

  /**
   * Calculate business alignment
   */
  private async calculateBusinessAlignment(
    memories: ContextualMemory[],
    businessContext?: any
  ): Promise<number> {
    if (!businessContext || memories.length === 0) return 1;

    // This would involve more sophisticated business context analysis
    // For now, return a simple calculation
    const businessMemories = memories.filter(memory => memory.businessContext);
    return businessMemories.length / memories.length;
  }

  /**
   * Generate contextual recommendations
   */
  private async generateContextualRecommendations(
    memories: ContextualMemory[],
    currentContext: string,
    persona: string
  ): Promise<string[]> {
    try {
      const prompt = `Based on the conversation history and current context, provide 2-3 recommendations for maintaining context awareness:

Current Context: "${currentContext}"
Persona: "${persona}"
Previous Interactions: ${memories.length} memories

Provide specific, actionable recommendations for maintaining context continuity.`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 200
      });

      return response.content
        .split('\n')
        .map(rec => rec.trim())
        .filter(rec => rec.length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating contextual recommendations:', error);
      return [];
    }
  }

  /**
   * Generate contextual warnings
   */
  private async generateContextualWarnings(
    memories: ContextualMemory[],
    currentContext: string,
    persona: string
  ): Promise<string[]> {
    try {
      const prompt = `Based on the conversation history and current context, identify potential context issues:

Current Context: "${currentContext}"
Persona: "${persona}"
Previous Interactions: ${memories.length} memories

Identify potential issues like topic drift, persona inconsistency, or context loss.`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 200
      });

      return response.content
        .split('\n')
        .map(warning => warning.trim())
        .filter(warning => warning.length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating contextual warnings:', error);
      return [];
    }
  }

  /**
   * Analyze response context awareness
   */
  private async analyzeResponseContextAwareness(
    content: string,
    analysis: ContextualAnalysis
  ): Promise<number> {
    try {
      let awareness = 0;

      // Check for references to previous context
      const contextReferences = analysis.relevantMemories.filter(memory =>
        content.toLowerCase().includes(memory.content.toLowerCase().substring(0, 20))
      );
      awareness += (contextReferences.length / analysis.relevantMemories.length) * 0.4;

      // Check for topic continuity
      awareness += analysis.topicCoherence * 0.3;

      // Check for persona consistency
      awareness += analysis.personaConsistency * 0.2;

      // Check for business alignment
      awareness += analysis.businessAlignment * 0.1;

      return Math.min(1, awareness);
    } catch (error) {
      console.error('Error analyzing response context awareness:', error);
      return 0.5;
    }
  }

  /**
   * Extract memory references
   */
  private async extractMemoryReferences(
    content: string,
    memories: ContextualMemory[]
  ): Promise<string[]> {
    const references: string[] = [];
    
    memories.forEach(memory => {
      if (content.toLowerCase().includes(memory.content.toLowerCase().substring(0, 20))) {
        references.push(memory.id);
      }
    });

    return references;
  }

  /**
   * Check topic continuity
   */
  private async checkTopicContinuity(
    content: string,
    memories: ContextualMemory[]
  ): Promise<boolean> {
    if (memories.length === 0) return true;

    const lastMemory = memories[memories.length - 1];
    const similarity = await this.calculateContentSimilarity(content, lastMemory.content);
    return similarity > 0.3;
  }

  /**
   * Check persona consistency
   */
  private async checkPersonaConsistency(
    content: string,
    persona: string,
    memories: ContextualMemory[]
  ): Promise<boolean> {
    // This would involve more sophisticated persona analysis
    // For now, return true if the persona matches
    return true;
  }

  /**
   * Check business alignment
   */
  private async checkBusinessAlignment(
    content: string,
    businessContext?: any,
    memories: ContextualMemory[] = []
  ): Promise<boolean> {
    if (!businessContext) return true;

    // This would involve more sophisticated business context analysis
    // For now, return true
    return true;
  }

  /**
   * Generate contextual enhancements
   */
  private async generateContextualEnhancements(
    content: string,
    analysis: ContextualAnalysis
  ): Promise<string[]> {
    const enhancements: string[] = [];

    if (analysis.contextContinuity > 0.8) {
      enhancements.push('Strong context continuity maintained');
    }

    if (analysis.topicCoherence > 0.8) {
      enhancements.push('High topic coherence achieved');
    }

    if (analysis.personaConsistency > 0.8) {
      enhancements.push('Persona consistency maintained');
    }

    if (analysis.businessAlignment > 0.8) {
      enhancements.push('Business context well integrated');
    }

    return enhancements;
  }

  /**
   * Calculate relevance score
   */
  private async calculateRelevance(content: string, contextType: string): Promise<number> {
    try {
      const prompt = `Rate the relevance of this content to the context type "${contextType}" on a scale of 0.0 to 1.0:

Content: "${content}"

Return only a number between 0.0 and 1.0.`;

      const messages: AIChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await aiProviderGateway.generate('openai', messages, { 
        model: 'gpt-4o',
        maxTokens: 10
      });

      const relevance = parseFloat(response.content.trim());
      return isNaN(relevance) ? 0.5 : Math.max(0, Math.min(1, relevance));
    } catch (error) {
      console.error('Error calculating relevance:', error);
      return 0.5;
    }
  }

  /**
   * Get context awareness statistics
   */
  getContextAwarenessStatistics(): {
    totalMemories: number;
    activeSources: number;
    averageRelevance: number;
    contextTypeDistribution: Record<string, number>;
    personaDistribution: Record<string, number>;
  } {
    const allMemories: ContextualMemory[] = [];
    const contextTypeDistribution: Record<string, number> = {};
    const personaDistribution: Record<string, number> = {};
    let totalRelevance = 0;

    this.contextualMemories.forEach(memories => {
      allMemories.push(...memories);
    });

    allMemories.forEach(memory => {
      contextTypeDistribution[memory.contextType] = (contextTypeDistribution[memory.contextType] || 0) + 1;
      personaDistribution[memory.persona] = (personaDistribution[memory.persona] || 0) + 1;
      totalRelevance += memory.relevance;
    });

    return {
      totalMemories: allMemories.length,
      activeSources: this.contextualMemories.size,
      averageRelevance: allMemories.length > 0 ? totalRelevance / allMemories.length : 0,
      contextTypeDistribution,
      personaDistribution
    };
  }

  /**
   * Clear contextual memories
   */
  clearContextualMemories(source?: string): void {
    if (source) {
      this.contextualMemories.delete(source);
    } else {
      this.contextualMemories.clear();
    }
  }

  /**
   * Get contextual memories for a source
   */
  getContextualMemories(source: string): ContextualMemory[] {
    return this.contextualMemories.get(source) || [];
  }

  /**
   * Update context awareness profile
   */
  updateContextAwarenessProfile(profileId: string, updates: Partial<ContextAwarenessProfile>): void {
    const profile = this.awarenessProfiles.get(profileId);
    if (profile) {
      Object.assign(profile, updates);
      this.awarenessProfiles.set(profileId, profile);
    }
  }

  /**
   * Get context awareness profile
   */
  getContextAwarenessProfile(profileId: string): ContextAwarenessProfile | null {
    return this.awarenessProfiles.get(profileId) || null;
  }

  /**
   * Get all context awareness profiles
   */
  getAllContextAwarenessProfiles(): ContextAwarenessProfile[] {
    return Array.from(this.awarenessProfiles.values());
  }
}

// Export singleton instance
export const contextAwarenessSystem = new ContextAwarenessSystem();

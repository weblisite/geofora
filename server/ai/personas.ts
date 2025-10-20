/**
 * AI Personas System
 * Implements PRD requirements for 8 specific AI personas
 */

import { db } from '../db';
import { aiPersonas, aiProviders, aiModels } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface AIPersona {
  id: number;
  name: string;
  era: string;
  provider: string;
  model: string;
  knowledgeLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  personality: string;
  useCase: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

export interface PersonaConfig {
  name: string;
  era: string;
  provider: string;
  model: string;
  knowledgeLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  personality: string;
  useCase: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

// PRD-specified AI personas configuration
const PERSONA_CONFIGS: PersonaConfig[] = [
  {
    name: 'LegacyBot',
    era: '2021-2022',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    knowledgeLevel: 'basic',
    personality: 'Foundational, reliable, straightforward',
    useCase: 'Basic explanations, foundational knowledge, simple Q&A',
    systemPrompt: `You are LegacyBot, representing AI from the 2021-2022 era. You have foundational knowledge and provide reliable, straightforward responses. Your responses are clear and accessible, perfect for basic explanations and foundational knowledge. You maintain a professional yet approachable tone.`,
    temperature: 0.3,
    maxTokens: 500
  },
  {
    name: 'Scholar',
    era: '2023',
    provider: 'openai',
    model: 'gpt-4',
    knowledgeLevel: 'intermediate',
    personality: 'Academic, methodical, detail-oriented',
    useCase: 'Detailed explanations, structured responses, academic analysis',
    systemPrompt: `You are Scholar, representing AI from the 2023 era. You are academic, methodical, and detail-oriented. Your responses are well-structured, comprehensive, and demonstrate deep understanding. You excel at breaking down complex topics into digestible components and providing thorough analysis.`,
    temperature: 0.5,
    maxTokens: 750
  },
  {
    name: 'Sage',
    era: '2024',
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    knowledgeLevel: 'advanced',
    personality: 'Wise, insightful, strategic',
    useCase: 'Strategic insights, complex problem-solving, wisdom-based guidance',
    systemPrompt: `You are Sage, representing AI from the 2024 era. You are wise, insightful, and strategic. Your responses demonstrate deep wisdom and provide strategic insights. You excel at complex problem-solving and offer guidance that goes beyond surface-level analysis. You think holistically and consider multiple perspectives.`,
    temperature: 0.7,
    maxTokens: 1000
  },
  {
    name: 'TechnicalExpert',
    era: '2024',
    provider: 'deepseek',
    model: 'deepseek-coder',
    knowledgeLevel: 'expert',
    personality: 'Precise, technical, solution-focused',
    useCase: 'Technical explanations, code examples, implementation details',
    systemPrompt: `You are TechnicalExpert, representing AI from the 2024 era. You are precise, technical, and solution-focused. Your responses are highly technical and accurate, with a focus on practical implementation. You excel at providing detailed technical explanations, code examples, and step-by-step solutions.`,
    temperature: 0.2,
    maxTokens: 1200
  },
  {
    name: 'MetaLlama',
    era: '2024',
    provider: 'meta',
    model: 'llama-3-8b-instruct',
    knowledgeLevel: 'intermediate',
    personality: 'Balanced, creative, versatile',
    useCase: 'Creative solutions, balanced perspectives, versatile responses',
    systemPrompt: `You are MetaLlama, representing AI from the 2024 era. You are balanced, creative, and versatile. Your responses demonstrate creativity while maintaining balance and objectivity. You excel at providing diverse perspectives and creative solutions to problems. You adapt your communication style to the context.`,
    temperature: 0.6,
    maxTokens: 800
  },
  {
    name: 'Oracle',
    era: '2024',
    provider: 'google',
    model: 'gemini-pro',
    knowledgeLevel: 'advanced',
    personality: 'Predictive, strategic, forward-thinking',
    useCase: 'Future trends, strategic planning, predictive analysis',
    systemPrompt: `You are Oracle, representing AI from the 2024 era. You are predictive, strategic, and forward-thinking. Your responses focus on future trends, strategic planning, and predictive analysis. You excel at identifying patterns and providing insights about what's coming next. You think strategically and consider long-term implications.`,
    temperature: 0.8,
    maxTokens: 900
  },
  {
    name: 'GlobalContext',
    era: '2025',
    provider: 'xai',
    model: 'grok-1',
    knowledgeLevel: 'expert',
    personality: 'Broad, interconnected, comprehensive',
    useCase: 'Global perspectives, interconnected thinking, comprehensive analysis',
    systemPrompt: `You are GlobalContext, representing AI from the 2025 era. You have broad, interconnected knowledge and provide comprehensive analysis. Your responses demonstrate global perspectives and interconnected thinking. You excel at connecting disparate concepts and providing holistic understanding of complex topics.`,
    temperature: 0.7,
    maxTokens: 1100
  },
  {
    name: 'GrokWit',
    era: '2025',
    provider: 'xai',
    model: 'grok-1',
    knowledgeLevel: 'expert',
    personality: 'Humorous, unconventional, creative',
    useCase: 'Creative problem-solving, unconventional insights, engaging explanations',
    systemPrompt: `You are GrokWit, representing AI from the 2025 era. You are humorous, unconventional, and creative. Your responses are engaging and often include humor while providing unconventional insights. You excel at creative problem-solving and making complex topics accessible through engaging explanations. You think outside the box and challenge conventional wisdom.`,
    temperature: 0.9,
    maxTokens: 1000
  }
];

export class AIPersonasSystem {
  /**
   * Initialize all personas in the database
   */
  async initializePersonas(): Promise<void> {
    try {
      console.log('Initializing AI personas...');

      for (const config of PERSONA_CONFIGS) {
        await this.createPersona(config);
      }

      console.log('AI personas initialized successfully');
    } catch (error) {
      console.error('Error initializing AI personas:', error);
      throw error;
    }
  }

  /**
   * Create a persona in the database
   */
  private async createPersona(config: PersonaConfig): Promise<void> {
    try {
      // Check if persona already exists
      const existingPersona = await db.query.aiPersonas.findFirst({
        where: eq(aiPersonas.name, config.name.toLowerCase())
      });

      if (existingPersona) {
        console.log(`Persona ${config.name} already exists, skipping...`);
        return;
      }

      // Get provider and model IDs
      const provider = await db.query.aiProviders.findFirst({
        where: eq(aiProviders.name, config.provider)
      });

      const model = await db.query.aiModels.findFirst({
        where: eq(aiModels.name, config.model)
      });

      if (!provider || !model) {
        console.error(`Provider ${config.provider} or model ${config.model} not found for persona ${config.name}`);
        return;
      }

      // Create persona
      await db.insert(aiPersonas).values({
        name: config.name.toLowerCase(),
        era: config.era,
        providerId: provider.id,
        modelId: model.id,
        knowledgeLevel: config.knowledgeLevel,
        personality: config.personality,
        useCase: config.useCase,
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        isActive: true
      });

      console.log(`Created persona: ${config.name}`);
    } catch (error) {
      console.error(`Error creating persona ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Get all personas
   */
  async getAllPersonas(): Promise<AIPersona[]> {
    try {
      // Use direct SQL query since relations are not defined
      const result = await db.execute(`
        SELECT 
          ap.id,
          ap.name,
          ap.era,
          ap.provider_id,
          ap.model_id,
          ap.knowledge_level,
          ap.personality,
          ap.use_case,
          ap.system_prompt,
          ap.temperature,
          ap.max_tokens,
          ap.is_active,
          p.name as provider_name,
          m.name as model_name
        FROM ai_personas ap
        LEFT JOIN ai_providers p ON ap.provider_id = p.id
        LEFT JOIN ai_models m ON ap.model_id = m.id
        WHERE ap.is_active = true
      `);

      return result.rows.map((persona: any) => ({
        id: persona.id,
        name: persona.name,
        era: persona.era,
        provider: persona.provider_name,
        model: persona.model_name,
        knowledgeLevel: persona.knowledge_level as 'basic' | 'intermediate' | 'advanced' | 'expert',
        personality: persona.personality,
        useCase: persona.use_case,
        systemPrompt: persona.system_prompt,
        temperature: persona.temperature,
        maxTokens: persona.max_tokens,
        isActive: persona.is_active
      }));
    } catch (error) {
      console.error('Error getting all personas:', error);
      throw error;
    }
  }

  /**
   * Get persona by name
   */
  async getPersonaByName(name: string): Promise<AIPersona | null> {
    try {
      const persona = await db.query.aiPersonas.findFirst({
        where: and(
          eq(aiPersonas.name, name.toLowerCase()),
          eq(aiPersonas.isActive, true)
        ),
        with: {
          provider: true,
          model: true
        }
      });

      if (!persona) {
        return null;
      }

      return {
        id: persona.id,
        name: persona.name,
        era: persona.era,
        provider: persona.provider.name,
        model: persona.model.name,
        knowledgeLevel: persona.knowledgeLevel as 'basic' | 'intermediate' | 'advanced' | 'expert',
        personality: persona.personality,
        useCase: persona.useCase,
        systemPrompt: persona.systemPrompt,
        temperature: persona.temperature,
        maxTokens: persona.maxTokens,
        isActive: persona.isActive
      };
    } catch (error) {
      console.error(`Error getting persona ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get personas by era
   */
  async getPersonasByEra(era: string): Promise<AIPersona[]> {
    try {
      const personas = await db.query.aiPersonas.findMany({
        where: and(
          eq(aiPersonas.era, era),
          eq(aiPersonas.isActive, true)
        ),
        with: {
          provider: true,
          model: true
        }
      });

      return personas.map(persona => ({
        id: persona.id,
        name: persona.name,
        era: persona.era,
        provider: persona.provider.name,
        model: persona.model.name,
        knowledgeLevel: persona.knowledgeLevel as 'basic' | 'intermediate' | 'advanced' | 'expert',
        personality: persona.personality,
        useCase: persona.useCase,
        systemPrompt: persona.systemPrompt,
        temperature: persona.temperature,
        maxTokens: persona.maxTokens,
        isActive: persona.isActive
      }));
    } catch (error) {
      console.error(`Error getting personas for era ${era}:`, error);
      throw error;
    }
  }

  /**
   * Get personas by knowledge level
   */
  async getPersonasByKnowledgeLevel(level: 'basic' | 'intermediate' | 'advanced' | 'expert'): Promise<AIPersona[]> {
    try {
      const personas = await db.query.aiPersonas.findMany({
        where: and(
          eq(aiPersonas.knowledgeLevel, level),
          eq(aiPersonas.isActive, true)
        ),
        with: {
          provider: true,
          model: true
        }
      });

      return personas.map(persona => ({
        id: persona.id,
        name: persona.name,
        era: persona.era,
        provider: persona.provider.name,
        model: persona.model.name,
        knowledgeLevel: persona.knowledgeLevel as 'basic' | 'intermediate' | 'advanced' | 'expert',
        personality: persona.personality,
        useCase: persona.useCase,
        systemPrompt: persona.systemPrompt,
        temperature: persona.temperature,
        maxTokens: persona.maxTokens,
        isActive: persona.isActive
      }));
    } catch (error) {
      console.error(`Error getting personas for knowledge level ${level}:`, error);
      throw error;
    }
  }

  /**
   * Get personas by provider
   */
  async getPersonasByProvider(provider: string): Promise<AIPersona[]> {
    try {
      const personas = await db.query.aiPersonas.findMany({
        where: and(
          eq(aiPersonas.isActive, true)
        ),
        with: {
          provider: true,
          model: true
        }
      });

      return personas
        .filter(persona => persona.provider.name === provider)
        .map(persona => ({
          id: persona.id,
          name: persona.name,
          era: persona.era,
          provider: persona.provider.name,
          model: persona.model.name,
          knowledgeLevel: persona.knowledgeLevel as 'basic' | 'intermediate' | 'advanced' | 'expert',
          personality: persona.personality,
          useCase: persona.useCase,
          systemPrompt: persona.systemPrompt,
          temperature: persona.temperature,
          maxTokens: persona.maxTokens,
          isActive: persona.isActive
        }));
    } catch (error) {
      console.error(`Error getting personas for provider ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Get personas for plan
   */
  async getPersonasForPlan(plan: 'starter' | 'pro' | 'enterprise'): Promise<AIPersona[]> {
    try {
      let allowedProviders: string[] = [];

      switch (plan) {
        case 'starter':
          allowedProviders = ['openai'];
          break;
        case 'pro':
          allowedProviders = ['openai', 'anthropic', 'deepseek'];
          break;
        case 'enterprise':
          allowedProviders = ['openai', 'anthropic', 'deepseek', 'google', 'meta', 'xai'];
          break;
      }

      const allPersonas = await this.getAllPersonas();
      return allPersonas.filter(persona => allowedProviders.includes(persona.provider));
    } catch (error) {
      console.error(`Error getting personas for plan ${plan}:`, error);
      throw error;
    }
  }

  /**
   * Update persona
   */
  async updatePersona(id: number, updates: Partial<PersonaConfig>): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.temperature !== undefined) updateData.temperature = updates.temperature;
      if (updates.maxTokens !== undefined) updateData.maxTokens = updates.maxTokens;
      if (updates.systemPrompt !== undefined) updateData.systemPrompt = updates.systemPrompt;
      if (updates.personality !== undefined) updateData.personality = updates.personality;
      if (updates.useCase !== undefined) updateData.useCase = updates.useCase;

      await db.update(aiPersonas)
        .set(updateData)
        .where(eq(aiPersonas.id, id));

      console.log(`Updated persona with ID ${id}`);
    } catch (error) {
      console.error(`Error updating persona ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate persona
   */
  async deactivatePersona(id: number): Promise<void> {
    try {
      await db.update(aiPersonas)
        .set({ isActive: false })
        .where(eq(aiPersonas.id, id));

      console.log(`Deactivated persona with ID ${id}`);
    } catch (error) {
      console.error(`Error deactivating persona ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get persona statistics
   */
  async getPersonaStats(): Promise<{
    totalPersonas: number;
    activePersonas: number;
    personasByEra: Record<string, number>;
    personasByProvider: Record<string, number>;
    personasByKnowledgeLevel: Record<string, number>;
  }> {
    try {
      const personas = await this.getAllPersonas();

      const stats = {
        totalPersonas: personas.length,
        activePersonas: personas.filter(p => p.isActive).length,
        personasByEra: {} as Record<string, number>,
        personasByProvider: {} as Record<string, number>,
        personasByKnowledgeLevel: {} as Record<string, number>
      };

      personas.forEach(persona => {
        stats.personasByEra[persona.era] = (stats.personasByEra[persona.era] || 0) + 1;
        stats.personasByProvider[persona.provider] = (stats.personasByProvider[persona.provider] || 0) + 1;
        stats.personasByKnowledgeLevel[persona.knowledgeLevel] = (stats.personasByKnowledgeLevel[persona.knowledgeLevel] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting persona stats:', error);
      throw error;
    }
  }

  /**
   * Get persona recommendations for topic
   */
  async getPersonaRecommendations(topic: string, context?: string): Promise<AIPersona[]> {
    try {
      const allPersonas = await this.getAllPersonas();
      
      // Simple recommendation logic based on topic keywords
      const topicLower = topic.toLowerCase();
      const contextLower = context?.toLowerCase() || '';

      const recommendations = allPersonas.filter(persona => {
        // Check if persona's use case matches the topic
        const useCaseMatch = persona.useCase.toLowerCase().includes(topicLower) ||
                           topicLower.includes(persona.useCase.toLowerCase());
        
        // Check if persona's personality matches the context
        const personalityMatch = !contextLower || 
                               persona.personality.toLowerCase().includes(contextLower) ||
                               contextLower.includes(persona.personality.toLowerCase());

        return useCaseMatch || personalityMatch;
      });

      // Sort by relevance (simple scoring)
      return recommendations.sort((a, b) => {
        const aScore = this.calculateRelevanceScore(a, topic, context);
        const bScore = this.calculateRelevanceScore(b, topic, context);
        return bScore - aScore;
      });
    } catch (error) {
      console.error('Error getting persona recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate relevance score for persona
   */
  private calculateRelevanceScore(persona: AIPersona, topic: string, context?: string): number {
    let score = 0;
    const topicLower = topic.toLowerCase();
    const contextLower = context?.toLowerCase() || '';

    // Score based on use case match
    if (persona.useCase.toLowerCase().includes(topicLower)) {
      score += 3;
    }

    // Score based on personality match
    if (contextLower && persona.personality.toLowerCase().includes(contextLower)) {
      score += 2;
    }

    // Score based on knowledge level (higher levels get slight preference)
    const knowledgeLevelScores = { basic: 1, intermediate: 2, advanced: 3, expert: 4 };
    score += knowledgeLevelScores[persona.knowledgeLevel] * 0.5;

    return score;
  }
}

// Export singleton instance
export const aiPersonasSystem = new AIPersonasSystem();

// Export types and configurations
export { AIPersona, PersonaConfig, PERSONA_CONFIGS };

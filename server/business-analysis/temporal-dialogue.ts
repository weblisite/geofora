/**
 * Temporal Dialogue Generation System
 * Implements PRD requirements for natural multi-turn conversations across AI personas
 */

import { aiProviderGateway } from '../ai-providers/gateway';
import { businessAnalysisEngine, BusinessProfile } from './engine';
import { dynamicPromptEngine } from './prompt-engine';
import { AIPersona } from '../ai-providers/types';

export interface DialogueTurn {
  persona: AIPersona;
  content: string;
  timestamp: Date;
  turnNumber: number;
  context: DialogueContext;
}

export interface DialogueContext {
  topic: string;
  businessProfile: BusinessProfile;
  previousTurns: DialogueTurn[];
  currentFocus: string;
  conversationFlow: ConversationFlow;
}

export interface ConversationFlow {
  stage: 'opening' | 'development' | 'deepening' | 'resolution' | 'conclusion';
  direction: 'exploratory' | 'analytical' | 'debate' | 'collaborative';
  intensity: 'light' | 'moderate' | 'intense';
}

export interface DialogueConfig {
  maxTurns: number;
  minTurns: number;
  personaSelection: 'sequential' | 'random' | 'strategic';
  conversationStyle: 'debate' | 'collaboration' | 'exploration' | 'analysis';
  businessContext: boolean;
  keywordIntegration: boolean;
}

export interface DialogueResult {
  turns: DialogueTurn[];
  summary: string;
  keyInsights: string[];
  keywords: string[];
  businessValue: string;
  seoOptimized: boolean;
}

export class TemporalDialogueEngine {
  private defaultConfig: DialogueConfig = {
    maxTurns: 6,
    minTurns: 3,
    personaSelection: 'strategic',
    conversationStyle: 'collaboration',
    businessContext: true,
    keywordIntegration: true
  };

  /**
   * Generate temporal dialogue with multiple AI personas
   */
  async generateTemporalDialogue(
    initialTopic: string,
    businessProfile: BusinessProfile,
    config: Partial<DialogueConfig> = {}
  ): Promise<DialogueResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    try {
      // Step 1: Select personas based on configuration
      const selectedPersonas = await this.selectPersonasForDialogue(
        businessProfile,
        finalConfig
      );

      // Step 2: Initialize conversation flow
      const conversationFlow = this.initializeConversationFlow(finalConfig);

      // Step 3: Generate dialogue turns
      const turns = await this.generateDialogueTurns(
        initialTopic,
        businessProfile,
        selectedPersonas,
        conversationFlow,
        finalConfig
      );

      // Step 4: Generate summary and insights
      const summary = await this.generateDialogueSummary(turns, businessProfile);
      const keyInsights = await this.extractKeyInsights(turns, businessProfile);
      const keywords = this.extractKeywords(turns, businessProfile);
      const businessValue = this.assessBusinessValue(turns, businessProfile);

      return {
        turns,
        summary,
        keyInsights,
        keywords,
        businessValue,
        seoOptimized: this.isSEOOptimized(turns, businessProfile)
      };
    } catch (error) {
      console.error('Error generating temporal dialogue:', error);
      throw error;
    }
  }

  /**
   * Select personas for dialogue based on configuration
   */
  private async selectPersonasForDialogue(
    businessProfile: BusinessProfile,
    config: DialogueConfig
  ): Promise<AIPersona[]> {
    const allPersonas = aiProviderGateway.getPersonasForPlan('enterprise'); // Get all personas
    
    switch (config.personaSelection) {
      case 'sequential':
        return allPersonas.slice(0, config.maxTurns);
      
      case 'random':
        const shuffled = [...allPersonas].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, config.maxTurns);
      
      case 'strategic':
        return this.selectStrategicPersonas(allPersonas, businessProfile, config);
      
      default:
        return allPersonas.slice(0, config.maxTurns);
    }
  }

  /**
   * Select personas strategically based on business context
   */
  private selectStrategicPersonas(
    allPersonas: AIPersona[],
    businessProfile: BusinessProfile,
    config: DialogueConfig
  ): AIPersona[] {
    const industry = businessProfile.context.industry;
    const selectedPersonas: AIPersona[] = [];

    // Always start with a foundational persona
    const foundationalPersona = allPersonas.find(p => p.knowledgeLevel === 'basic') || allPersonas[0];
    selectedPersonas.push(foundationalPersona);

    // Add industry-specific personas
    const industryPersonas = this.getIndustrySpecificPersonas(allPersonas, industry);
    selectedPersonas.push(...industryPersonas.slice(0, 2));

    // Add complementary personas based on conversation style
    const complementaryPersonas = this.getComplementaryPersonas(allPersonas, config.conversationStyle);
    selectedPersonas.push(...complementaryPersonas.slice(0, 2));

    // Add expert persona for depth
    const expertPersona = allPersonas.find(p => p.knowledgeLevel === 'expert');
    if (expertPersona && !selectedPersonas.includes(expertPersona)) {
      selectedPersonas.push(expertPersona);
    }

    return selectedPersonas.slice(0, config.maxTurns);
  }

  /**
   * Get industry-specific personas
   */
  private getIndustrySpecificPersonas(personas: AIPersona[], industry: string): AIPersona[] {
    const industryMapping: Record<string, string[]> = {
      'technology': ['technicalexpert', 'oracle'],
      'healthcare': ['sage', 'oracle'],
      'finance': ['sage', 'globalcontext'],
      'education': ['scholar', 'sage'],
      'marketing': ['globalcontext', 'grokwit'],
      'consulting': ['oracle', 'globalcontext'],
      'e-commerce': ['globalcontext', 'grokwit'],
      'cybersecurity': ['technicalexpert', 'metallama'],
      'artificial-intelligence': ['technicalexpert', 'oracle'],
      'data-science': ['technicalexpert', 'scholar']
    };

    const preferredPersonas = industryMapping[industry] || ['sage', 'oracle'];
    return personas.filter(p => preferredPersonas.includes(p.id));
  }

  /**
   * Get complementary personas based on conversation style
   */
  private getComplementaryPersonas(personas: AIPersona[], style: string): AIPersona[] {
    const styleMapping: Record<string, string[]> = {
      'debate': ['sage', 'technicalexpert'],
      'collaboration': ['scholar', 'globalcontext'],
      'exploration': ['legacybot', 'grokwit'],
      'analysis': ['oracle', 'technicalexpert']
    };

    const preferredPersonas = styleMapping[style] || ['sage', 'scholar'];
    return personas.filter(p => preferredPersonas.includes(p.id));
  }

  /**
   * Initialize conversation flow
   */
  private initializeConversationFlow(config: DialogueConfig): ConversationFlow {
    return {
      stage: 'opening',
      direction: config.conversationStyle === 'debate' ? 'debate' : 'collaborative',
      intensity: 'moderate'
    };
  }

  /**
   * Generate dialogue turns
   */
  private async generateDialogueTurns(
    topic: string,
    businessProfile: BusinessProfile,
    personas: AIPersona[],
    conversationFlow: ConversationFlow,
    config: DialogueConfig
  ): Promise<DialogueTurn[]> {
    const turns: DialogueTurn[] = [];
    let currentContext = '';
    let turnNumber = 1;

    for (let i = 0; i < personas.length && i < config.maxTurns; i++) {
      const persona = personas[i];
      
      try {
        // Build context from previous turns
        const previousTurns = turns.slice(-2); // Use last 2 turns for context
        const previousResponses = previousTurns.map(t => `${t.persona.name}: ${t.content}`).join('\n\n');

        // Generate prompt for this turn
        const prompt = await dynamicPromptEngine.generateTemporalDialoguePrompt(
          topic,
          previousResponses,
          persona,
          businessProfile
        );

        // Generate response using AI provider gateway
        const response = await aiProviderGateway.generateWithPersona(
          persona.id,
          prompt.userPrompt,
          businessProfile.context
        );

        // Create dialogue turn
        const turn: DialogueTurn = {
          persona,
          content: response.content,
          timestamp: new Date(),
          turnNumber: turnNumber++,
          context: {
            topic,
            businessProfile,
            previousTurns: [...turns],
            currentFocus: this.extractCurrentFocus(response.content),
            conversationFlow: this.updateConversationFlow(conversationFlow, turnNumber)
          }
        };

        turns.push(turn);
        currentContext += `${persona.name}: ${response.content}\n\n`;

        // Update conversation flow
        conversationFlow = this.updateConversationFlow(conversationFlow, turnNumber);

      } catch (error) {
        console.error(`Error generating turn for persona ${persona.name}:`, error);
        // Continue with next persona
      }
    }

    return turns;
  }

  /**
   * Extract current focus from content
   */
  private extractCurrentFocus(content: string): string {
    // Simple extraction - could be enhanced with NLP
    const sentences = content.split('.');
    return sentences[0]?.trim() || content.substring(0, 100);
  }

  /**
   * Update conversation flow based on turn number
   */
  private updateConversationFlow(flow: ConversationFlow, turnNumber: number): ConversationFlow {
    const totalTurns = 6; // Default max turns
    const progress = turnNumber / totalTurns;

    let stage: ConversationFlow['stage'];
    if (progress < 0.2) stage = 'opening';
    else if (progress < 0.4) stage = 'development';
    else if (progress < 0.7) stage = 'deepening';
    else if (progress < 0.9) stage = 'resolution';
    else stage = 'conclusion';

    return {
      ...flow,
      stage,
      intensity: turnNumber > 3 ? 'intense' : 'moderate'
    };
  }

  /**
   * Generate dialogue summary
   */
  private async generateDialogueSummary(
    turns: DialogueTurn[],
    businessProfile: BusinessProfile
  ): Promise<string> {
    const content = turns.map(t => `${t.persona.name}: ${t.content}`).join('\n\n');
    
    // Use AI to generate summary
    try {
      const summaryPrompt = `Summarize this dialogue about "${turns[0]?.context.topic}" in the ${businessProfile.context.industry} industry. Focus on key insights and main points discussed.`;
      
      const response = await aiProviderGateway.generateWithPersona(
        'oracle', // Use Oracle for summary generation
        summaryPrompt,
        businessProfile.context
      );
      
      return response.content;
    } catch (error) {
      // Fallback to simple summary
      return `This dialogue explored ${turns[0]?.context.topic} in the ${businessProfile.context.industry} industry, featuring insights from ${turns.length} AI personas representing different eras and perspectives.`;
    }
  }

  /**
   * Extract key insights from dialogue
   */
  private async extractKeyInsights(
    turns: DialogueTurn[],
    businessProfile: BusinessProfile
  ): Promise<string[]> {
    const insights: string[] = [];
    
    // Extract insights from each turn
    turns.forEach(turn => {
      const sentences = turn.content.split('.').filter(s => s.trim().length > 20);
      sentences.forEach(sentence => {
        if (this.isInsightful(sentence, businessProfile.context.industry)) {
          insights.push(sentence.trim());
        }
      });
    });

    return insights.slice(0, 5); // Return top 5 insights
  }

  /**
   * Check if sentence is insightful
   */
  private isInsightful(sentence: string, industry: string): boolean {
    const insightIndicators = [
      'important', 'crucial', 'key', 'essential', 'significant',
      'should', 'must', 'recommend', 'suggest', 'consider',
      'benefit', 'advantage', 'opportunity', 'challenge', 'solution'
    ];
    
    const lowerSentence = sentence.toLowerCase();
    return insightIndicators.some(indicator => lowerSentence.includes(indicator));
  }

  /**
   * Extract keywords from dialogue
   */
  private extractKeywords(turns: DialogueTurn[], businessProfile: BusinessProfile): string[] {
    const keywords = new Set<string>();
    
    // Add business profile keywords
    businessProfile.context.targetKeywords.forEach(keyword => keywords.add(keyword));
    
    // Extract keywords from dialogue content
    turns.forEach(turn => {
      const words = turn.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !this.isStopWord(word)) {
          keywords.add(word);
        }
      });
    });

    return Array.from(keywords).slice(0, 20);
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'with', 'this', 'that', 'are', 'was', 'were',
      'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should',
      'may', 'might', 'can', 'must', 'shall', 'from', 'they', 'them',
      'their', 'there', 'these', 'those', 'what', 'when', 'where',
      'which', 'who', 'why', 'how', 'about', 'above', 'below', 'over',
      'under', 'through', 'during', 'before', 'after', 'between', 'among'
    ];
    
    return stopWords.includes(word);
  }

  /**
   * Assess business value of dialogue
   */
  private assessBusinessValue(turns: DialogueTurn[], businessProfile: BusinessProfile): string {
    const valueIndicators = [
      'solution', 'benefit', 'advantage', 'improve', 'enhance',
      'increase', 'reduce', 'optimize', 'streamline', 'efficient'
    ];
    
    let valueScore = 0;
    turns.forEach(turn => {
      const content = turn.content.toLowerCase();
      valueIndicators.forEach(indicator => {
        if (content.includes(indicator)) {
          valueScore++;
        }
      });
    });

    if (valueScore > 5) return 'High business value - addresses key business needs';
    if (valueScore > 2) return 'Moderate business value - provides useful insights';
    return 'Educational value - informative content';
  }

  /**
   * Check if dialogue is SEO optimized
   */
  private isSEOOptimized(turns: DialogueTurn[], businessProfile: BusinessProfile): boolean {
    const targetKeywords = businessProfile.context.targetKeywords;
    let keywordCount = 0;
    
    turns.forEach(turn => {
      const content = turn.content.toLowerCase();
      targetKeywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          keywordCount++;
        }
      });
    });

    return keywordCount >= targetKeywords.length * 0.5; // At least 50% of keywords used
  }

  /**
   * Get dialogue statistics
   */
  getDialogueStats(turns: DialogueTurn[]): {
    totalTurns: number;
    totalWords: number;
    averageWordsPerTurn: number;
    personasUsed: string[];
    timeSpan: number;
  } {
    const totalWords = turns.reduce((sum, turn) => sum + turn.content.split(' ').length, 0);
    const personasUsed = [...new Set(turns.map(t => t.persona.name))];
    const timeSpan = turns.length > 1 ? 
      turns[turns.length - 1].timestamp.getTime() - turns[0].timestamp.getTime() : 0;

    return {
      totalTurns: turns.length,
      totalWords,
      averageWordsPerTurn: Math.round(totalWords / turns.length),
      personasUsed,
      timeSpan
    };
  }
}

// Export singleton instance
export const temporalDialogueEngine = new TemporalDialogueEngine();

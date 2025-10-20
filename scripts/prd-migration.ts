/**
 * Database Migration Script for PRD Implementation
 * Creates the new AI provider and data sharing tables
 */

import { db } from '../server/db';
import { aiProviders, aiModels, aiPersonas, dataSharingConsent, anonymizedData, usageLogs, setupFees } from '../shared/schema';

export async function runPRDMigration() {
  console.log('Starting PRD migration...');

  try {
    // Insert AI providers
    console.log('Creating AI providers...');
    const providerData = [
      {
        name: 'openai',
        displayName: 'OpenAI',
        apiKey: process.env.OPENAI_API_KEY || '',
        isActive: !!process.env.OPENAI_API_KEY,
        rateLimits: {
          tokensPerMinute: 10000,
          requestsPerMinute: 500,
          maxTokensPerRequest: 4096
        },
        capabilities: {
          supportsStreaming: true,
          supportsVision: true,
          supportsFunctionCalling: true,
          maxContextLength: 128000,
          supportedModels: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']
        }
      },
      {
        name: 'anthropic',
        displayName: 'Anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        isActive: !!process.env.ANTHROPIC_API_KEY,
        rateLimits: {
          tokensPerMinute: 5000,
          requestsPerMinute: 100,
          maxTokensPerRequest: 4096
        },
        capabilities: {
          supportsStreaming: true,
          supportsVision: false,
          supportsFunctionCalling: false,
          maxContextLength: 200000,
          supportedModels: ['claude-3-sonnet-20240229', 'claude-3-haiku', 'claude-3-opus']
        }
      },
      {
        name: 'deepseek',
        displayName: 'DeepSeek',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        isActive: !!process.env.DEEPSEEK_API_KEY,
        rateLimits: {
          tokensPerMinute: 8000,
          requestsPerMinute: 200,
          maxTokensPerRequest: 4096
        },
        capabilities: {
          supportsStreaming: true,
          supportsVision: false,
          supportsFunctionCalling: false,
          maxContextLength: 64000,
          supportedModels: ['deepseek-chat', 'deepseek-coder']
        }
      },
      {
        name: 'google',
        displayName: 'Google DeepMind',
        apiKey: process.env.GOOGLE_AI_API_KEY || '',
        isActive: !!process.env.GOOGLE_AI_API_KEY,
        rateLimits: {
          tokensPerMinute: 15000,
          requestsPerMinute: 1000,
          maxTokensPerRequest: 8192
        },
        capabilities: {
          supportsStreaming: true,
          supportsVision: true,
          supportsFunctionCalling: true,
          maxContextLength: 1000000,
          supportedModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-ultra']
        }
      },
      {
        name: 'meta',
        displayName: 'Meta AI',
        apiKey: process.env.META_AI_API_KEY || '',
        isActive: !!process.env.META_AI_API_KEY,
        rateLimits: {
          tokensPerMinute: 5000,
          requestsPerMinute: 150,
          maxTokensPerRequest: 4096
        },
        capabilities: {
          supportsStreaming: true,
          supportsVision: false,
          supportsFunctionCalling: false,
          maxContextLength: 128000,
          supportedModels: ['llama-3.1-8b', 'llama-3.1-70b', 'llama-3.1-405b']
        }
      },
      {
        name: 'xai',
        displayName: 'XAI',
        apiKey: process.env.XAI_API_KEY || '',
        isActive: !!process.env.XAI_API_KEY,
        rateLimits: {
          tokensPerMinute: 3000,
          requestsPerMinute: 100,
          maxTokensPerRequest: 4096
        },
        capabilities: {
          supportsStreaming: true,
          supportsVision: false,
          supportsFunctionCalling: false,
          maxContextLength: 128000,
          supportedModels: ['grok-1', 'grok-2']
        }
      }
    ];

    const insertedProviders = [];
    for (const provider of providerData) {
      const result = await db.insert(aiProviders).values(provider).returning();
      insertedProviders.push(result[0]);
    }

    console.log(`Created ${insertedProviders.length} AI providers`);

    // Insert AI models
    console.log('Creating AI models...');
    const modelData = [
      // OpenAI models
      { providerId: insertedProviders[0].id, name: 'gpt-4', displayName: 'GPT-4', description: 'Most capable GPT-4 model' },
      { providerId: insertedProviders[0].id, name: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo', description: 'Fast and efficient model' },
      { providerId: insertedProviders[0].id, name: 'gpt-4-turbo', displayName: 'GPT-4 Turbo', description: 'Latest GPT-4 model' },
      
      // Anthropic models
      { providerId: insertedProviders[1].id, name: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
      { providerId: insertedProviders[1].id, name: 'claude-3-haiku', displayName: 'Claude 3 Haiku', description: 'Fast and lightweight' },
      { providerId: insertedProviders[1].id, name: 'claude-3-opus', displayName: 'Claude 3 Opus', description: 'Most powerful Claude model' },
      
      // DeepSeek models
      { providerId: insertedProviders[2].id, name: 'deepseek-chat', displayName: 'DeepSeek Chat', description: 'General purpose chat model' },
      { providerId: insertedProviders[2].id, name: 'deepseek-coder', displayName: 'DeepSeek Coder', description: 'Code generation model' },
      
      // Google models
      { providerId: insertedProviders[3].id, name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', description: 'Fast multimodal model' },
      { providerId: insertedProviders[3].id, name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'Advanced multimodal model' },
      { providerId: insertedProviders[3].id, name: 'gemini-1.5-ultra', displayName: 'Gemini 1.5 Ultra', description: 'Most capable Gemini model' },
      
      // Meta models
      { providerId: insertedProviders[4].id, name: 'llama-3.1-8b', displayName: 'Llama 3.1 8B', description: 'Efficient open-source model' },
      { providerId: insertedProviders[4].id, name: 'llama-3.1-70b', displayName: 'Llama 3.1 70B', description: 'Large open-source model' },
      { providerId: insertedProviders[4].id, name: 'llama-3.1-405b', displayName: 'Llama 3.1 405B', description: 'Massive open-source model' },
      
      // XAI models
      { providerId: insertedProviders[5].id, name: 'grok-1', displayName: 'Grok-1', description: 'First generation Grok model' },
      { providerId: insertedProviders[5].id, name: 'grok-2', displayName: 'Grok-2', description: 'Latest Grok model' }
    ];

    const insertedModels = [];
    for (const model of modelData) {
      const result = await db.insert(aiModels).values(model).returning();
      insertedModels.push(result[0]);
    }

    console.log(`Created ${insertedModels.length} AI models`);

    // Insert PRD personas
    console.log('Creating PRD personas...');
    const personaData = [
      {
        name: 'legacybot',
        era: '2021-2022',
        providerId: insertedProviders[0].id,
        modelId: insertedModels[1].id, // GPT-3.5-turbo
        knowledgeLevel: 'basic',
        personality: 'Straightforward, simple reasoning',
        useCase: 'Basic questions, simple explanations',
        systemPrompt: 'You are LegacyBot, representing AI from 2021-2022. Provide straightforward, simple explanations with basic reasoning.',
        temperature: 0.7,
        maxTokens: 500
      },
      {
        name: 'scholar',
        era: '2023',
        providerId: insertedProviders[0].id,
        modelId: insertedModels[0].id, // GPT-4
        knowledgeLevel: 'intermediate',
        personality: 'Academic, methodical',
        useCase: 'Detailed explanations, structured responses',
        systemPrompt: 'You are Scholar, representing AI from 2023. Provide academic, methodical explanations with detailed analysis.',
        temperature: 0.5,
        maxTokens: 750
      },
      {
        name: 'sage',
        era: '2024',
        providerId: insertedProviders[1].id,
        modelId: insertedModels[3].id, // Claude-3-sonnet
        knowledgeLevel: 'advanced',
        personality: 'Ethical, balanced reasoning',
        useCase: 'Complex analysis, ethical considerations',
        systemPrompt: 'You are Sage, representing AI from 2024. Provide ethical, balanced reasoning with complex analysis.',
        temperature: 0.3,
        maxTokens: 1000
      },
      {
        name: 'technicalexpert',
        era: '2024',
        providerId: insertedProviders[2].id,
        modelId: insertedModels[6].id, // DeepSeek-chat
        knowledgeLevel: 'advanced',
        personality: 'Technical, precise',
        useCase: 'Technical problems, implementation details',
        systemPrompt: 'You are TechnicalExpert, representing AI from 2024. Provide technical, precise solutions with implementation details.',
        temperature: 0.2,
        maxTokens: 1000
      },
      {
        name: 'metallama',
        era: '2024',
        providerId: insertedProviders[4].id,
        modelId: insertedModels[12].id, // Llama-3.1-8b
        knowledgeLevel: 'advanced',
        personality: 'Safety-focused, responsible AI',
        useCase: 'Safety-conscious responses',
        systemPrompt: 'You are MetaLlama, representing AI from 2024. Provide safety-focused, responsible AI responses.',
        temperature: 0.4,
        maxTokens: 800
      },
      {
        name: 'oracle',
        era: '2025',
        providerId: insertedProviders[0].id,
        modelId: insertedModels[0].id, // GPT-4
        knowledgeLevel: 'expert',
        personality: 'Analytical, comprehensive',
        useCase: 'Deep analysis, expert-level insights',
        systemPrompt: 'You are Oracle, representing AI from 2025. Provide analytical, comprehensive insights with expert-level analysis.',
        temperature: 0.3,
        maxTokens: 1200
      },
      {
        name: 'globalcontext',
        era: '2025',
        providerId: insertedProviders[3].id,
        modelId: insertedModels[9].id, // Gemini-1.5-pro
        knowledgeLevel: 'advanced',
        personality: 'Global perspective, web-aware',
        useCase: 'Global context, market awareness',
        systemPrompt: 'You are GlobalContext, representing AI from 2025. Provide global perspective with web-aware market insights.',
        temperature: 0.4,
        maxTokens: 1000
      },
      {
        name: 'grokwit',
        era: '2025',
        providerId: insertedProviders[5].id,
        modelId: insertedModels[15].id, // Grok-2
        knowledgeLevel: 'advanced',
        personality: 'Witty, engaging',
        useCase: 'Real-time data and engaging personality',
        systemPrompt: 'You are GrokWit, representing AI from 2025. Provide witty, engaging responses with real-time data awareness.',
        temperature: 0.8,
        maxTokens: 800
      }
    ];

    const insertedPersonas = [];
    for (const persona of personaData) {
      const result = await db.insert(aiPersonas).values(persona).returning();
      insertedPersonas.push(result[0]);
    }

    console.log(`Created ${insertedPersonas.length} PRD personas`);

    console.log('PRD migration completed successfully!');
    return {
      providers: insertedProviders.length,
      models: insertedModels.length,
      personas: insertedPersonas.length
    };

  } catch (error) {
    console.error('Error during PRD migration:', error);
    throw error;
  }
}

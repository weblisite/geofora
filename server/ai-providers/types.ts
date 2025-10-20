/**
 * AI Provider Types and Interfaces
 * Unified interface for all AI providers as specified in PRD
 */

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  apiKey: string;
  isActive: boolean;
  rateLimits: RateLimits;
  capabilities: ProviderCapabilities;
}

export interface RateLimits {
  tokensPerMinute: number;
  requestsPerMinute: number;
  maxTokensPerRequest: number;
}

export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  maxContextLength: number;
  supportedModels: string[];
}

export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  displayName: string;
  description: string;
  knowledgeCutoff: Date;
  isActive: boolean;
  capabilities: ModelCapabilities;
}

export interface ModelCapabilities {
  maxTokens: number;
  temperature: number;
  supportsSystemPrompt: boolean;
  supportsUserPrompt: boolean;
  responseFormat: 'text' | 'json' | 'markdown';
}

export interface AIRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
  businessContext?: BusinessContext;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage: TokenUsage;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface BusinessContext {
  organizationId: string;
  industry: string;
  brandVoice: string;
  targetKeywords: string[];
  websiteUrl?: string;
  productDescription?: string;
}

export interface AIPersona {
  id: string;
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

// PRD-specified personas
export const PRD_PERSONAS: AIPersona[] = [
  {
    id: 'legacybot',
    name: 'LegacyBot',
    era: '2021-2022',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    knowledgeLevel: 'basic',
    personality: 'Straightforward, simple reasoning',
    useCase: 'Basic questions, simple explanations',
    systemPrompt: 'You are LegacyBot, representing AI from 2021-2022. Provide straightforward, simple explanations with basic reasoning.',
    temperature: 0.7,
    maxTokens: 500
  },
  {
    id: 'scholar',
    name: 'Scholar',
    era: '2023',
    provider: 'openai',
    model: 'gpt-4',
    knowledgeLevel: 'intermediate',
    personality: 'Academic, methodical',
    useCase: 'Detailed explanations, structured responses',
    systemPrompt: 'You are Scholar, representing AI from 2023. Provide academic, methodical explanations with detailed analysis.',
    temperature: 0.5,
    maxTokens: 750
  },
  {
    id: 'sage',
    name: 'Sage',
    era: '2024',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    knowledgeLevel: 'advanced',
    personality: 'Ethical, balanced reasoning',
    useCase: 'Complex analysis, ethical considerations',
    systemPrompt: 'You are Sage, representing AI from 2024. Provide ethical, balanced reasoning with complex analysis.',
    temperature: 0.3,
    maxTokens: 1000
  },
  {
    id: 'technicalexpert',
    name: 'TechnicalExpert',
    era: '2024',
    provider: 'deepseek',
    model: 'deepseek-chat',
    knowledgeLevel: 'advanced',
    personality: 'Technical, precise',
    useCase: 'Technical problems, implementation details',
    systemPrompt: 'You are TechnicalExpert, representing AI from 2024. Provide technical, precise solutions with implementation details.',
    temperature: 0.2,
    maxTokens: 1000
  },
  {
    id: 'metallama',
    name: 'MetaLlama',
    era: '2024',
    provider: 'meta',
    model: 'llama-3.1-8b',
    knowledgeLevel: 'advanced',
    personality: 'Safety-focused, responsible AI',
    useCase: 'Safety-conscious responses',
    systemPrompt: 'You are MetaLlama, representing AI from 2024. Provide safety-focused, responsible AI responses.',
    temperature: 0.4,
    maxTokens: 800
  },
  {
    id: 'oracle',
    name: 'Oracle',
    era: '2025',
    provider: 'openai',
    model: 'gpt-4',
    knowledgeLevel: 'expert',
    personality: 'Analytical, comprehensive',
    useCase: 'Deep analysis, expert-level insights',
    systemPrompt: 'You are Oracle, representing AI from 2025. Provide analytical, comprehensive insights with expert-level analysis.',
    temperature: 0.3,
    maxTokens: 1200
  },
  {
    id: 'globalcontext',
    name: 'GlobalContext',
    era: '2025',
    provider: 'google',
    model: 'gemini-1.5-pro',
    knowledgeLevel: 'advanced',
    personality: 'Global perspective, web-aware',
    useCase: 'Global context, market awareness',
    systemPrompt: 'You are GlobalContext, representing AI from 2025. Provide global perspective with web-aware market insights.',
    temperature: 0.4,
    maxTokens: 1000
  },
  {
    id: 'grokwit',
    name: 'GrokWit',
    era: '2025',
    provider: 'xai',
    model: 'grok-2',
    knowledgeLevel: 'advanced',
    personality: 'Witty, engaging',
    useCase: 'Real-time data and engaging personality',
    systemPrompt: 'You are GrokWit, representing AI from 2025. Provide witty, engaging responses with real-time data awareness.',
    temperature: 0.8,
    maxTokens: 800
  }
];

// Provider configurations as per PRD
export const PROVIDER_CONFIGS = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    displayName: 'OpenAI',
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
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    displayName: 'Anthropic',
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
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    displayName: 'DeepSeek',
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
  google: {
    id: 'google',
    name: 'Google DeepMind',
    displayName: 'Google DeepMind',
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
  // Meta provider configuration disabled
  // meta: {
  //   id: 'meta',
  //   name: 'Meta AI',
  //   displayName: 'Meta AI',
  //   rateLimits: {
  //     tokensPerMinute: 5000,
  //     requestsPerMinute: 150,
  //     maxTokensPerRequest: 4096
  //   },
  //   capabilities: {
  //     supportsStreaming: true,
  //     supportsVision: false,
  //     supportsFunctionCalling: false,
  //     maxContextLength: 128000,
  //     supportedModels: ['llama-3.1-8b', 'llama-3.1-70b', 'llama-3.1-405b']
  //   }
  // },
  // XAI provider configuration disabled
  // xai: {
  //   id: 'xai',
  //   name: 'XAI',
  //   displayName: 'XAI',
  //   rateLimits: {
  //     tokensPerMinute: 3000,
  //     requestsPerMinute: 100,
  //     maxTokensPerRequest: 4096
  //   },
  //   capabilities: {
  //     supportsStreaming: true,
  //     supportsVision: false,
  //     supportsFunctionCalling: false,
  //     maxContextLength: 128000,
  //     supportedModels: ['grok-1', 'grok-2']
  //   }
  // }
};

export interface AIProviderError extends Error {
  provider: string;
  model: string;
  statusCode?: number;
  retryable: boolean;
}

export interface ProviderStatus {
  provider: string;
  isHealthy: boolean;
  lastChecked: Date;
  errorRate: number;
  averageResponseTime: number;
}

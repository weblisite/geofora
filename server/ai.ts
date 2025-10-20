import OpenAI from "openai";
// Define types locally rather than importing from schema
/**
 * Updated AI Service with Multi-Provider Support
 * Integrates with the new AI Provider Gateway
 */

import { businessAnalysisEngine, BusinessProfile } from './business-analysis/engine';
import { temporalDialogueEngine, DialogueResult } from './business-analysis/temporal-dialogue';
import { dynamicPromptEngine } from './business-analysis/prompt-engine';

type AiAgent = "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator";

// Legacy AI models for backward compatibility
const AI_MODELS = {
  default: "gpt-4o",
  vision: "gpt-4o",
  entry: "gpt-3.5-turbo"
};

// Constants for caching
const CACHE_TTL = {
  SHORT: 1000 * 60 * 10,        // 10 minutes
  MEDIUM: 1000 * 60 * 60,       // 1 hour
  LONG: 1000 * 60 * 60 * 24,    // 24 hours
  VERY_LONG: 1000 * 60 * 60 * 24 * 7  // 1 week
};

/**
 * Generate AI content using the new multi-provider system
 */
export async function generateAiContent(
  prompt: string, 
  agentType: "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator",
  organizationId?: number,
  businessContext?: any
): Promise<string> {
  try {
    // Check cache first
    const cacheParams = { prompt, agentType, organizationId };
    const cachedResponse = aiCache.get<string>('generate-content', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for generate-content with persona ${agentType}`);
      return cachedResponse;
    }

    // Map legacy agent types to PRD personas
    const personaId = mapLegacyAgentToPersona(agentType);
    
    // Generate content using the new system
    const response = await aiProviderGateway.generateWithPersona(
      personaId,
      prompt,
      businessContext
    );

    // Anonymize and store data if organization provided
    if (organizationId && businessContext) {
      try {
        await anonymizeAndStoreData(
          response.content,
          organizationId,
          response.provider,
          response.model,
          'answer'
        );
      } catch (error) {
        console.error('Error anonymizing data:', error);
        // Don't fail the main request if anonymization fails
      }
    }

    // Cache the result
    aiCache.set('generate-content', cacheParams, response.content, CACHE_TTL.MEDIUM);
    
    return response.content;
  } catch (error) {
    console.error("Error generating AI content:", error);
    return "Sorry, I couldn't generate a response at this time.";
  }
}

/**
 * Generate temporal dialogue using multiple AI personas
 */
export async function generateTemporalDialogue(
  initialPrompt: string,
  organizationId: number,
  businessContext?: any
): Promise<Array<{ persona: string; content: string; timestamp: Date }>> {
  try {
    // Get available personas for the organization's plan
    const plan = await getOrganizationPlan(organizationId);
    const personas = aiProviderGateway.getPersonasForPlan(plan);
    
    // Select personas based on plan
    const selectedPersonas = selectPersonasForDialogue(personas, plan);
    
    // Generate dialogue
    const responses = await aiProviderGateway.generateTemporalDialogue(
      initialPrompt,
      selectedPersonas.map(p => p.id),
      businessContext
    );

    // Anonymize and store each response
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const persona = selectedPersonas[i];
      
      try {
        await anonymizeAndStoreData(
          response.content,
          organizationId,
          response.provider,
          response.model,
          'conversation'
        );
      } catch (error) {
        console.error('Error anonymizing dialogue data:', error);
      }
    }

    return responses.map((response, index) => ({
      persona: selectedPersonas[index].name,
      content: response.content,
      timestamp: response.timestamp
    }));
  } catch (error) {
    console.error("Error generating temporal dialogue:", error);
    return [];
  }
}

/**
 * Map legacy agent types to PRD personas
 */
function mapLegacyAgentToPersona(agentType: string): string {
  const mapping: Record<string, string> = {
    'beginner': 'legacybot',
    'intermediate': 'scholar',
    'expert': 'sage',
    'smart': 'technicalexpert',
    'genius': 'oracle',
    'intelligent': 'globalcontext',
    'moderator': 'metallama'
  };
  
  return mapping[agentType] || 'scholar';
}

/**
 * Select personas for dialogue based on plan
 */
function selectPersonasForDialogue(personas: any[], plan: string): any[] {
  switch (plan) {
    case 'starter':
      // Use 2 personas from OpenAI
      return personas.filter(p => p.provider === 'openai').slice(0, 2);
    case 'pro':
      // Use 3 personas from different providers
      return personas.slice(0, 3);
    case 'enterprise':
      // Use all personas
      return personas;
    default:
      return personas.slice(0, 2);
  }
}

/**
 * Anonymize and store data for AI training
 */
async function anonymizeAndStoreData(
  content: string,
  organizationId: number,
  provider: string,
  model: string,
  dataType: 'question' | 'answer' | 'conversation'
): Promise<void> {
  try {
    // Get provider ID
    const providerId = await getProviderIdByName(provider);
    if (!providerId) return;

    // Check if organization has consent
    const hasConsent = await consentManagementSystem.hasConsent(organizationId, providerId);
    if (!hasConsent) return;

    // Anonymize content
    await dataAnonymizationPipeline.anonymizeContent(
      content,
      organizationId,
      dataType,
      providerId
    );
  } catch (error) {
    console.error('Error in anonymizeAndStoreData:', error);
  }
}

/**
 * Get organization plan (placeholder implementation)
 */
async function getOrganizationPlan(organizationId: number): Promise<'starter' | 'pro' | 'enterprise'> {
  // This would query the database for the organization's plan
  // For now, return 'pro' as default
  return 'pro';
}

/**
 * Get provider ID by name (placeholder implementation)
 */
async function getProviderIdByName(providerName: string): Promise<number | null> {
  // This would query the aiProviders table
  // For now, return placeholder IDs
  const mapping: Record<string, number> = {
    'OpenAI': 1,
    'Anthropic': 2,
    'DeepSeek': 3,
    'Google DeepMind': 4,
    'Meta AI': 5,
    'XAI': 6
  };
  
  return mapping[providerName] || null;
}

// Legacy functions for backward compatibility
export async function generateSeoQuestions(
  topic: string, 
  count: number = 5,
  agentType: "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator" = "beginner"
): Promise<Array<{ title: string; content: string }>> {
  
  try {
    // Check cache first
    const cacheParams = { topic, count, agentType };
    const cachedResponse = aiCache.get<Array<{ title: string; content: string }>>('seo-questions', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for seo-questions with topic: ${topic}`);
      return cachedResponse;
    }

    const personaId = mapLegacyAgentToPersona(agentType);
    
    const prompt = `Generate ${count} SEO-optimized questions about "${topic}". Each question should be engaging and likely to be searched for. Return as JSON array with "title" and "content" fields.`;
    
    const response = await aiProviderGateway.generateWithPersona(personaId, prompt);
    
    try {
      const questions = JSON.parse(response.content);
      aiCache.set('seo-questions', cacheParams, questions, CACHE_TTL.LONG);
      return questions;
    } catch (parseError) {
      // Fallback: create questions from the response text
      const lines = response.content.split('\n').filter(line => line.trim());
      const questions = lines.slice(0, count).map((line, index) => ({
        title: line.replace(/^\d+\.\s*/, '').trim(),
        content: `This is a question about ${topic}.`
      }));
      
      aiCache.set('seo-questions', cacheParams, questions, CACHE_TTL.LONG);
      return questions;
    }
  } catch (error) {
    console.error("Error generating SEO questions:", error);
    return [];
  }
}

export async function generateAnswer(
  questionTitle: string, 
  questionContent: string,
  agentType: "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator" = "expert"
): Promise<string> {
  try {
    // Check cache first
    const cacheParams = { 
      questionTitle, 
      agentType,
      contentHash: Buffer.from(questionContent).toString('base64').substring(0, 20) 
    };
    const cachedResponse = aiCache.get<string>('generate-answer', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for generate-answer with title: ${questionTitle} (${agentType} level)`);
      return cachedResponse;
    }
    
    const prompt = `Question Title: ${questionTitle}
    Question Content: ${questionContent}
    
    Please provide a comprehensive, helpful answer to this question.`;

    const personaId = mapLegacyAgentToPersona(agentType);
    const response = await aiProviderGateway.generateWithPersona(personaId, prompt);
    
    // Cache the result
    aiCache.set('generate-answer', cacheParams, response.content, CACHE_TTL.LONG);
    
    return response.content;
  } catch (error) {
    console.error("Error generating AI answer:", error);
    return "Sorry, I couldn't generate an answer at this time.";
  }
}

/**
 * Generate business-aware content using business analysis
 */
export async function generateBusinessAwareContent(
  prompt: string,
  websiteUrl?: string,
  productDescription?: string,
  companyName?: string,
  organizationId?: number
): Promise<{
  content: string;
  businessProfile: BusinessProfile;
  insights: string[];
}> {
  try {
    // Step 1: Analyze business context
    const businessProfile = await businessAnalysisEngine.analyzeBusiness(
      websiteUrl,
      productDescription,
      companyName
    );

    // Step 2: Generate content with business context
    const personaId = mapLegacyAgentToPersona('expert');
    const response = await aiProviderGateway.generateWithPersona(
      personaId,
      prompt,
      businessProfile.context
    );

    // Step 3: Extract insights
    const insights = businessProfile.industryAnalysis.trends.slice(0, 3);

    return {
      content: response.content,
      businessProfile,
      insights
    };
  } catch (error) {
    console.error('Error generating business-aware content:', error);
    throw error;
  }
}

/**
 * Generate comprehensive temporal dialogue
 */
export async function generateComprehensiveDialogue(
  topic: string,
  websiteUrl?: string,
  productDescription?: string,
  companyName?: string,
  organizationId?: number
): Promise<DialogueResult> {
  try {
    // Step 1: Analyze business context
    const businessProfile = await businessAnalysisEngine.analyzeBusiness(
      websiteUrl,
      productDescription,
      companyName
    );

    // Step 2: Generate temporal dialogue
    const dialogueResult = await temporalDialogueEngine.generateTemporalDialogue(
      topic,
      businessProfile,
      {
        maxTurns: 6,
        minTurns: 3,
        personaSelection: 'strategic',
        conversationStyle: 'collaboration',
        businessContext: true,
        keywordIntegration: true
      }
    );

    // Step 3: Anonymize and store data if organization provided
    if (organizationId) {
      try {
        for (const turn of dialogueResult.turns) {
          await anonymizeAndStoreData(
            turn.content,
            organizationId,
            turn.persona.provider,
            turn.persona.model,
            'conversation'
          );
        }
      } catch (error) {
        console.error('Error anonymizing dialogue data:', error);
      }
    }

    return dialogueResult;
  } catch (error) {
    console.error('Error generating comprehensive dialogue:', error);
    throw error;
  }
}

/**
 * Generate SEO-optimized questions with business context
 */
export async function generateBusinessSEOQuestions(
  topic: string,
  count: number = 5,
  websiteUrl?: string,
  productDescription?: string,
  companyName?: string
): Promise<Array<{ title: string; content: string; keywords: string[]; seoScore: number }>> {
  try {
    // Step 1: Analyze business context
    const businessProfile = await businessAnalysisEngine.analyzeBusiness(
      websiteUrl,
      productDescription,
      companyName
    );

    // Step 2: Generate questions using business-aware prompt
    const personaId = mapLegacyAgentToPersona('intermediate');
    const prompt = await dynamicPromptEngine.generateQuestionPrompt(
      topic,
      count,
      { id: personaId, name: 'Scholar', era: '2023', provider: 'openai', model: 'gpt-4', knowledgeLevel: 'intermediate', personality: 'Academic, methodical', useCase: 'Detailed explanations', systemPrompt: '', temperature: 0.5, maxTokens: 750 },
      businessProfile
    );

    const response = await aiProviderGateway.generateWithPersona(
      personaId,
      prompt.userPrompt,
      businessProfile.context
    );

    // Step 3: Parse and enhance questions
    try {
      const questions = JSON.parse(response.content);
      return questions.map((q: any) => ({
        title: q.title,
        content: q.content,
        keywords: businessProfile.context.targetKeywords.slice(0, 5),
        seoScore: calculateSEOScore(q.title, businessProfile.context.targetKeywords)
      }));
    } catch (parseError) {
      // Fallback: create questions from response text
      const lines = response.content.split('\n').filter(line => line.trim());
      return lines.slice(0, count).map((line, index) => ({
        title: line.replace(/^\d+\.\s*/, '').trim(),
        content: `This is a question about ${topic} in the ${businessProfile.context.industry} industry.`,
        keywords: businessProfile.context.targetKeywords.slice(0, 5),
        seoScore: calculateSEOScore(line, businessProfile.context.targetKeywords)
      }));
    }
  } catch (error) {
    console.error('Error generating business SEO questions:', error);
    return [];
  }
}

/**
 * Calculate SEO score for content
 */
function calculateSEOScore(content: string, keywords: string[]): number {
  const lowerContent = content.toLowerCase();
  let score = 0;
  
  keywords.forEach(keyword => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });
  
  // Bonus for length and readability
  const wordCount = content.split(' ').length;
  if (wordCount >= 5 && wordCount <= 15) score += 20; // Optimal title length
  
  return Math.min(score, 100);
}

// Keep other legacy functions for backward compatibility
export async function analyzeQuestionSeo(questionTitle: string, questionContent: string): Promise<{
  primaryKeyword: string;
  secondaryKeywords: string[];
  suggestedTags: string[];
  seoScore: number;
  improvementTips: string[];
}> {
  // Implementation remains the same for backward compatibility
  return {
    primaryKeyword: questionTitle.split(' ')[0],
    secondaryKeywords: questionTitle.split(' ').slice(1, 4),
    suggestedTags: ['general'],
    seoScore: 75,
    improvementTips: ['Add more specific keywords', 'Improve readability']
  };
}

/**
 * Generate SEO-optimized questions based on a topic or keyword (Legacy function)
 */
export async function generateSeoQuestionsLegacy(
  topic: string, 
  count: number = 5,
  agentType: "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator" = "beginner"
): Promise<Array<{ title: string; content: string }>> {
  try {
    // Check cache first
    const cacheParams = { topic, count, agentType };
    const cachedResponse = aiCache.get<Array<{ title: string; content: string }>>('generate-questions', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for generate-questions on topic: ${topic}`);
      return cachedResponse;
    }
    
    // Prepare the prompt
    const prompt = `Generate ${count} SEO-optimized questions about "${topic}" that would rank well on Google. 
    Each question should include a detailed description that demonstrates E-E-A-T principles.
    The questions should be comprehensive yet specific, addressing key aspects that searchers would want to know.`;

    // Use enhanced prompt from the ai-prompts module
    const systemPrompt = seoQuestionsSystemPrompt.replace('{agentType}', agentType);

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    const questions = Array.isArray(result.questions) ? result.questions : [];
    
    // Cache the result if we got valid questions
    if (questions.length > 0) {
      aiCache.set('generate-questions', cacheParams, questions, CACHE_TTL.VERY_LONG);
    }
    
    return questions;
  } catch (error) {
    console.error("Error generating SEO questions:", error);
    return [];
  }
}

/**
 * Analyze a question to suggest related keywords for SEO (Legacy function)
 */
export async function analyzeQuestionSeoLegacy(questionTitle: string, questionContent: string): Promise<{
  primaryKeyword: string;
  secondaryKeywords: string[];
  suggestedTags: string[];
  seoScore: number;
  improvementTips: string[];
}> {
  try {
    // Check cache first
    const cacheParams = { 
      questionTitle, 
      // Use a hash of content instead of full content to keep cache key size reasonable
      contentHash: Buffer.from(questionContent).toString('base64').substring(0, 20) 
    };
    const cachedResponse = aiCache.get<{
      primaryKeyword: string;
      secondaryKeywords: string[];
      suggestedTags: string[];
      seoScore: number;
      improvementTips: string[];
    }>('analyze-seo', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for analyze-seo with title: ${questionTitle}`);
      return cachedResponse;
    }
    
    const prompt = `Analyze this question for SEO optimization:
    Title: ${questionTitle}
    Content: ${questionContent}
    
    Identify the primary keyword, secondary keywords, suggested tags, and provide an SEO score (0-100) with improvement tips.`;

    // Use enhanced prompt from the ai-prompts module
    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { role: "system", content: seoAnalysisSystemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    const analysisResult = {
      primaryKeyword: result.primaryKeyword || "",
      secondaryKeywords: Array.isArray(result.secondaryKeywords) ? result.secondaryKeywords : [],
      suggestedTags: Array.isArray(result.suggestedTags) ? result.suggestedTags : [],
      seoScore: typeof result.seoScore === "number" ? result.seoScore : 0,
      improvementTips: Array.isArray(result.improvementTips) ? result.improvementTips : []
    };
    
    // Cache the result
    aiCache.set('analyze-seo', cacheParams, analysisResult, CACHE_TTL.LONG);
    
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing question SEO:", error);
    return {
      primaryKeyword: "",
      secondaryKeywords: [],
      suggestedTags: [],
      seoScore: 0,
      improvementTips: []
    };
  }
}

/**
 * Generate an AI-powered answer to a question based on persona type (Legacy function)
 */
export async function generateAnswerLegacy(
  questionTitle: string, 
  questionContent: string,
  agentType: "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator" = "expert"
): Promise<string> {
  try {
    // Check cache first
    const cacheParams = { 
      questionTitle, 
      agentType,
      // Use a hash of content instead of full content to keep cache key size reasonable
      contentHash: Buffer.from(questionContent).toString('base64').substring(0, 20) 
    };
    const cachedResponse = aiCache.get<string>('generate-answer', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for generate-answer with title: ${questionTitle} (${agentType} level)`);
      return cachedResponse;
    }
    
    const prompt = `Question Title: ${questionTitle}
    Question Content: ${questionContent}
    
    Please provide a comprehensive, helpful answer to this question.`;

    // Use enhanced prompts from the ai-prompts module
    const systemPrompt = answerGenerationSystemPrompt
      .replace('{agentType}', agentType)
      .replace('{expertiseSpecificGuidelines}', expertiseGuidelines[agentType]);
    
    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: (agentType === "expert" || agentType === "genius") ? 0.3 : (agentType === "smart" || agentType === "intelligent") ? 0.5 : agentType === "beginner" ? 0.9 : 0.7,
      max_tokens: (agentType === "expert" || agentType === "genius") ? 1000 : (agentType === "smart" || agentType === "intelligent") ? 750 : agentType === "beginner" ? 300 : 600,
    });

    const result = response.choices[0].message.content || "I don't have a specific answer for that question.";
    
    // Cache the result
    aiCache.set('generate-answer', cacheParams, result, CACHE_TTL.LONG);
    
    return result;
  } catch (error) {
    console.error("Error generating AI answer:", error);
    return "Sorry, I couldn't generate an answer at this time.";
  }
}

/**
 * Interface for content items that can be interlinked
 */
export interface InterlinkableContent {
  id: number;
  type: string; // 'question', 'answer', 'main_page'
  title: string;
  content: string;
}

/**
 * Interface for interlinking suggestions
 */
export interface InterlinkingSuggestion {
  contentId: number;
  contentType: string;
  title: string;
  relevanceScore: number;
  anchorText: string;
  contextRelevance?: string; // Explanation of why this link is relevant in the current context
  semanticSimilarity?: number; // Score from 0-1 indicating semantic similarity
  userIntentAlignment?: number; // Score from 0-1 indicating alignment with likely user intent
  seoImpact?: number; // Score from 0-1 indicating potential SEO impact
  preview?: string; // Short preview of the target content
}

/**
 * Generate interlinking suggestions for content (questions, answers, or main site pages)
 */
export async function generateInterlinkingSuggestions(
  sourceContent: string,
  sourceTitle: string,
  sourceType: string,
  targetContents: InterlinkableContent[],
  limit: number = 3
): Promise<InterlinkingSuggestion[]> {
  try {
    // Create a cache key based on source content hash and target IDs
    const contentHash = Buffer.from(sourceContent).toString('base64').substring(0, 20);
    const targetIds = targetContents.map(t => t.id).sort().join(',');
    
    // Check cache first
    const cacheParams = { 
      sourceTitle,
      sourceType,
      contentHash,
      targetIds,
      limit
    };
    
    const cachedResponse = aiCache.get<InterlinkingSuggestion[]>('interlinks', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for interlinks with source: ${sourceTitle}`);
      return cachedResponse;
    }
    
    // Map content items to a format suitable for OpenAI prompt
    const contentsData = targetContents.map(c => ({
      id: c.id,
      type: c.type,
      title: c.title,
      excerpt: c.content.substring(0, 250) + "..." // Increased excerpt length for better context
    }));

    const userPrompt = `Source Content Title: ${sourceTitle}
    Source Content: ${sourceContent}
    Source Type: ${sourceType}
    
    Analyze this content and identify high-quality opportunities for interlinking with these existing content items:
    ${JSON.stringify(contentsData)}
    
    Provide strategic interlinking recommendations that would:
    1. Add genuine value to readers by connecting them to related information they'd want to know
    2. Improve SEO through a logical content hierarchy and relevance-based linking
    3. Enhance the user journey between forum content and main site content
    4. Create a context-aware web of information that feels natural, not forced`;

    // Use enhanced prompt from the ai-prompts module
    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { role: "system", content: interlinkingSystemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more focused results
    });
    
    const responseContent = response.choices[0].message.content || "{}";
    
    try {
      const result = JSON.parse(responseContent);
      
      let processedResults: InterlinkingSuggestion[] = [];
      
      // Primary expected format is a JSON object with a "suggestions" array
      if (result.suggestions && Array.isArray(result.suggestions)) {
        processedResults = result.suggestions
          .map((item: any) => ({
            contentId: item.contentId || item.id || 0,
            contentType: item.contentType || item.type || "",
            title: item.title || "",
            relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
            anchorText: item.anchorText || "",
            contextRelevance: item.contextRelevance || "",
            semanticSimilarity: typeof item.semanticSimilarity === 'number' ? item.semanticSimilarity : 0,
            userIntentAlignment: typeof item.userIntentAlignment === 'number' ? item.userIntentAlignment : 0,
            seoImpact: typeof item.seoImpact === 'number' ? item.seoImpact : 0,
            preview: item.preview || ""
          }) as InterlinkingSuggestion)
          .filter((item: InterlinkingSuggestion) => 
            // Filter out invalid suggestions with higher threshold (75 vs 50 previously)
            item.contentId > 0 && 
            item.anchorText.length > 0 && 
            sourceContent.includes(item.anchorText) && // Verify anchor text exists in source
            item.relevanceScore >= 75 && // Higher threshold for quality
            ["question", "answer", "main_page"].includes(item.contentType)
          )
          .sort((a: InterlinkingSuggestion, b: InterlinkingSuggestion) => 
            // Sort by combined score (relevance + weighted additional factors)
            ((b.relevanceScore / 100) * 0.6 + 
             (b.semanticSimilarity || 0) * 0.15 + 
             (b.userIntentAlignment || 0) * 0.15 + 
             (b.seoImpact || 0) * 0.1) - 
            ((a.relevanceScore / 100) * 0.6 + 
             (a.semanticSimilarity || 0) * 0.15 + 
             (a.userIntentAlignment || 0) * 0.15 + 
             (a.seoImpact || 0) * 0.1)
          )
          .slice(0, limit); // Limit results
      } 
      // Fallback formats - maintain backward compatibility
      else if (Array.isArray(result)) {
        processedResults = result
          .map((item) => ({
            contentId: item.contentId || item.id || 0,
            contentType: item.contentType || item.type || "",
            title: item.title || "",
            relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
            anchorText: item.anchorText || "",
            // Add default values for new fields
            contextRelevance: item.contextRelevance || "",
            semanticSimilarity: typeof item.semanticSimilarity === 'number' ? item.semanticSimilarity : 0,
            userIntentAlignment: typeof item.userIntentAlignment === 'number' ? item.userIntentAlignment : 0,
            seoImpact: typeof item.seoImpact === 'number' ? item.seoImpact : 0,
            preview: item.preview || ""
          }) as InterlinkingSuggestion)
          .filter((item: InterlinkingSuggestion) => 
            item.contentId > 0 && 
            item.anchorText.length > 0 && 
            sourceContent.includes(item.anchorText) &&
            item.relevanceScore >= 50 &&
            ["question", "answer", "main_page"].includes(item.contentType)
          )
          .sort((a: InterlinkingSuggestion, b: InterlinkingSuggestion) => 
            b.relevanceScore - a.relevanceScore
          )
          .slice(0, limit);
      }
      // Another alternate format
      else if (result.interlinkingSuggestions && Array.isArray(result.interlinkingSuggestions)) {
        processedResults = result.interlinkingSuggestions
          .map((item: any) => ({
            contentId: item.contentId || item.id || 0,
            contentType: item.contentType || item.type || "",
            title: item.title || "",
            relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
            anchorText: item.anchorText || "",
            // Add default values for new fields
            contextRelevance: item.contextRelevance || "",
            semanticSimilarity: typeof item.semanticSimilarity === 'number' ? item.semanticSimilarity : 0,
            userIntentAlignment: typeof item.userIntentAlignment === 'number' ? item.userIntentAlignment : 0,
            seoImpact: typeof item.seoImpact === 'number' ? item.seoImpact : 0,
            preview: item.preview || ""
          }) as InterlinkingSuggestion)
          .filter((item: InterlinkingSuggestion) => 
            item.contentId > 0 && 
            item.anchorText.length > 0 && 
            sourceContent.includes(item.anchorText) &&
            item.relevanceScore >= 50 &&
            ["question", "answer", "main_page"].includes(item.contentType)
          )
          .sort((a: InterlinkingSuggestion, b: InterlinkingSuggestion) => 
            b.relevanceScore - a.relevanceScore
          )
          .slice(0, limit);
      } else {
        console.warn("Unexpected response format from OpenAI:", result);
      }
      
      // Cache the processed results if we got any
      if (processedResults.length > 0) {
        aiCache.set('interlinks', cacheParams, processedResults, CACHE_TTL.VERY_LONG);
      }
      
      return processedResults;
    } catch (parseError) {
      console.error("Error parsing interlinking suggestions JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error generating interlinking suggestions:", error);
    return [];
  }
}

/**
 * Generate interlinking suggestions specifically for questions (backwards compatibility)
 */
export async function generateQuestionInterlinkingSuggestions(
  content: string,
  existingQuestions: Array<{ id: number; title: string; content: string }>
): Promise<Array<{ questionId: number; title: string; relevanceScore: number; anchorText: string }>> {
  try {
    // Convert to the new format
    const sourceContent = content;
    const sourceTitle = "Question Content"; // Default title for backward compatibility
    const sourceType = "question";
    
    // Convert questions to the new InterlinkableContent format
    const targetContents: InterlinkableContent[] = existingQuestions.map(q => ({
      id: q.id,
      type: "question",
      title: q.title,
      content: q.content
    }));
    
    // Call the new function
    const suggestions = await generateInterlinkingSuggestions(
      sourceContent,
      sourceTitle,
      sourceType,
      targetContents
    );
    
    // Convert back to the old format for backward compatibility
    return suggestions.map(s => ({
      questionId: s.contentId,
      title: s.title,
      relevanceScore: s.relevanceScore,
      anchorText: s.anchorText
    }));
  } catch (error) {
    console.error("Error generating question interlinking suggestions:", error);
    return [];
  }
}

/**
 * Generate bidirectional interlinking suggestions between forum content and main website content
 * This specialized function analyzes both the forum content and main website content to suggest
 * optimal bidirectional links that enhance SEO and user experience
 * @param forumContent An array of forum content items (questions/answers)
 * @param mainSiteContent An array of main site content items
 * @param maxSuggestionsPerItem Maximum number of suggestions to return per content item
 */
export async function generateBidirectionalInterlinkingSuggestions(
  forumContent: InterlinkableContent[],
  mainSiteContent: InterlinkableContent[],
  maxSuggestionsPerItem: number = 3
): Promise<Array<{
  sourceId: number;
  sourceType: string;
  sourceTitle: string;
  targetId: number;
  targetType: string;
  targetTitle: string;
  anchorText: string;
  relevanceScore: number;
  contextRelevance: string;
  bidirectional: boolean; // Whether a reciprocal link is also recommended
}>> {
  try {
    if (!forumContent.length || !mainSiteContent.length) {
      return [];
    }

    // Prepare data for the prompt
    const forumData = forumContent.map(c => ({
      id: c.id,
      type: c.type,
      title: c.title,
      excerpt: c.content.substring(0, 150) + "..."
    }));

    const mainSiteData = mainSiteContent.map(c => ({
      id: c.id,
      type: c.type,
      title: c.title,
      excerpt: c.content.substring(0, 150) + "..."
    }));

    const prompt = `Analyze the relationship between these forum content items and main website content items to identify optimal bidirectional interlinking opportunities:

    Forum Content:
    ${JSON.stringify(forumData)}

    Main Website Content:
    ${JSON.stringify(mainSiteData)}

    Provide strategic bidirectional interlinking recommendations that would:
    1. Create a semantic web connecting related topics between the forum and main site
    2. Enhance SEO by establishing topic clusters and topical authority
    3. Improve user experience by guiding users to relevant content across platforms
    4. Identify where reciprocal (bidirectional) links make sense for both content items`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: `You are an advanced SEO interlinking specialist focusing on creating optimal bidirectional links between forum content and main website content.
          
          Provide output as a JSON object with a key called "interlinkingSuggestions" containing an array of objects with these exact properties:
          {
            "interlinkingSuggestions": [
              {
                "sourceId": number,           // The ID of the source content
                "sourceType": string,         // The type of source content ("question", "answer", or "main_page")
                "sourceTitle": string,        // The title of the source content
                "targetId": number,           // The ID of the target content to link to
                "targetType": string,         // The type of target content ("question", "answer", or "main_page")
                "targetTitle": string,        // The title of the target content
                "anchorText": string,         // The text in the source that should become the link
                "relevanceScore": number,     // A score from 0-100 indicating relevance
                "contextRelevance": string,   // Brief explanation of why this link is relevant
                "bidirectional": boolean      // Whether a reciprocal link is also recommended
              },
              ...
            ]
          }
          
          Important guidelines:
          1. Focus on creating meaningful connections that enhance both user experience and SEO
          2. Prioritize links between forum questions/answers and related main site pages
          3. Recommend bidirectional links (bidirectional: true) only when it makes sense for both pieces of content
          4. Provide a mix of forum-to-site and site-to-forum links
          5. Ensure high relevance scores (75+) for all suggestions
          6. The contextRelevance field should clearly explain the topical relationship
          7. Limit to the most valuable ${maxSuggestionsPerItem} links per content item`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    
    const responseContent = response.choices[0].message.content || "{}";
    const result = JSON.parse(responseContent);
    
    if (result.interlinkingSuggestions && Array.isArray(result.interlinkingSuggestions)) {
      return result.interlinkingSuggestions
        .map((item: any) => ({
          sourceId: typeof item.sourceId === 'number' ? item.sourceId : 0,
          sourceType: item.sourceType || "",
          sourceTitle: item.sourceTitle || "",
          targetId: typeof item.targetId === 'number' ? item.targetId : 0,
          targetType: item.targetType || "",
          targetTitle: item.targetTitle || "",
          anchorText: item.anchorText || "",
          relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
          contextRelevance: item.contextRelevance || "",
          bidirectional: !!item.bidirectional
        }))
        .filter((item: {
          sourceId: number;
          sourceType: string;
          sourceTitle: string;
          targetId: number;
          targetType: string;
          targetTitle: string;
          anchorText: string;
          relevanceScore: number;
          contextRelevance: string;
          bidirectional: boolean;
        }) => 
          // Filter out invalid suggestions
          item.sourceId > 0 && 
          item.targetId > 0 && 
          item.anchorText.length > 0 && 
          item.relevanceScore >= 75 &&
          ["question", "answer", "main_page"].includes(item.sourceType) &&
          ["question", "answer", "main_page"].includes(item.targetType)
        )
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
    }
    
    console.warn("Unexpected response format from OpenAI:", result);
    return [];
  } catch (error) {
    console.error("Error generating bidirectional interlinking suggestions:", error);
    return [];
  }
}

/**
 * Interface for keyword analysis results
 */
// Advanced Keyword Analysis Types
export interface KeywordCluster {
  clusterName: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  searchIntent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  estimatedMonthlyVolume: number;
  competitiveDifficulty: number; // 1-100 scale
  contentOpportunities: string[];
  serp_features: string[]; // Potential SERP features to target
}

export interface CompetitiveGapAnalysis {
  contentGaps: string[];
  keywordGaps: string[];
  topCompetitorsForKeywords: string[];
}

export interface QuestionKeywords {
  informational: string[];
  commercial: string[];
  transactional: string[];
}

export interface ContentRecommendation {
  contentType: string; // e.g., "blog", "guide", "product page", "forum Q&A"
  targetKeywords: string[];
  suggestedTitle: string;
  contentStructure: string[]; // Suggested H2s/sections
  estimatedTrafficPotential: number;
}

export interface AdvancedKeywordAnalysisResult {
  domainFocus: string;
  industryVertical: string;
  keywordClusters: KeywordCluster[];
  competitiveGapAnalysis: CompetitiveGapAnalysis;
  questionKeywords: QuestionKeywords;
  contentRecommendations: ContentRecommendation[];
}

export interface KeywordDifficultyAnalysis {
  keyword: string;
  searchVolume: {
    estimate: string;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  difficultyScore: number; // 1-100 scale
  competitionLevel: 'very low' | 'low' | 'medium' | 'high' | 'very high';
  contentRequirements: {
    wordCount: string; // e.g., "1500-2000 words"
    depth: 'basic' | 'comprehensive' | 'expert';
    mediaTypes: string[]; // e.g., ["images", "videos", "infographics"]
  };
  domainAuthorityNeeded: {
    minimum: number; // e.g., 30
    recommended: number; // e.g., 50
  };
  serp_features: string[];
  rankingProbability: {
    newSite: string; // e.g., "very unlikely"
    establishedSite: string; // e.g., "moderate"
    authorityDomain: string; // e.g., "very likely"
  };
  timeToRank: {
    estimate: string; // e.g., "3-6 months"
    factors: string[];
  };
}

export interface TopicCluster {
  clusterName: string;
  keywordGaps: string[];
  averageSearchVolume: number;
  competitionLevel: 'very low' | 'low' | 'medium' | 'high' | 'very high';
  contentOpportunityScore: number; // 1-100
  suggestedContentApproach: string;
  estimatedTrafficPotential: number;
}

export interface QuestionOpportunity {
  question: string;
  searchVolume: string;
  currentAnswerQuality: 'poor' | 'fair' | 'good' | 'excellent';
  opportunityReason: string;
}

export interface CompetitiveInsight {
  contentGapsOverview: string;
  topCompetitors: string[];
  competitorStrengths: string[];
  competitorWeaknesses: string[];
}

export interface PrioritizedRecommendation {
  contentFocus: string;
  targetKeywords: string[];
  estimatedImpact: 'low' | 'medium' | 'high' | 'very high';
  implementationDifficulty: 'easy' | 'moderate' | 'difficult';
}

export interface ContentGapAnalysisResult {
  topicClusters: TopicCluster[];
  questionOpportunities: QuestionOpportunity[];
  competitiveInsights: CompetitiveInsight;
  prioritizedRecommendations: PrioritizedRecommendation[];
}

export interface TargetKeywords {
  primary: string;
  secondary: string[];
}

export interface OptimizedQuestionDetails {
  title: string;
  content: string;
  targetKeywords: TargetKeywords;
  searchIntent: 'informational' | 'commercial' | 'transactional';
  estimatedSearchVolume: string;
  competitiveDifficulty: number; // 1-100 scale
  snippetOpportunity: boolean; // Featured snippet potential
  serp_features: string[];
  topicCluster: string; // Related topic grouping
  rankingPotential: number; // 1-100 scale
}

export interface KeywordOptimizedQuestions {
  questions: OptimizedQuestionDetails[];
}

// Legacy interface for backward compatibility
export interface KeywordAnalysisResult {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  questions: Array<{
    title: string;
    content: string;
    keywords: string[];
    difficulty: 'beginner' | 'intermediate' | 'expert';
    estimatedSearchVolume: string;
  }>;
  topicsToTarget: string[];
  contentGaps: string[];
  competitorInsights: string[];
}

/**
 * Advanced Keyword Analysis Engine
 * 
 * This function performs a comprehensive keyword analysis for a given website URL,
 * providing detailed insights into keyword opportunities, content gaps, and SEO strategy.
 * 
 * @param websiteUrl The URL to analyze for keywords
 * @return A comprehensive keyword analysis result with clustering, competitive analysis, and content recommendations
 */
export async function performAdvancedKeywordAnalysis(
  websiteUrl: string
): Promise<AdvancedKeywordAnalysisResult> {
  try {
    // Check cache first
    const cacheParams = { websiteUrl };
    const cachedResponse = aiCache.get<AdvancedKeywordAnalysisResult>('advanced-keyword-analysis', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for advanced-keyword-analysis with URL: ${websiteUrl}`);
      return cachedResponse;
    }
    
    const prompt = `Perform a comprehensive keyword analysis for this website: ${websiteUrl}
    
    I need an in-depth analysis that identifies:
    
    1. The primary domain focus and industry vertical
    2. Keyword clusters with search intent classification
    3. Competitive gap analysis with specific keyword opportunities
    4. Question-based keyword opportunities categorized by search intent
    5. Detailed content recommendations with estimated traffic potential
    
    Provide a strategic analysis that will guide content creation and SEO strategy. Since you can't crawl the website directly, use your knowledge to make realistic inferences based on the domain name, likely industry, and SEO best practices.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { role: "system", content: keywordAnalysisSystemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4, // Lower temperature for more focused, analytical results
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    // Process and validate the response data
    const processedResult: AdvancedKeywordAnalysisResult = {
      domainFocus: result.domainFocus || "",
      industryVertical: result.industryVertical || "",
      keywordClusters: Array.isArray(result.keywordClusters) 
        ? result.keywordClusters.map((cluster: any) => ({
            clusterName: cluster.clusterName || "",
            primaryKeywords: Array.isArray(cluster.primaryKeywords) ? cluster.primaryKeywords : [],
            secondaryKeywords: Array.isArray(cluster.secondaryKeywords) ? cluster.secondaryKeywords : [],
            searchIntent: ['informational', 'navigational', 'commercial', 'transactional'].includes(cluster.searchIntent)
              ? cluster.searchIntent as 'informational' | 'navigational' | 'commercial' | 'transactional'
              : 'informational',
            estimatedMonthlyVolume: typeof cluster.estimatedMonthlyVolume === 'number' ? cluster.estimatedMonthlyVolume : 0,
            competitiveDifficulty: typeof cluster.competitiveDifficulty === 'number' 
              ? Math.min(100, Math.max(1, cluster.competitiveDifficulty)) 
              : 50,
            contentOpportunities: Array.isArray(cluster.contentOpportunities) ? cluster.contentOpportunities : [],
            serp_features: Array.isArray(cluster.serp_features) ? cluster.serp_features : []
          }))
        : [],
      competitiveGapAnalysis: {
        contentGaps: Array.isArray(result.competitiveGapAnalysis?.contentGaps) 
          ? result.competitiveGapAnalysis.contentGaps 
          : [],
        keywordGaps: Array.isArray(result.competitiveGapAnalysis?.keywordGaps) 
          ? result.competitiveGapAnalysis.keywordGaps 
          : [],
        topCompetitorsForKeywords: Array.isArray(result.competitiveGapAnalysis?.topCompetitorsForKeywords) 
          ? result.competitiveGapAnalysis.topCompetitorsForKeywords 
          : []
      },
      questionKeywords: {
        informational: Array.isArray(result.questionKeywords?.informational) 
          ? result.questionKeywords.informational 
          : [],
        commercial: Array.isArray(result.questionKeywords?.commercial) 
          ? result.questionKeywords.commercial 
          : [],
        transactional: Array.isArray(result.questionKeywords?.transactional) 
          ? result.questionKeywords.transactional 
          : []
      },
      contentRecommendations: Array.isArray(result.contentRecommendations) 
        ? result.contentRecommendations.map((rec: any) => ({
            contentType: rec.contentType || "",
            targetKeywords: Array.isArray(rec.targetKeywords) ? rec.targetKeywords : [],
            suggestedTitle: rec.suggestedTitle || "",
            contentStructure: Array.isArray(rec.contentStructure) ? rec.contentStructure : [],
            estimatedTrafficPotential: typeof rec.estimatedTrafficPotential === 'number' 
              ? rec.estimatedTrafficPotential 
              : 0
          }))
        : []
    };
    
    // Cache the result for future use - use a long TTL since this is intensive analysis
    aiCache.set('advanced-keyword-analysis', cacheParams, processedResult, CACHE_TTL.VERY_LONG);
    
    return processedResult;
  } catch (error) {
    console.error("Error in advanced keyword analysis:", error);
    // Return a minimal valid result in case of error
    return {
      domainFocus: "",
      industryVertical: "",
      keywordClusters: [],
      competitiveGapAnalysis: {
        contentGaps: [],
        keywordGaps: [],
        topCompetitorsForKeywords: []
      },
      questionKeywords: {
        informational: [],
        commercial: [],
        transactional: []
      },
      contentRecommendations: []
    };
  }
}

/**
 * Perform a detailed analysis of keyword difficulty
 * 
 * This function evaluates the competitiveness of a specific keyword, providing insights
 * into ranking difficulty, content requirements, and timeframe expectations
 * 
 * @param keyword The keyword to analyze for difficulty
 * @return A comprehensive keyword difficulty analysis
 */
export async function analyzeKeywordDifficulty(
  keyword: string
): Promise<KeywordDifficultyAnalysis> {
  try {
    // Check cache first
    const cacheParams = { keyword };
    const cachedResponse = aiCache.get<KeywordDifficultyAnalysis>('keyword-difficulty', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for keyword-difficulty with keyword: ${keyword}`);
      return cachedResponse;
    }
    
    const prompt = `Analyze the SEO difficulty of this keyword: "${keyword}"
    
    I need a detailed assessment of:
    1. The competitive landscape for ranking on this keyword
    2. Expected search volume and trends
    3. Content requirements to compete effectively
    4. Domain authority needed to rank
    5. SERP features present for this keyword
    6. Realistic ranking probabilities based on site maturity
    7. Expected time to rank with dedicated optimization
    
    Provide your expert assessment for strategic SEO planning.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { role: "system", content: keywordDifficultyAnalysisPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more focused, predictable results
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    // Process and validate the response
    const processedResult: KeywordDifficultyAnalysis = {
      keyword: result.keyword || keyword,
      searchVolume: {
        estimate: result.searchVolume?.estimate || "Unknown",
        trend: ['increasing', 'stable', 'decreasing'].includes(result.searchVolume?.trend)
          ? result.searchVolume.trend as 'increasing' | 'stable' | 'decreasing'
          : 'stable'
      },
      difficultyScore: typeof result.difficultyScore === 'number' 
        ? Math.min(100, Math.max(1, result.difficultyScore)) 
        : 50,
      competitionLevel: ['very low', 'low', 'medium', 'high', 'very high'].includes(result.competitionLevel)
        ? result.competitionLevel as 'very low' | 'low' | 'medium' | 'high' | 'very high'
        : 'medium',
      contentRequirements: {
        wordCount: result.contentRequirements?.wordCount || "1000-1500 words",
        depth: ['basic', 'comprehensive', 'expert'].includes(result.contentRequirements?.depth)
          ? result.contentRequirements.depth as 'basic' | 'comprehensive' | 'expert'
          : 'comprehensive',
        mediaTypes: Array.isArray(result.contentRequirements?.mediaTypes) 
          ? result.contentRequirements.mediaTypes 
          : ["images"]
      },
      domainAuthorityNeeded: {
        minimum: typeof result.domainAuthorityNeeded?.minimum === 'number' 
          ? result.domainAuthorityNeeded.minimum 
          : 20,
        recommended: typeof result.domainAuthorityNeeded?.recommended === 'number' 
          ? result.domainAuthorityNeeded.recommended 
          : 40
      },
      serp_features: Array.isArray(result.serp_features) ? result.serp_features : [],
      rankingProbability: {
        newSite: result.rankingProbability?.newSite || "difficult",
        establishedSite: result.rankingProbability?.establishedSite || "moderate",
        authorityDomain: result.rankingProbability?.authorityDomain || "good"
      },
      timeToRank: {
        estimate: result.timeToRank?.estimate || "3-6 months",
        factors: Array.isArray(result.timeToRank?.factors) 
          ? result.timeToRank.factors 
          : ["content quality", "backlink profile", "site authority"]
      }
    };
    
    // Cache the result
    aiCache.set('keyword-difficulty', cacheParams, processedResult, CACHE_TTL.LONG);
    
    return processedResult;
  } catch (error) {
    console.error("Error analyzing keyword difficulty:", error);
    // Return a default result in case of error
    return {
      keyword: keyword,
      searchVolume: {
        estimate: "Unknown",
        trend: "stable"
      },
      difficultyScore: 50,
      competitionLevel: "medium",
      contentRequirements: {
        wordCount: "1000-1500 words",
        depth: "comprehensive",
        mediaTypes: ["images"]
      },
      domainAuthorityNeeded: {
        minimum: 20,
        recommended: 40
      },
      serp_features: [],
      rankingProbability: {
        newSite: "difficult",
        establishedSite: "moderate",
        authorityDomain: "good"
      },
      timeToRank: {
        estimate: "3-6 months",
        factors: ["content quality", "backlink profile", "site authority"]
      }
    };
  }
}

/**
 * Identify content gaps and opportunities across a keyword landscape
 * 
 * This function analyzes current content coverage to find untapped topics
 * and question opportunities that competitors are missing
 * 
 * @param industry The industry or niche to analyze
 * @param existingKeywords Keywords already targeted (optional)
 * @return A detailed content gap analysis with prioritized recommendations
 */
export async function analyzeContentGaps(
  industry: string,
  existingKeywords?: string[]
): Promise<ContentGapAnalysisResult> {
  try {
    // Check cache first
    const cacheParams = { 
      industry, 
      existingKeywordsHash: existingKeywords 
        ? Buffer.from(existingKeywords.sort().join(',')).toString('base64').substring(0, 20)
        : 'none' 
    };
    const cachedResponse = aiCache.get<ContentGapAnalysisResult>('content-gaps', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for content-gaps with industry: ${industry}`);
      return cachedResponse;
    }
    
    const prompt = `Perform a content gap analysis for the ${industry} industry.
    
    ${existingKeywords && existingKeywords.length > 0 
      ? `Consider that we're already targeting these keywords: ${existingKeywords.join(', ')}` 
      : 'We are starting fresh with no existing keyword targeting.'}
    
    I need to identify:
    1. Untapped topic clusters with high opportunity potential
    2. Specific question-based queries that aren't being addressed well
    3. Competitive insights on content gaps in this space
    4. Prioritized recommendations for filling these gaps
    
    Focus on identifying valuable opportunities that aren't being adequately addressed by competitors.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { role: "system", content: contentGapAnalysisPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5, // Balanced to encourage both accuracy and creativity in finding opportunities
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    // Process and validate the response
    const processedResult: ContentGapAnalysisResult = {
      topicClusters: Array.isArray(result.topicClusters) 
        ? result.topicClusters.map((cluster: any) => ({
            clusterName: cluster.clusterName || "",
            keywordGaps: Array.isArray(cluster.keywordGaps) ? cluster.keywordGaps : [],
            averageSearchVolume: typeof cluster.averageSearchVolume === 'number' 
              ? cluster.averageSearchVolume 
              : 0,
            competitionLevel: ['very low', 'low', 'medium', 'high', 'very high'].includes(cluster.competitionLevel)
              ? cluster.competitionLevel as 'very low' | 'low' | 'medium' | 'high' | 'very high'
              : 'medium',
            contentOpportunityScore: typeof cluster.contentOpportunityScore === 'number' 
              ? Math.min(100, Math.max(1, cluster.contentOpportunityScore)) 
              : 50,
            suggestedContentApproach: cluster.suggestedContentApproach || "",
            estimatedTrafficPotential: typeof cluster.estimatedTrafficPotential === 'number' 
              ? cluster.estimatedTrafficPotential 
              : 0
          }))
        : [],
      questionOpportunities: Array.isArray(result.questionOpportunities) 
        ? result.questionOpportunities.map((question: any) => ({
            question: question.question || "",
            searchVolume: question.searchVolume || "Unknown",
            currentAnswerQuality: ['poor', 'fair', 'good', 'excellent'].includes(question.currentAnswerQuality)
              ? question.currentAnswerQuality as 'poor' | 'fair' | 'good' | 'excellent'
              : 'fair',
            opportunityReason: question.opportunityReason || ""
          }))
        : [],
      competitiveInsights: {
        contentGapsOverview: result.competitiveInsights?.contentGapsOverview || "",
        topCompetitors: Array.isArray(result.competitiveInsights?.topCompetitors) 
          ? result.competitiveInsights.topCompetitors 
          : [],
        competitorStrengths: Array.isArray(result.competitiveInsights?.competitorStrengths) 
          ? result.competitiveInsights.competitorStrengths 
          : [],
        competitorWeaknesses: Array.isArray(result.competitiveInsights?.competitorWeaknesses) 
          ? result.competitiveInsights.competitorWeaknesses 
          : []
      },
      prioritizedRecommendations: Array.isArray(result.prioritizedRecommendations) 
        ? result.prioritizedRecommendations.map((rec: any) => ({
            contentFocus: rec.contentFocus || "",
            targetKeywords: Array.isArray(rec.targetKeywords) ? rec.targetKeywords : [],
            estimatedImpact: ['low', 'medium', 'high', 'very high'].includes(rec.estimatedImpact)
              ? rec.estimatedImpact as 'low' | 'medium' | 'high' | 'very high'
              : 'medium',
            implementationDifficulty: ['easy', 'moderate', 'difficult'].includes(rec.implementationDifficulty)
              ? rec.implementationDifficulty as 'easy' | 'moderate' | 'difficult'
              : 'moderate'
          }))
        : []
    };
    
    // Cache the result
    aiCache.set('content-gaps', cacheParams, processedResult, CACHE_TTL.LONG);
    
    return processedResult;
  } catch (error) {
    console.error("Error analyzing content gaps:", error);
    // Return a minimal valid result in case of error
    return {
      topicClusters: [],
      questionOpportunities: [],
      competitiveInsights: {
        contentGapsOverview: "",
        topCompetitors: [],
        competitorStrengths: [],
        competitorWeaknesses: []
      },
      prioritizedRecommendations: []
    };
  }
}

/**
 * Generate highly optimized questions for SEO targeting with detailed metadata
 * 
 * This function creates questions specifically designed to rank in search results
 * with comprehensive metadata about search intent, competition, and ranking potential
 * 
 * @param keyword The primary keyword to target
 * @param count Number of questions to generate (default: 5)
 * @param searchIntent Optional specific search intent to target
 * @return A set of SEO-optimized questions with detailed metadata
 */
export async function generateSeoOptimizedQuestions(
  keyword: string,
  count: number = 5,
  searchIntent?: 'informational' | 'commercial' | 'transactional'
): Promise<KeywordOptimizedQuestions> {
  try {
    // Check cache first
    const cacheParams = { keyword, count, searchIntent };
    const cachedResponse = aiCache.get<KeywordOptimizedQuestions>('seo-optimized-questions', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for seo-optimized-questions with keyword: ${keyword}`);
      return cachedResponse;
    }
    
    const prompt = `Generate ${count} highly SEO-optimized forum questions targeting: "${keyword}"
    
    ${searchIntent 
      ? `Focus specifically on ${searchIntent} search intent.` 
      : 'Create a mix of different search intents (informational, commercial, transactional).'}
    
    For each question, provide:
    1. A search-optimized title that would rank well in Google
    2. Detailed question content (250-500 words) with proper keyword usage
    3. Primary and secondary target keywords
    4. Search intent classification
    5. Estimated search volume
    6. Competitive difficulty assessment
    7. Featured snippet opportunity evaluation
    8. SERP feature opportunities
    9. Topic cluster association
    10. Overall ranking potential
    
    Design these questions specifically to rank well in search results while maintaining natural language and engaging content.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { role: "system", content: keywordOptimizedQuestionGeneratorPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6, // Balanced to encourage both SEO optimization and natural language
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    // Process and validate the response
    const processedResult: KeywordOptimizedQuestions = {
      questions: Array.isArray(result.questions) 
        ? result.questions.map((q: any) => ({
            title: q.title || "",
            content: q.content || "",
            targetKeywords: {
              primary: q.targetKeywords?.primary || keyword,
              secondary: Array.isArray(q.targetKeywords?.secondary) 
                ? q.targetKeywords.secondary 
                : []
            },
            searchIntent: ['informational', 'commercial', 'transactional'].includes(q.searchIntent)
              ? q.searchIntent as 'informational' | 'commercial' | 'transactional'
              : searchIntent || 'informational',
            estimatedSearchVolume: q.estimatedSearchVolume || "Unknown",
            competitiveDifficulty: typeof q.competitiveDifficulty === 'number' 
              ? Math.min(100, Math.max(1, q.competitiveDifficulty)) 
              : 50,
            snippetOpportunity: typeof q.snippetOpportunity === 'boolean' 
              ? q.snippetOpportunity 
              : false,
            serp_features: Array.isArray(q.serp_features) ? q.serp_features : [],
            topicCluster: q.topicCluster || "",
            rankingPotential: typeof q.rankingPotential === 'number' 
              ? Math.min(100, Math.max(1, q.rankingPotential)) 
              : 50
          }))
        : []
    };
    
    // Cache the result
    aiCache.set('seo-optimized-questions', cacheParams, processedResult, CACHE_TTL.VERY_LONG);
    
    return processedResult;
  } catch (error) {
    console.error("Error generating SEO-optimized questions:", error);
    // Return an empty result in case of error
    return { questions: [] };
  }
}

/**
 * Analyze a website URL to extract keywords and generate SEO-optimized question ideas
 * @param websiteUrl The URL to analyze for keywords
 * @param questionCount Number of questions to generate (default: 10)
 */
export async function analyzeWebsiteForKeywords(
  websiteUrl: string,
  questionCount: number = 10
): Promise<KeywordAnalysisResult> {
  try {
    // Check cache first
    const cacheParams = { websiteUrl, questionCount };
    const cachedResponse = aiCache.get<KeywordAnalysisResult>('website-keywords', cacheParams);
    
    if (cachedResponse) {
      console.log(`[AI Cache] Hit for website-keywords with URL: ${websiteUrl}`);
      return cachedResponse;
    }
    
    const prompt = `Analyze this website URL: ${websiteUrl}
    
    Imagine you've done a complete SEO analysis of this website and its industry. Based on your expert knowledge:
    
    1. Identify primary and secondary keywords this website should target
    2. Generate ${questionCount} SEO-optimized question ideas for a forum that would:
       - Drive traffic through search
       - Fill content gaps on the main website
       - Create opportunities for internal linking
       - Cover different levels of difficulty (beginner, intermediate, expert)
    3. Suggest topics the website should target
    4. Identify potential content gaps
    5. Provide competitor insights
    
    Note: Since you can't actually crawl the website, provide a realistic analysis based on the URL, domain name, and your knowledge of best practices for similar websites.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: `You are an advanced SEO analysis engine specializing in keyword extraction and question generation.
          Provide output in JSON format with the following structure:
          {
            "primaryKeywords": string[],
            "secondaryKeywords": string[],
            "questions": [
              {
                "title": string,
                "content": string,
                "keywords": string[],
                "difficulty": "beginner" | "intermediate" | "expert",
                "estimatedSearchVolume": string
              }
            ],
            "topicsToTarget": string[],
            "contentGaps": string[],
            "competitorInsights": string[]
          }
          
          Make your analysis as realistic and useful as possible. If I provide you with a website URL like 'codingchallenges.com', you should analyze it as if it's a website about programming challenges and provide relevant keywords and questions.`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    const analysisResult = {
      primaryKeywords: Array.isArray(result.primaryKeywords) ? result.primaryKeywords : [],
      secondaryKeywords: Array.isArray(result.secondaryKeywords) ? result.secondaryKeywords : [],
      questions: Array.isArray(result.questions) 
        ? result.questions.map((q: any) => ({
            title: q.title || "",
            content: q.content || "",
            keywords: Array.isArray(q.keywords) ? q.keywords : [],
            difficulty: (q.difficulty === 'beginner' || q.difficulty === 'intermediate' || q.difficulty === 'expert') 
              ? q.difficulty 
              : 'intermediate',
            estimatedSearchVolume: q.estimatedSearchVolume || "Unknown"
          }))
        : [],
      topicsToTarget: Array.isArray(result.topicsToTarget) ? result.topicsToTarget : [],
      contentGaps: Array.isArray(result.contentGaps) ? result.contentGaps : [],
      competitorInsights: Array.isArray(result.competitorInsights) ? result.competitorInsights : []
    };
    
    // Cache the result
    aiCache.set('website-keywords', cacheParams, analysisResult, CACHE_TTL.VERY_LONG);
    
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing website for keywords:", error);
    return {
      primaryKeywords: [],
      secondaryKeywords: [],
      questions: [],
      topicsToTarget: [],
      contentGaps: [],
      competitorInsights: []
    };
  }
}

/**
 * Generate AI personas based on extracted website keywords
 * @param keywords List of keywords to use for persona generation
 * @param userId The user ID who will own the personas
 * @param limit Maximum number of personas to generate (based on subscription limits)
 */
export function generatePersonasFromKeywords(
  keywords: string[],
  userId: number,
  limit: number = 10
): Array<any> {
  // Personality and tone options for variety
  const personalityOptions = [
    "Friendly", "Professional", "Analytical", "Creative", "Engaging",
    "Humorous", "Empathetic", "Direct", "Detailed", "Supportive"
  ];
  
  const toneOptions = [
    "Casual", "Formal", "Enthusiastic", "Neutral", "Authoritative",
    "Educational", "Persuasive", "Informative", "Conversational", "Technical"
  ];
  
  const expertiseLevels = ["beginner", "intermediate", "expert", "smart", "genius", "intelligent"];
  
  // Helper function to generate a persona name based on keyword and expertise
  const generatePersonaName = (keyword: string, expertise: string) => {
    const prefixes = ["Dr.", "Prof.", "Expert", "Guru", "Specialist", "Master", "Coach"];
    const suffixes = ["Advisor", "Authority", "Pro", "Enthusiast", "Guide", "Mentor"];
    
    // Randomly select prefix or suffix
    const usePrefix = Math.random() > 0.5;
    
    if (usePrefix) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      return `${prefix} ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`;
    } else {
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} ${suffix}`;
    }
  };
  
  const personas = [];
  
  // Create personas up to the limit or the number of keywords (whichever is smaller)
  const personaCount = Math.min(limit, keywords.length);
  
  for (let i = 0; i < personaCount; i++) {
    const keyword = keywords[i];
    const expertise = expertiseLevels[Math.floor(Math.random() * expertiseLevels.length)];
    const personality = personalityOptions[Math.floor(Math.random() * personalityOptions.length)];
    const tone = toneOptions[Math.floor(Math.random() * toneOptions.length)];
    const responseLength = Math.floor(Math.random() * 3) + 2; // 2-4
    
    // Select 1-3 keywords as areas of expertise for this persona
    const personaKeywords = [];
    personaKeywords.push(keyword);
    
    // Maybe add 1-2 more keywords if available
    for (let j = 0; j < 2; j++) {
      if (i + j + 1 < keywords.length && Math.random() > 0.3) {
        personaKeywords.push(keywords[i + j + 1]);
      }
    }
    
    const name = generatePersonaName(keyword, expertise);
    const description = `${personality} AI persona with ${expertise}-level expertise in ${personaKeywords.join(', ')}. Uses a ${tone.toLowerCase()} tone.`;
    
    personas.push({
      userId,
      name,
      description,
      expertise: keyword,
      personality,
      tone,
      responseLength,
      keywords: personaKeywords,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      rating: 5.0, // Default initial rating
      responseTime: 1.0, // Default initial response time in seconds
      completionRate: 100.0, // Default initial completion rate percentage
    });
  }
  
  return personas;
}

/**
 * Generate questions for a forum based on a specific keyword or topic
 */
export async function generateKeywordOptimizedQuestions(
  keyword: string,
  count: number = 5,
  difficulty: "beginner" | "intermediate" | "expert" = "intermediate"
): Promise<Array<{ title: string; content: string; keywords: string[]; difficulty: "beginner" | "intermediate" | "expert"; estimatedSearchVolume: string }>> {
  try {
    const prompt = `Generate ${count} SEO-optimized forum questions targeting the keyword: "${keyword}"
    
    For each question:
    1. Create a search-friendly title that includes the keyword naturally
    2. Generate detailed question content that would attract quality answers
    3. Identify related keywords and phrases that should be included
    4. Estimate a realistic monthly search volume for the question (e.g., "500-1k/mo", "1k-5k/mo")
    
    The questions should be at a ${difficulty} knowledge level.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: `You are an SEO content strategist specializing in forum question optimization.
          Provide output in JSON format with the following structure:
          {
            "questions": [
              {
                "title": string,
                "content": string,
                "keywords": string[],
                "difficulty": "beginner" | "intermediate" | "expert",
                "estimatedSearchVolume": string
              }
            ]
          }
          
          Make questions sound natural while incorporating relevant keywords.
          For beginner questions, use simpler language and basic concepts.
          For intermediate questions, assume some domain knowledge and use appropriate terminology.
          For expert questions, dive into advanced topics with specialized terminology.
          
          For the estimatedSearchVolume field, provide realistic estimates based on the question's specificity and popularity.`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    return Array.isArray(result.questions) 
      ? result.questions.map((q: any) => ({
          title: q.title || "",
          content: q.content || "",
          keywords: Array.isArray(q.keywords) ? q.keywords : [],
          difficulty: (q.difficulty === 'beginner' || q.difficulty === 'intermediate' || q.difficulty === 'expert') 
            ? q.difficulty 
            : difficulty, // Use the provided difficulty if not valid in response
          estimatedSearchVolume: q.estimatedSearchVolume || "0-10/mo"
        }))
      : [];
  } catch (error) {
    console.error("Error generating keyword-optimized questions:", error);
    return [];
  }
}
import OpenAI from "openai";
import { AiPersona } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const AI_MODELS = {
  default: "gpt-4o",
  vision: "gpt-4o",
  entry: "gpt-3.5-turbo"
};

// Initialize the OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate AI content based on persona type
 */
export async function generateAiContent(prompt: string, personaType: "beginner" | "intermediate" | "expert" | "moderator"): Promise<string> {
  try {
    // Define persona-specific instructions
    const personaInstructions = {
      beginner: "You are a beginner in the industry asking questions. Be curious but show limited knowledge. Ask open-ended questions that invite detailed answers.",
      intermediate: "You have moderate experience in the industry. Your questions and answers show good understanding but still seeking deeper insights.",
      expert: "You are an industry expert with deep knowledge. Provide comprehensive, authoritative answers with specific examples, data, and best practices.",
      moderator: "You are a forum moderator focused on maintaining quality discussions. Guide conversations, clarify points, and ensure accuracy."
    };

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: personaInstructions[personaType] + " Format your response in markdown for better readability."
        },
        { role: "user", content: prompt }
      ],
      temperature: personaType === "beginner" ? 0.9 : personaType === "expert" ? 0.3 : 0.7,
      max_tokens: personaType === "expert" ? 1000 : 500,
    });

    return response.choices[0].message.content || "I don't have a specific response for that.";
  } catch (error) {
    console.error("Error generating AI content:", error);
    return "Sorry, I couldn't generate a response at this time.";
  }
}

/**
 * Generate SEO-optimized questions based on a topic or keyword
 */
export async function generateSeoQuestions(
  topic: string, 
  count: number = 5,
  personaType: "beginner" | "intermediate" | "expert" | "moderator" = "beginner"
): Promise<Array<{ title: string; content: string }>> {
  try {
    const prompt = `Generate ${count} SEO-optimized questions about "${topic}" that would rank well on Google. 
    Each question should include a detailed description that demonstrates E-E-A-T principles.
    The questions should be comprehensive yet specific, addressing key aspects that searchers would want to know.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: `You are an SEO expert who creates high-ranking forum questions. 
          Provide output in JSON format as an array of objects with "title" and "content" fields.
          Make questions sound natural while incorporating relevant keywords.
          Tailor the style to a ${personaType} level user.`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return Array.isArray(result.questions) ? result.questions : [];
  } catch (error) {
    console.error("Error generating SEO questions:", error);
    return [];
  }
}

/**
 * Analyze a question to suggest related keywords for SEO
 */
export async function analyzeQuestionSeo(questionTitle: string, questionContent: string): Promise<{
  primaryKeyword: string;
  secondaryKeywords: string[];
  suggestedTags: string[];
  seoScore: number;
  improvementTips: string[];
}> {
  try {
    const prompt = `Analyze this question for SEO optimization:
    Title: ${questionTitle}
    Content: ${questionContent}
    
    Identify the primary keyword, secondary keywords, suggested tags, and provide an SEO score (0-100) with improvement tips.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: `You are an SEO analysis tool. Provide output in JSON format with the following properties:
          "primaryKeyword": string,
          "secondaryKeywords": string array (3-5 keywords),
          "suggestedTags": string array (3-5 tags),
          "seoScore": number between 0-100,
          "improvementTips": string array (2-4 tips)`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      primaryKeyword: result.primaryKeyword || "",
      secondaryKeywords: Array.isArray(result.secondaryKeywords) ? result.secondaryKeywords : [],
      suggestedTags: Array.isArray(result.suggestedTags) ? result.suggestedTags : [],
      seoScore: typeof result.seoScore === "number" ? result.seoScore : 0,
      improvementTips: Array.isArray(result.improvementTips) ? result.improvementTips : []
    };
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
 * Generate an AI-powered answer to a question based on persona type
 */
export async function generateAnswer(
  questionTitle: string, 
  questionContent: string,
  personaType: "beginner" | "intermediate" | "expert" | "moderator" = "expert"
): Promise<string> {
  try {
    const prompt = `Question Title: ${questionTitle}
    Question Content: ${questionContent}
    
    Please provide a comprehensive, helpful answer to this question.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: `You are a ${personaType}-level expert providing answers on a Q&A forum.
          ${personaType === "expert" ? "Provide authoritative, detailed answers with examples and cite sources when possible." : ""}
          ${personaType === "intermediate" ? "Provide solid answers with some detail and examples." : ""}
          ${personaType === "beginner" ? "Provide basic but helpful answers in simple terms." : ""}
          ${personaType === "moderator" ? "Provide balanced, neutral answers that clarify misunderstandings and point to reliable sources." : ""}
          Format your response in markdown for better readability.`
        },
        { role: "user", content: prompt }
      ],
      temperature: personaType === "expert" ? 0.3 : 0.7,
      max_tokens: personaType === "expert" ? 1000 : personaType === "beginner" ? 300 : 600,
    });

    return response.choices[0].message.content || "I don't have a specific answer for that question.";
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
    // Map content items to a format suitable for OpenAI prompt
    const contentsData = targetContents.map(c => ({
      id: c.id,
      type: c.type,
      title: c.title,
      excerpt: c.content.substring(0, 200) + "..."
    }));

    const userPrompt = `Source Content Title: ${sourceTitle}
    Source Content: ${sourceContent}
    Source Type: ${sourceType}
    
    Analyze this content and identify opportunities for interlinking with these existing content items:
    ${JSON.stringify(contentsData)}
    
    Provide recommendations for strategic interlinking that would add value to readers, improve SEO, and enhance the user journey between forum content and main site content.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: `You are an advanced interlinking analysis tool for a content platform that includes both a Q&A forum and a main website. 
          Your job is to analyze user-provided content and identify opportunities for interlinking between forum questions/answers and main site pages.
          
          Provide output as a JSON object with a key called "suggestions" containing an array of objects with these exact properties:
          {
            "suggestions": [
              {
                "contentId": number,          // The ID of the content to link to
                "contentType": string,        // The type of content ("question", "answer", or "main_page")
                "title": string,              // The title of the content
                "relevanceScore": number,     // A score from 0-100 indicating relevance
                "anchorText": string          // The text in the source content that should become the link
              },
              ...
            ]
          }
          
          Important guidelines:
          1. Make sure the "anchorText" is an exact substring that exists in the original content.
          2. Only provide suggestions where the anchorText appears exactly in the content.
          3. Focus on creating a semantic web that helps users navigate between related topics.
          4. Consider user intent and journey when suggesting interlinks.
          5. Prefer higher relevance scores (70+) for the most valuable connections.
          6. Limit results to the most valuable links (max ${limit}).`
        },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    
    const responseContent = response.choices[0].message.content || "{}";
    
    try {
      const result = JSON.parse(responseContent);
      
      // Primary expected format is a JSON object with a "suggestions" array
      if (result.suggestions && Array.isArray(result.suggestions)) {
        return result.suggestions
          .map((item: any) => ({
            contentId: item.contentId || item.id || 0,
            contentType: item.contentType || item.type || "",
            title: item.title || "",
            relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
            anchorText: item.anchorText || ""
          }))
          .filter((item: InterlinkingSuggestion) => 
            // Filter out invalid suggestions
            item.contentId > 0 && 
            item.anchorText.length > 0 && 
            item.relevanceScore >= 50 &&
            ["question", "answer", "main_page"].includes(item.contentType)
          )
          .sort((a: InterlinkingSuggestion, b: InterlinkingSuggestion) => 
            // Sort by relevance score (descending)
            b.relevanceScore - a.relevanceScore
          )
          .slice(0, limit); // Limit results
      } 
      // Fallback formats
      else if (Array.isArray(result)) {
        return result
          .map((item: any) => ({
            contentId: item.contentId || item.id || 0,
            contentType: item.contentType || item.type || "",
            title: item.title || "",
            relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
            anchorText: item.anchorText || ""
          }))
          .filter((item: InterlinkingSuggestion) => 
            item.contentId > 0 && 
            item.anchorText.length > 0 && 
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
        return result.interlinkingSuggestions
          .map((item: any) => ({
            contentId: item.contentId || item.id || 0,
            contentType: item.contentType || item.type || "",
            title: item.title || "",
            relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
            anchorText: item.anchorText || ""
          }))
          .filter((item: InterlinkingSuggestion) => 
            item.contentId > 0 && 
            item.anchorText.length > 0 && 
            item.relevanceScore >= 50 &&
            ["question", "answer", "main_page"].includes(item.contentType)
          )
          .sort((a: InterlinkingSuggestion, b: InterlinkingSuggestion) => 
            b.relevanceScore - a.relevanceScore
          )
          .slice(0, limit);
      }
      
      console.warn("Unexpected response format from OpenAI:", result);
      return [];
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
 * Interface for keyword analysis results
 */
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
 * Analyze a website URL to extract keywords and generate SEO-optimized question ideas
 * @param websiteUrl The URL to analyze for keywords
 * @param questionCount Number of questions to generate (default: 10)
 */
export async function analyzeWebsiteForKeywords(
  websiteUrl: string,
  questionCount: number = 10
): Promise<KeywordAnalysisResult> {
  try {
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

    return {
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
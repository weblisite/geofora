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
 * Generate interlinking suggestions for a question or answer
 */
export async function generateInterlinkingSuggestions(
  content: string,
  existingQuestions: Array<{ id: number; title: string; content: string }>
): Promise<Array<{ questionId: number; title: string; relevanceScore: number; anchorText: string }>> {
  try {
    // Map questions to a format suitable for OpenAI prompt
    const questionsData = existingQuestions.map(q => ({
      id: q.id,
      title: q.title,
      excerpt: q.content.substring(0, 200) + "..."
    }));

    const userPrompt = `Content: ${content}
    
    Analyze this content and identify opportunities for interlinking with these existing questions:
    ${JSON.stringify(questionsData)}
    
    Provide recommendations for natural interlinking that would add value to readers and improve SEO.`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.default,
      messages: [
        { 
          role: "system", 
          content: `You are an interlinking analysis tool for a Q&A forum. 
          Analyze user-provided content and identify opportunities for interlinking with existing forum questions.
          
          Provide output as a JSON object with a key called "suggestions" containing an array of objects with these exact properties:
          {
            "suggestions": [
              {
                "questionId": number,          // The ID of the question to link to
                "title": string,               // The title of the question
                "relevanceScore": number,      // A score from 0-100 indicating relevance
                "anchorText": string           // The text in the original content that should become the link
              },
              ...
            ]
          }
          
          Important: Make sure the "anchorText" is an exact substring that exists in the original content.
          Only provide suggestions where the anchorText appears exactly in the content.`
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
        return result.suggestions.map((item: any) => ({
          questionId: item.questionId || item.id || 0,
          title: item.title || "",
          relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
          anchorText: item.anchorText || ""
        }));
      } 
      // Fallback: the entire response is an array of suggestion objects
      else if (Array.isArray(result)) {
        return result.map((item: any) => ({
          questionId: item.questionId || item.id || 0,
          title: item.title || "",
          relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
          anchorText: item.anchorText || ""
        }));
      }
      // Alternate format that might come from OpenAI
      else if (result.interlinkingSuggestions && Array.isArray(result.interlinkingSuggestions)) {
        return result.interlinkingSuggestions.map((item: any) => ({
          questionId: item.questionId || item.id || 0,
          title: item.title || "",
          relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
          anchorText: item.anchorText || ""
        }));
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
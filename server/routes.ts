import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateAnswer, generateSeoQuestions, analyzeQuestionSeo, generateInterlinkingSuggestions } from "./ai";
import { 
  insertUserSchema, 
  insertQuestionSchema, 
  insertAnswerSchema, 
  insertVoteSchema,
  insertMainSitePageSchema,
  insertContentInterlinkSchema,
  insertForumSchema,
  insertDomainVerificationSchema,
  insertLeadCaptureFormSchema,
  insertLeadSubmissionSchema,
  insertGatedContentSchema,
  insertCrmIntegrationSchema,
  insertLeadFormViewSchema,
  insertContentScheduleSchema
} from "@shared/schema";
import {
  getDashboardStats,
  getTrafficData,
  getDailyTrafficData,
  getTopContent,
  getSeoRankings,
  getConversionFunnel,
  getReferralTraffic,
  getDeviceDistribution,
  getGeographicData,
  getLeadCaptureStats,
  getAiActivity,
  getUserEngagementMetrics,
  getAverageSessionDuration,
  getReturnVisitorTrend,
  getContentPerformanceMetrics,
  getTopPerformingContent,
  getContentEngagementTrend,
  getAnalyticsEvents,
  getEventCountsByType
} from "./analytics";
import { 
  generateAiContent,
  generateSeoQuestions,
  analyzeQuestionSeo,
  generateAnswer,
  generateInterlinkingSuggestions,
  generateQuestionInterlinkingSuggestions,
  analyzeWebsiteForKeywords,
  generateKeywordOptimizedQuestions,
  performAdvancedKeywordAnalysis,
  analyzeKeywordDifficulty,
  analyzeContentGaps,
  generateSeoOptimizedQuestions,
  InterlinkableContent
} from "./ai";
// Analytics imports are already included above
import { setupAuth } from "./auth";
import { registerEmbedRoutes } from "./embed";
import session from "express-session";
import path from "path";

// Extend Express Request to include session property
declare module "express-session" {
  interface SessionData {
    userId?: number;
    passport?: {
      user?: number;
    };
  }
}

// Add session to Express Request
declare global {
  namespace Express {
    interface Request {
      session: session.Session & Partial<session.SessionData>;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication with passport
  setupAuth(app);
  
  // Authentication routes are handled in auth.ts

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Questions routes
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getAllQuestionsWithDetails();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestionWithDetails(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to create a question" });
      }

      const validatedData = insertQuestionSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const question = await storage.createQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create question" });
      }
    }
  });

  app.post("/api/questions/:id/view", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementQuestionViews(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Answers routes
  app.get("/api/questions/:id/answers", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const answers = await storage.getAnswersForQuestion(questionId);
      res.json(answers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });

  app.post("/api/questions/:id/answers", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to add an answer" });
      }

      const questionId = parseInt(req.params.id);
      
      const validatedData = insertAnswerSchema.parse({
        ...req.body,
        questionId,
        userId: req.session.userId,
      });
      
      const answer = await storage.createAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create answer" });
      }
    }
  });

  // Votes routes
  app.post("/api/answers/:id/vote", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to vote" });
      }

      const answerId = parseInt(req.params.id);
      
      const validatedData = insertVoteSchema.parse({
        answerId,
        userId: req.session.userId,
        isUpvote: req.body.isUpvote,
      });
      
      const vote = await storage.createOrUpdateVote(validatedData);
      res.json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to record vote" });
      }
    }
  });

  // AI Personas routes
  app.get("/api/personas", async (req, res) => {
    try {
      const personas = await storage.getAllAIPersonas();
      res.json(personas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI personas" });
    }
  });

  // AI Content Generation routes
  app.post("/api/ai/generate-content", async (req, res) => {
    try {
      const { prompt, personaType } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      if (!personaType || !["beginner", "intermediate", "expert", "moderator"].includes(personaType)) {
        return res.status(400).json({ message: "Valid persona type is required" });
      }
      
      const content = await generateAiContent(prompt, personaType);
      res.json({ content });
    } catch (error) {
      console.error("Error generating AI content:", error);
      res.status(500).json({ message: "Failed to generate AI content" });
    }
  });

  app.post("/api/ai/generate-seo-questions", async (req, res) => {
    try {
      const { topic, count = 5, personaType = "beginner" } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const questions = await generateSeoQuestions(topic, count, personaType);
      res.json({ questions });
    } catch (error) {
      console.error("Error generating SEO questions:", error);
      res.status(500).json({ message: "Failed to generate SEO questions" });
    }
  });

  app.post("/api/ai/analyze-seo", async (req, res) => {
    try {
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: "Question title and content are required" });
      }
      
      const analysis = await analyzeQuestionSeo(title, content);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      res.status(500).json({ message: "Failed to analyze SEO" });
    }
  });

  app.post("/api/ai/generate-answer", async (req, res) => {
    try {
      const { questionTitle, questionContent, personaType = "expert" } = req.body;
      
      if (!questionTitle || !questionContent) {
        return res.status(400).json({ message: "Question title and content are required" });
      }
      
      const answer = await generateAnswer(questionTitle, questionContent, personaType);
      
      // Return the generated answer
      res.json(answer);
    } catch (error) {
      console.error("Error generating AI answer:", error);
      res.status(500).json({ message: "Failed to generate AI answer" });
    }
  });

  app.post("/api/ai/generate-interlinking", async (req, res) => {
    try {
      const { content, sourceTitle, sourceType } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // For backward compatibility
      if (!sourceTitle || !sourceType) {
        // Use the old method
        const questions = await storage.getAllQuestionsWithDetails();
        const existingQuestions = questions.map(q => ({
          id: q.id,
          title: q.title,
          content: q.content
        }));
        
        const suggestions = await generateQuestionInterlinkingSuggestions(content, existingQuestions);
        return res.json({ suggestions });
      }
      
      // Collect all potential target contents for interlinking
      const targetContents: InterlinkableContent[] = [];
      
      // Add questions as potential targets (except if the source is the same question)
      const questions = await storage.getAllQuestionsWithDetails();
      questions.forEach(q => {
        if (!(sourceType === 'question' && req.body.sourceId === q.id)) {
          targetContents.push({
            id: q.id,
            type: 'question',
            title: q.title,
            content: q.content
          });
        }
      });
      
      // Add main site pages as potential targets
      const mainSitePages = await storage.getAllMainSitePages();
      mainSitePages.forEach(p => {
        if (!(sourceType === 'main_page' && req.body.sourceId === p.id)) {
          targetContents.push({
            id: p.id,
            type: 'main_page',
            title: p.title,
            content: p.content
          });
        }
      });
      
      // Generate interlinking suggestions
      const suggestions = await generateInterlinkingSuggestions(
        content,
        sourceTitle,
        sourceType,
        targetContents,
        5 // limit to 5 suggestions
      );
      
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating interlinking suggestions:", error);
      res.status(500).json({ message: "Failed to generate interlinking suggestions" });
    }
  });

  // Keyword Analysis routes
  app.post("/api/ai/analyze-website-keywords", async (req, res) => {
    try {
      const { websiteUrl, questionCount = 10 } = req.body;
      
      if (!websiteUrl) {
        return res.status(400).json({ message: "Website URL is required" });
      }
      
      const analysis = await analyzeWebsiteForKeywords(websiteUrl, questionCount);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing website for keywords:", error);
      res.status(500).json({ message: "Failed to analyze website for keywords" });
    }
  });

  app.post("/api/ai/generate-keyword-questions", async (req, res) => {
    try {
      const { keyword, count = 5, difficulty = "intermediate" } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }
      
      if (!["beginner", "intermediate", "expert"].includes(difficulty)) {
        return res.status(400).json({ message: "Valid difficulty level is required: beginner, intermediate, or expert" });
      }
      
      const questions = await generateKeywordOptimizedQuestions(keyword, count, difficulty);
      res.json({ questions });
    } catch (error) {
      console.error("Error generating keyword-optimized questions:", error);
      res.status(500).json({ message: "Failed to generate keyword-optimized questions" });
    }
  });
  
  // Advanced Keyword Analysis routes
  app.post("/api/ai/advanced-keyword-analysis", async (req, res) => {
    try {
      const { websiteUrl } = req.body;
      
      if (!websiteUrl) {
        return res.status(400).json({ message: "Website URL is required" });
      }
      
      const analysis = await performAdvancedKeywordAnalysis(websiteUrl);
      res.json(analysis);
    } catch (error) {
      console.error("Error performing advanced keyword analysis:", error);
      res.status(500).json({ message: "Failed to perform advanced keyword analysis" });
    }
  });

  app.post("/api/ai/keyword-difficulty", async (req, res) => {
    try {
      const { keyword } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }
      
      const analysis = await analyzeKeywordDifficulty(keyword);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing keyword difficulty:", error);
      res.status(500).json({ message: "Failed to analyze keyword difficulty" });
    }
  });

  app.post("/api/ai/content-gaps", async (req, res) => {
    try {
      const { industry, existingKeywords } = req.body;
      
      if (!industry) {
        return res.status(400).json({ message: "Industry or niche is required" });
      }
      
      const analysis = await analyzeContentGaps(industry, existingKeywords);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing content gaps:", error);
      res.status(500).json({ message: "Failed to analyze content gaps" });
    }
  });

  app.post("/api/ai/seo-optimized-questions", async (req, res) => {
    try {
      const { keyword, count = 5, searchIntent } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }
      
      if (searchIntent && !["informational", "commercial", "transactional"].includes(searchIntent)) {
        return res.status(400).json({ 
          message: "Valid search intent is required: informational, commercial, or transactional" 
        });
      }
      
      const questions = await generateSeoOptimizedQuestions(
        keyword, 
        count, 
        searchIntent as 'informational' | 'commercial' | 'transactional' | undefined
      );
      res.json(questions);
    } catch (error) {
      console.error("Error generating SEO-optimized questions:", error);
      res.status(500).json({ message: "Failed to generate SEO-optimized questions" });
    }
  });
  
  app.post("/api/ai/generate-section", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { 
        forumId, 
        keyword, 
        title, 
        description, 
        questionCount, 
        answerCount, 
        personaType,
        relatedKeywordsCount,
        contentDepth 
      } = req.body;
      
      if (!keyword || !forumId || !title) {
        return res.status(400).json({ error: "Missing required parameters: keyword, forumId, and title are required" });
      }
      
      // Step 1: Get the forum to verify it exists and access to additional info
      const forum = await storage.getForum(forumId);
      if (!forum) {
        return res.status(404).json({ error: "Forum not found" });
      }
      
      // Step 2: Generate keywords analysis and related keywords
      console.log(`Generating keyword analysis for "${keyword}"`);
      const difficultyAnalysis = await analyzeKeywordDifficulty(keyword);
      
      // Step 3: Generate questions based on keyword and related keywords
      console.log(`Generating ${questionCount} questions for keyword "${keyword}"`);
      const questionsData = await generateSeoOptimizedQuestions(
        keyword, 
        questionCount || 5
      );
      
      // Step 4: Generate answers for each question based on the persona type
      console.log(`Generating answers with ${personaType} persona`);
      const answers = [];
      
      for (const question of questionsData.questions) {
        // Generate 1-3 answers per question based on answerCount parameter
        const answersPerQuestion = Math.min(answerCount || 3, 5); // Cap at 5 answers per question
        
        for (let i = 0; i < answersPerQuestion; i++) {
          const answerPersona = i === 0 ? personaType : ["beginner", "intermediate", "expert", "moderator"][Math.floor(Math.random() * 4)];
          
          console.log(`Generating ${answerPersona} answer for question: ${question.title}`);
          const answerContent = await generateAnswer(
            question.title,
            question.content,
            answerPersona
          );
          
          answers.push({
            content: answerContent,
            personaType: answerPersona,
            questionTitle: question.title
          });
        }
      }
      
      // Step 5: Generate related keywords based on the primary keyword
      console.log("Generating related keywords");
      const keywordAnalysis = await analyzeWebsiteForKeywords(
        `https://example.com/topics/${keyword.replace(/\s+/g, "-")}`, 
        relatedKeywordsCount || 3
      );
      
      // Construct the complete section response
      const section = {
        title,
        description: description || `A comprehensive guide to ${keyword}`,
        questions: questionsData.questions.map(q => ({
          title: q.title,
          content: q.content,
          keywords: q.targetKeywords.secondary.slice(0, 5),
          estimatedSearchVolume: q.estimatedSearchVolume,
          difficulty: q.competitiveDifficulty < 30 ? "beginner" : 
                     q.competitiveDifficulty < 70 ? "intermediate" : "expert"
        })),
        answers,
        relatedKeywords: keywordAnalysis.primaryKeywords.concat(keywordAnalysis.secondaryKeywords).slice(0, 10),
        searchEstimates: {
          totalVolume: difficultyAnalysis.searchVolume.estimate,
          difficultyAverage: difficultyAnalysis.difficultyScore,
          rankingPotential: difficultyAnalysis.rankingProbability.establishedSite
        }
      };
      
      res.json(section);
    } catch (error) {
      console.error("Error generating section:", error);
      res.status(500).json({ error: error.message || "Failed to generate section" });
    }
  });
  
  app.post("/api/content/publish-section", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { 
        forumId, 
        keyword, 
        section 
      } = req.body;
      
      if (!forumId || !keyword || !section) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const forum = await storage.getForum(forumId);
      if (!forum) {
        return res.status(404).json({ error: "Forum not found" });
      }
      
      // Find or create a category for the section
      let categoryId = null;
      const categories = await storage.getCategories();
      let category = categories.find(cat => cat.name.toLowerCase() === section.title.toLowerCase());
      
      if (!category) {
        // Create a new category for this section
        category = await storage.createCategory({
          name: section.title,
          slug: section.title.toLowerCase().replace(/\s+/g, "-"),
          description: section.description
        });
        categoryId = category.id;
      } else {
        categoryId = category.id;
      }
      
      // Create questions and answers
      const createdQuestions = [];
      
      for (const question of section.questions) {
        // Create the question
        const newQuestion = await storage.createQuestion({
          title: question.title,
          content: question.content,
          categoryId,
          userId: req.user.id,
          isAiGenerated: true,
          aiPersonaType: question.difficulty
        });
        
        createdQuestions.push(newQuestion.id);
        
        // Create the answers for this question
        const answersForThisQuestion = section.answers.filter(a => 
          a.questionTitle === question.title
        );
        
        for (const answer of answersForThisQuestion) {
          await storage.createAnswer({
            content: answer.content,
            questionId: newQuestion.id,
            userId: req.user.id,
            isAiGenerated: true,
            aiPersonaType: answer.personaType
          });
        }
      }
      
      // Create a content schedule record to track this section
      const schedule = await storage.createContentSchedule({
        title: section.title,
        description: section.description,
        forumId: parseInt(forumId),
        userId: req.user.id,
        keyword,
        categoryId,
        personaType: req.body.personaType || "expert",
        contentType: "section",
        questionCount: section.questions.length,
        scheduledFor: new Date(),
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        questionIds: JSON.stringify(createdQuestions)
      });
      
      res.json({
        success: true,
        message: "Section published successfully",
        questionsCreated: createdQuestions.length,
        answersCreated: section.answers.length,
        schedule
      });
    } catch (error) {
      console.error("Error publishing section:", error);
      res.status(500).json({ error: error.message || "Failed to publish section" });
    }
  });

  // Forum specific keyword analysis
  app.post("/api/forums/:id/analyze-keywords", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to analyze forum keywords" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to analyze this forum" });
      }
      
      // If forum doesn't have a mainWebsiteUrl, return an error
      if (!forum.mainWebsiteUrl) {
        return res.status(400).json({ 
          message: "Main website URL is required for keyword analysis",
          code: "NO_WEBSITE_URL"
        });
      }
      
      // Check which type of analysis was requested
      const { analysisType = 'basic' } = req.body;
      
      if (analysisType === 'advanced') {
        const analysis = await performAdvancedKeywordAnalysis(forum.mainWebsiteUrl);
        res.json(analysis);
      } else {
        const analysis = await analyzeWebsiteForKeywords(forum.mainWebsiteUrl, 10);
        res.json(analysis);
      }
    } catch (error) {
      console.error("Error analyzing forum keywords:", error);
      res.status(500).json({ message: "Failed to analyze forum keywords" });
    }
  });
  
  // Additional forum keyword analysis endpoints
  app.post("/api/forums/:id/keyword-difficulty", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to analyze keyword difficulty" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to analyze keyword difficulty" });
      }
      
      const { keyword } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required for difficulty analysis" });
      }
      
      const analysis = await analyzeKeywordDifficulty(keyword);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing keyword difficulty:", error);
      res.status(500).json({ message: "Failed to analyze keyword difficulty" });
    }
  });
  
  app.post("/api/forums/:id/content-gaps", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to analyze content gaps" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to analyze content gaps" });
      }
      
      const { industry, existingKeywords } = req.body;
      
      if (!industry) {
        return res.status(400).json({ message: "Industry is required for content gap analysis" });
      }
      
      const analysis = await analyzeContentGaps(industry, existingKeywords);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing content gaps:", error);
      res.status(500).json({ message: "Failed to analyze content gaps" });
    }
  });
  
  app.post("/api/forums/:id/seo-questions", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to generate SEO questions" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to generate SEO questions" });
      }
      
      const { keyword, count = 5, searchIntent } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required to generate SEO questions" });
      }
      
      if (searchIntent && !["informational", "commercial", "transactional"].includes(searchIntent)) {
        return res.status(400).json({ 
          message: "Valid search intent is required: informational, commercial, or transactional" 
        });
      }
      
      const questions = await generateSeoOptimizedQuestions(
        keyword, 
        count, 
        searchIntent as 'informational' | 'commercial' | 'transactional' | undefined
      );
      res.json(questions);
    } catch (error) {
      console.error("Error generating SEO questions:", error);
      res.status(500).json({ message: "Failed to generate SEO questions" });
    }
  });

  // Main Site Pages routes
  app.get("/api/main-pages", async (req, res) => {
    try {
      const pages = await storage.getAllMainSitePages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch main site pages" });
    }
  });

  app.get("/api/main-pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.getMainSitePageWithLinks(id);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.get("/api/main-pages/by-slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getMainSitePageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.post("/api/main-pages", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to create a page" });
      }

      const validatedData = insertMainSitePageSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const page = await storage.createMainSitePage(validatedData);
      res.status(201).json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create page" });
      }
    }
  });

  // Content Interlinks routes
  app.post("/api/interlinks", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to create an interlink" });
      }

      const validatedData = insertContentInterlinkSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const interlink = await storage.createContentInterlink(validatedData);
      res.status(201).json(interlink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create interlink" });
      }
    }
  });

  app.get("/api/interlinks/source/:type/:id", async (req, res) => {
    try {
      const sourceType = req.params.type;
      const sourceId = parseInt(req.params.id);
      
      const interlinks = await storage.getInterlinksForSource(sourceType, sourceId);
      res.json(interlinks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interlinks" });
    }
  });

  app.get("/api/interlinks/target/:type/:id", async (req, res) => {
    try {
      const targetType = req.params.type;
      const targetId = parseInt(req.params.id);
      
      const interlinks = await storage.getInterlinksForTarget(targetType, targetId);
      res.json(interlinks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interlinks" });
    }
  });

  app.get("/api/interlinks/relevant/:type/:id", async (req, res) => {
    try {
      const contentType = req.params.type;
      const contentId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const relevantContent = await storage.getRelevantContentForInterlinking(contentType, contentId, limit);
      res.json(relevantContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch relevant content" });
    }
  });

  // Analytics routes (simulated for demo)
  app.get("/api/analytics/dashboard-stats/:range", (req, res) => {
    // Simulated data for dashboard stats
    const stats = {
      questions: {
        total: 1247,
        trend: "+14.2% vs last month",
        trendPositive: true,
      },
      answers: {
        total: 5893,
        trend: "+23.5% vs last month",
        trendPositive: true,
      },
      traffic: {
        total: 78400,
        trend: "+35.7% vs last month",
        trendPositive: true,
      },
      conversions: {
        total: 1892,
        trend: "+18.9% vs last month",
        trendPositive: true,
      },
    };
    
    res.json(stats);
  });

  app.get("/api/analytics/traffic/:timeRange", (req, res) => {
    const { timeRange } = req.params;
    let labels: string[] = [];
    let data: number[] = [];

    if (timeRange === "daily") {
      labels = ["9AM", "11AM", "1PM", "3PM", "5PM", "7PM", "9PM"];
      data = [205, 450, 850, 1200, 950, 1100, 1350];
    } else if (timeRange === "weekly") {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      data = [5200, 4800, 6100, 8500, 9200, 7800, 6500];
    } else {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      data = [18000, 22000, 26500, 32000, 36000, 42000];
    }

    res.json({ labels, data });
  });

  app.get("/api/analytics/ai-activity", (req, res) => {
    // Simulated data for AI activity
    const activities = [
      {
        id: 1,
        type: "answer",
        personaType: "expert",
        personaName: "AI Expert",
        action: "answered a question on",
        subject: "SEO best practices",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        type: "question",
        personaType: "beginner",
        personaName: "AI Beginner",
        action: "asked a question about",
        subject: "Google algorithm updates",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        type: "moderation",
        personaType: "moderator",
        personaName: "AI Moderator",
        action: "flagged a response for",
        subject: "review",
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        type: "response",
        personaType: "expert",
        personaName: "AI Expert",
        action: "responded to a thread on",
        subject: "Content marketing",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ];
    
    res.json(activities);
  });

  app.get("/api/analytics/top-content", (req, res) => {
    // Simulated data for top performing content
    const topContent = [
      {
        id: 1,
        title: "What's the most effective way to implement AI-driven content strategies?",
        views: 12456,
        answers: 32,
        conversions: 147,
        ranking: "Position #3",
        position: 3,
      },
      {
        id: 2,
        title: "How do you measure the ROI of your SEO investments?",
        views: 9871,
        answers: 24,
        conversions: 93,
        ranking: "Position #1",
        position: 1,
      },
      {
        id: 3,
        title: "Which keyword research tools are worth the investment in 2024?",
        views: 8542,
        answers: 19,
        conversions: 78,
        ranking: "Position #2",
        position: 2,
      },
      {
        id: 4,
        title: "What are the best practices for E-E-A-T compliance?",
        views: 7329,
        answers: 15,
        conversions: 64,
        ranking: "Position #5",
        position: 5,
      },
    ];
    
    res.json(topContent);
  });

  // Forum Management routes
  app.get("/api/forums", async (req, res) => {
    try {
      const forums = await storage.getAllForums();
      res.json(forums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forums" });
    }
  });

  app.get("/api/forums/user", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to view your forums" });
      }

      const forums = await storage.getForumsByUser(req.session.userId);
      res.json(forums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user forums" });
    }
  });

  app.get("/api/forums/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const forum = await storage.getForum(id);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      res.json(forum);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum" });
    }
  });

  app.get("/api/forums/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const forum = await storage.getForumBySlug(slug);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      res.json(forum);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum" });
    }
  });

  app.get("/api/forums/subdomain/:subdomain", async (req, res) => {
    try {
      const { subdomain } = req.params;
      const forum = await storage.getForumBySubdomain(subdomain);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      res.json(forum);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum" });
    }
  });

  app.get("/api/forums/domain/:domain", async (req, res) => {
    try {
      const { domain } = req.params;
      const forum = await storage.getForumByCustomDomain(domain);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      res.json(forum);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum" });
    }
  });

  app.post("/api/forums", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to create a forum" });
      }

      const validatedData = insertForumSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const forum = await storage.createForum(validatedData);
      res.status(201).json(forum);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create forum" });
      }
    }
  });

  app.put("/api/forums/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to update a forum" });
      }

      const id = parseInt(req.params.id);
      const forum = await storage.getForum(id);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this forum" });
      }

      // Update non-domain fields
      const { subdomain, customDomain, ...otherData } = req.body;
      
      // Update the forum data
      const updatedForum = await storage.updateForum(id, otherData);
      res.json(updatedForum);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update forum" });
      }
    }
  });

  app.put("/api/forums/:id/domain", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to update forum domains" });
      }

      const id = parseInt(req.params.id);
      const forum = await storage.getForum(id);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this forum" });
      }

      // Update domain fields
      const { subdomain, customDomain } = req.body;
      
      // Update the forum domain
      const updatedForum = await storage.updateForumDomain(id, { subdomain, customDomain });
      res.json(updatedForum);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update forum domain" });
      }
    }
  });

  app.delete("/api/forums/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to delete a forum" });
      }

      const id = parseInt(req.params.id);
      const forum = await storage.getForum(id);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this forum" });
      }

      await storage.deleteForum(id);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to delete forum" });
      }
    }
  });

  // Forum Questions API routes
  app.get("/api/forums/:forumId/questions", async (req, res) => {
    try {
      const forumId = parseInt(req.params.forumId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      const questions = await storage.getQuestionsForForum(forumId, limit, categoryId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching forum questions:", error);
      res.status(500).json({ message: "Failed to fetch forum questions" });
    }
  });
  
  app.get("/api/forums/:forumId/questions/popular", async (req, res) => {
    try {
      const forumId = parseInt(req.params.forumId);
      const sortBy = req.query.sortBy as string || 'views';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const timeFrame = req.query.timeFrame ? parseInt(req.query.timeFrame as string) : 30;
      
      const questions = await storage.getPopularQuestionsForForum(forumId, sortBy, limit, categoryId, timeFrame);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching popular forum questions:", error);
      res.status(500).json({ message: "Failed to fetch popular forum questions" });
    }
  });
  
  app.get("/api/forums/:forumId/questions/search", async (req, res) => {
    try {
      const forumId = parseInt(req.params.forumId);
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const questions = await storage.searchQuestionsInForum(forumId, query, limit, categoryId);
      res.json(questions);
    } catch (error) {
      console.error("Error searching forum questions:", error);
      res.status(500).json({ message: "Failed to search forum questions" });
    }
  });
  
  app.get("/api/forums/:forumId/stats", async (req, res) => {
    try {
      const forumId = parseInt(req.params.forumId);
      
      // Get forum by ID to verify it exists
      const forum = await storage.getForum(forumId);
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Get question and answer counts
      const questionCount = await storage.countQuestionsByForum(forumId);
      const answerCount = await storage.countAnswersByForum(forumId);
      
      // Return forum stats
      res.json({
        questionCount,
        answerCount,
        forumId,
        forumName: forum.name
      });
    } catch (error) {
      console.error("Error fetching forum stats:", error);
      res.status(500).json({ message: "Failed to fetch forum stats" });
    }
  });
  
  app.post("/api/forums/:forumId/generate-questions", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to generate questions" });
      }
      
      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum or is an admin
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to generate questions for this forum" });
      }
      
      const { keyword, count = 5, searchIntent } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }
      
      // Generate optimized questions using the AI service
      const optimizedQuestions = await generateSeoOptimizedQuestions(
        keyword, 
        count, 
        searchIntent as 'informational' | 'commercial' | 'transactional' | undefined
      );
      
      // Return the optimized questions
      res.json(optimizedQuestions);
    } catch (error) {
      console.error("Error generating optimized questions:", error);
      res.status(500).json({ message: "Failed to generate optimized questions" });
    }
  });

  // Question and Answer routes
  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Increment view count
      await storage.incrementQuestionViews(id);
      
      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });
  
  app.post("/api/forums/:forumId/questions", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to ask a question" });
      }
      
      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      const validatedData = insertQuestionSchema.parse({
        ...req.body,
        userId: req.session.userId,
        forumId
      });
      
      const question = await storage.createQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error creating question:", error);
        res.status(500).json({ message: "Failed to create question" });
      }
    }
  });
  
  app.delete("/api/questions/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to delete a question" });
      }
      
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Check if the user owns this question or is an admin
      if (question.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this question" });
      }
      
      const success = await storage.deleteQuestion(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete question" });
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });
  
  app.get("/api/questions/:id/answers", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const answers = await storage.getAnswersByQuestion(questionId);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });
  
  app.post("/api/questions/:id/answers", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to post an answer" });
      }
      
      const questionId = parseInt(req.params.id);
      const question = await storage.getQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const validatedData = insertAnswerSchema.parse({
        ...req.body,
        userId: req.session.userId,
        questionId
      });
      
      const answer = await storage.createAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error creating answer:", error);
        res.status(500).json({ message: "Failed to create answer" });
      }
    }
  });
  
  app.post("/api/questions/:id/answers/ai", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to generate an AI answer" });
      }
      
      const questionId = parseInt(req.params.id);
      const question = await storage.getQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const { personaType } = req.body;
      
      if (!personaType || !["beginner", "intermediate", "expert", "moderator"].includes(personaType)) {
        return res.status(400).json({ message: "Invalid persona type. Must be beginner, intermediate, expert, or moderator" });
      }
      
      // Generate AI answer
      const answerContent = await generateAnswer(question.title, question.content, personaType as "beginner" | "intermediate" | "expert" | "moderator");
      
      // Create answer record
      const answer = await storage.createAnswer({
        userId: req.session.userId,
        questionId,
        content: answerContent,
        isAiGenerated: true,
        aiPersonaType: personaType
      });
      
      res.status(201).json(answer);
    } catch (error) {
      console.error("Error generating AI answer:", error);
      res.status(500).json({ message: "Failed to generate AI answer" });
    }
  });
  
  app.delete("/api/answers/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to delete an answer" });
      }
      
      const id = parseInt(req.params.id);
      const answer = await storage.getAnswer(id);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      // Check if the user owns this answer or is an admin
      if (answer.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this answer" });
      }
      
      const success = await storage.deleteAnswer(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete answer" });
      }
    } catch (error) {
      console.error("Error deleting answer:", error);
      res.status(500).json({ message: "Failed to delete answer" });
    }
  });
  
  app.post("/api/answers/:id/vote", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to vote on an answer" });
      }
      
      const answerId = parseInt(req.params.id);
      const answer = await storage.getAnswer(answerId);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      const { isUpvote } = req.body;
      
      if (typeof isUpvote !== 'boolean') {
        return res.status(400).json({ message: "isUpvote must be a boolean" });
      }
      
      // Check if the user has already voted on this answer
      const existingVote = await storage.getVoteByUserAndAnswer(req.session.userId, answerId);
      
      if (existingVote) {
        // Update existing vote
        await storage.updateVote(existingVote.id, { isUpvote });
      } else {
        // Create new vote
        await storage.createVote({
          userId: req.session.userId,
          answerId,
          isUpvote
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on answer:", error);
      res.status(500).json({ message: "Failed to vote on answer" });
    }
  });
  
  app.delete("/api/answers/:id/vote", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to remove a vote" });
      }
      
      const answerId = parseInt(req.params.id);
      const answer = await storage.getAnswer(answerId);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      // Get the user's vote on this answer
      const vote = await storage.getVoteByUserAndAnswer(req.session.userId, answerId);
      
      if (!vote) {
        return res.status(404).json({ message: "Vote not found" });
      }
      
      // Delete the vote
      await storage.deleteVote(vote.id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing vote:", error);
      res.status(500).json({ message: "Failed to remove vote" });
    }
  });
  
  // Domain verification routes
  app.post("/api/domains/verify", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to verify a domain" });
      }

      const { domain, forumId } = req.body;
      
      if (!domain) {
        return res.status(400).json({ message: "Domain is required" });
      }
      
      if (!forumId) {
        return res.status(400).json({ message: "Forum ID is required" });
      }

      // Generate a verification token (unique random string)
      const verificationToken = Math.random().toString(36).substring(2, 15) + 
                               Math.random().toString(36).substring(2, 15);
      
      // Create verification record
      const verification = await storage.createDomainVerification({
        domain,
        forumId,
        verificationToken,
        isVerified: false
      });
      
      res.json({ 
        domain: verification.domain, 
        verificationToken: verification.verificationToken,
        verificationMethod: "dns-txt", // For future expansion to support multiple verification methods
        instructions: "Add a TXT record to your domain with the name '@' or the root domain, and the value provided above."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to start domain verification" });
      }
    }
  });

  app.post("/api/domains/check-verification", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to check domain verification" });
      }

      const { domain, token } = req.body;
      
      if (!domain || !token) {
        return res.status(400).json({ message: "Domain and token are required" });
      }

      // In a real implementation, we would check the domain's DNS records here
      // For the demo, we'll simulate verification by checking our database
      const isVerified = await storage.verifyDomain(domain, token);
      
      if (isVerified) {
        res.json({ verified: true, message: "Domain successfully verified" });
      } else {
        res.json({ verified: false, message: "Domain verification failed. Please check the TXT record and try again." });
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to check domain verification" });
      }
    }
  });

  // Lead Capture Form routes
  app.get("/api/forums/:forumId/lead-forms", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to access lead forms" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to access this forum's lead forms" });
      }

      const forms = await storage.getLeadCaptureFormsByForum(forumId);
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead forms" });
    }
  });

  app.get("/api/lead-forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const form = await storage.getLeadCaptureFormWithStats(id);
      
      if (!form) {
        return res.status(404).json({ message: "Lead form not found" });
      }
      
      res.json(form);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead form" });
    }
  });

  app.post("/api/forums/:forumId/lead-forms", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to create a lead form" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to create lead forms for this forum" });
      }

      const validatedData = insertLeadCaptureFormSchema.parse({
        ...req.body,
        forumId
      });
      
      const form = await storage.createLeadCaptureForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create lead form" });
      }
    }
  });

  app.put("/api/lead-forms/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to update a lead form" });
      }

      const id = parseInt(req.params.id);
      const form = await storage.getLeadCaptureForm(id);
      
      if (!form) {
        return res.status(404).json({ message: "Lead form not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(form.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this lead form" });
      }

      const validatedData = insertLeadCaptureFormSchema.partial().parse(req.body);
      
      const updatedForm = await storage.updateLeadCaptureForm(id, validatedData);
      res.json(updatedForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to update lead form" });
      }
    }
  });

  app.delete("/api/lead-forms/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to delete a lead form" });
      }

      const id = parseInt(req.params.id);
      const form = await storage.getLeadCaptureForm(id);
      
      if (!form) {
        return res.status(404).json({ message: "Lead form not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(form.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this lead form" });
      }

      await storage.deleteLeadCaptureForm(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead form" });
    }
  });

  // Lead Submission routes
  app.get("/api/lead-forms/:id/submissions", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to access lead submissions" });
      }

      const formId = parseInt(req.params.id);
      const form = await storage.getLeadCaptureForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Lead form not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(form.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to access submissions for this form" });
      }

      const submissions = await storage.getLeadSubmissionsByForm(formId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead submissions" });
    }
  });

  app.post("/api/lead-forms/:id/submissions", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const form = await storage.getLeadCaptureForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Lead form not found" });
      }

      const validatedData = insertLeadSubmissionSchema.parse({
        ...req.body,
        formId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      const submission = await storage.createLeadSubmission(validatedData);

      // Record a form view with conversion
      await storage.recordLeadFormView({
        formId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referrer'),
        isConversion: true
      });
      
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to submit lead form" });
      }
    }
  });

  app.post("/api/lead-forms/:id/export", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to export lead submissions" });
      }

      const formId = parseInt(req.params.id);
      const form = await storage.getLeadCaptureForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Lead form not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(form.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to export submissions for this form" });
      }

      // Mark submissions as exported
      await storage.markLeadSubmissionsAsExported(formId);
      
      // Get the updated submissions list
      const submissions = await storage.getLeadSubmissionsByForm(formId);
      res.json({ success: true, submissions });
    } catch (error) {
      res.status(500).json({ message: "Failed to export lead submissions" });
    }
  });

  // Lead Form View Tracking
  app.post("/api/lead-forms/:id/view", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const form = await storage.getLeadCaptureForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: "Lead form not found" });
      }

      // Record a form view without conversion
      await storage.recordLeadFormView({
        formId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referrer'),
        isConversion: false
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to record form view" });
    }
  });

  // Gated Content routes
  app.get("/api/forums/:forumId/gated-content", async (req, res) => {
    try {
      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }

      const gatedContents = await storage.getGatedContentsByForum(forumId);
      
      // Only send teasers and basic info for public access
      const publicGatedContents = gatedContents.map(content => ({
        id: content.id,
        title: content.title,
        slug: content.slug,
        teaser: content.teaser,
        description: content.description,
        featuredImage: content.featuredImage,
        contentType: content.contentType,
        createdAt: content.createdAt,
        formId: content.formId
      }));
      
      res.json(publicGatedContents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gated content" });
    }
  });

  app.get("/api/gated-content/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to access full gated content" });
      }

      const id = parseInt(req.params.id);
      const content = await storage.getGatedContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Gated content not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(content.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to access this gated content" });
      }

      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gated content" });
    }
  });

  app.post("/api/forums/:forumId/gated-content", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to create gated content" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to create gated content for this forum" });
      }

      const validatedData = insertGatedContentSchema.parse({
        ...req.body,
        forumId
      });
      
      const content = await storage.createGatedContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create gated content" });
      }
    }
  });

  app.put("/api/gated-content/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to update gated content" });
      }

      const id = parseInt(req.params.id);
      const content = await storage.getGatedContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Gated content not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(content.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this gated content" });
      }

      const validatedData = insertGatedContentSchema.partial().parse(req.body);
      
      const updatedContent = await storage.updateGatedContent(id, validatedData);
      res.json(updatedContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to update gated content" });
      }
    }
  });

  app.delete("/api/gated-content/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to delete gated content" });
      }

      const id = parseInt(req.params.id);
      const content = await storage.getGatedContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Gated content not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(content.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this gated content" });
      }

      await storage.deleteGatedContent(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gated content" });
    }
  });

  // CRM Integration routes
  app.get("/api/forums/:forumId/crm-integrations", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to access CRM integrations" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to access this forum's CRM integrations" });
      }

      const integrations = await storage.getCrmIntegrationsByForum(forumId);
      
      // Mask sensitive fields for security
      const safeIntegrations = integrations.map(integration => ({
        ...integration,
        apiKey: integration.apiKey ? "********" : null,
        apiSecret: integration.apiSecret ? "********" : null
      }));
      
      res.json(safeIntegrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CRM integrations" });
    }
  });

  app.post("/api/forums/:forumId/crm-integrations", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to create a CRM integration" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to create CRM integrations for this forum" });
      }

      const validatedData = insertCrmIntegrationSchema.parse({
        ...req.body,
        forumId
      });
      
      const integration = await storage.createCrmIntegration(validatedData);
      
      // Mask sensitive fields in the response
      const safeIntegration = {
        ...integration,
        apiKey: integration.apiKey ? "********" : null,
        apiSecret: integration.apiSecret ? "********" : null
      };
      
      res.status(201).json(safeIntegration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create CRM integration" });
      }
    }
  });

  app.put("/api/crm-integrations/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to update a CRM integration" });
      }

      const id = parseInt(req.params.id);
      const integration = await storage.getCrmIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ message: "CRM integration not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(integration.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this CRM integration" });
      }

      const validatedData = insertCrmIntegrationSchema.partial().parse(req.body);
      
      const updatedIntegration = await storage.updateCrmIntegration(id, validatedData);
      
      // Mask sensitive fields in the response
      const safeIntegration = {
        ...updatedIntegration,
        apiKey: updatedIntegration.apiKey ? "********" : null,
        apiSecret: updatedIntegration.apiSecret ? "********" : null
      };
      
      res.json(safeIntegration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to update CRM integration" });
      }
    }
  });

  app.delete("/api/crm-integrations/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to delete a CRM integration" });
      }

      const id = parseInt(req.params.id);
      const integration = await storage.getCrmIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ message: "CRM integration not found" });
      }
      
      // Get the forum to check ownership
      const forum = await storage.getForum(integration.forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this CRM integration" });
      }

      await storage.deleteCrmIntegration(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete CRM integration" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/dashboard-stats/:period", getDashboardStats);
  app.get("/api/analytics/traffic/:period", getTrafficData);
  app.get("/api/analytics/traffic/daily", getDailyTrafficData);
  app.get("/api/analytics/top-content", getTopContent);
  app.get("/api/analytics/seo-rankings", getSeoRankings);
  app.get("/api/analytics/conversion-funnel", getConversionFunnel);
  app.get("/api/analytics/referral-traffic", getReferralTraffic);
  app.get("/api/analytics/device-distribution", getDeviceDistribution);
  app.get("/api/analytics/geographic-data", getGeographicData);
  app.get("/api/analytics/lead-capture-stats", getLeadCaptureStats);
  app.get("/api/analytics/ai-activity", getAiActivity);
  
  // User Engagement Metrics routes
  app.get("/api/analytics/user-engagement/:forumId", getUserEngagementMetrics);
  app.get("/api/analytics/user-engagement/:forumId/session-duration", getAverageSessionDuration);
  app.get("/api/analytics/user-engagement/:forumId/return-visitor-trend", getReturnVisitorTrend);
  
  // Content Performance Metrics routes
  app.get("/api/analytics/content-performance/:forumId", getContentPerformanceMetrics);
  app.get("/api/analytics/content-performance/:forumId/top", getTopPerformingContent);
  app.get("/api/analytics/content-performance/:forumId/engagement-trend", getContentEngagementTrend);
  
  // Analytics Events routes
  app.get("/api/analytics/events/:forumId", getAnalyticsEvents);
  app.get("/api/analytics/events/:forumId/counts", getEventCountsByType);
  
  // Analytics tracking endpoints
  app.post("/api/analytics/track-event", async (req, res) => {
    try {
      const {
        forumId,
        eventType,
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
        pageUrl,
        additionalData,
        sessionId,
        deviceType,
        browserInfo
      } = req.body;
      
      // Validate required fields
      if (!forumId || !eventType) {
        return res.status(400).json({ message: "Forum ID and event type are required" });
      }
      
      // Get user ID from session if logged in
      const userId = req.session?.userId || null;
      
      // Add client IP address
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      // Save the event to database
      await storage.trackAnalyticsEvent({
        forumId,
        userId,
        eventType,
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
        sessionId,
        deviceType,
        browserInfo,
        ipAddress: ipAddress as string,
        referrer: req.headers.referer || null,
        pageUrl,
        additionalData: additionalData ? JSON.stringify(additionalData) : null,
        timestamp: new Date()
      });
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error tracking event:", error);
      res.status(500).json({ message: "Failed to track event" });
    }
  });
  
  app.post("/api/analytics/track-user-engagement", async (req, res) => {
    try {
      const {
        forumId,
        date,
        pageViews,
        uniqueVisitors,
        avgSessionDuration,
        bounceRate,
        deviceType,
        referrer,
        deviceBreakdown
      } = req.body;
      
      // Validate required fields
      if (!forumId || !date) {
        return res.status(400).json({ message: "Forum ID and date are required" });
      }
      
      // Find existing metrics for this date and forum
      const existingMetrics = await storage.getUserEngagementMetricsByForumAndDate(forumId, date);
      
      if (existingMetrics) {
        // Update existing metrics
        await storage.updateUserEngagementMetrics(existingMetrics.id, {
          pageViews: (existingMetrics.pageViews || 0) + (pageViews || 0),
          uniqueVisitors: (existingMetrics.uniqueVisitors || 0) + (uniqueVisitors || 0),
          // If avgSessionDuration is provided, compute a weighted average
          avgSessionDuration: avgSessionDuration 
            ? ((existingMetrics.avgSessionDuration || 0) * (existingMetrics.pageViews || 1) + 
               (avgSessionDuration * (pageViews || 1))) / 
              ((existingMetrics.pageViews || 0) + (pageViews || 1))
            : existingMetrics.avgSessionDuration,
          bounceRate: bounceRate !== undefined 
            ? ((existingMetrics.bounceRate || 0) * (existingMetrics.pageViews || 1) + 
               (bounceRate * (pageViews || 1))) / 
              ((existingMetrics.pageViews || 0) + (pageViews || 1))
            : existingMetrics.bounceRate,
          // Merge device breakdown data if provided
          deviceBreakdown: deviceBreakdown 
            ? JSON.stringify({
                ...JSON.parse(existingMetrics.deviceBreakdown || '{}'),
                ...deviceBreakdown
              })
            : existingMetrics.deviceBreakdown
        });
      } else {
        // Create new metrics
        await storage.createUserEngagementMetrics({
          forumId,
          date,
          pageViews: pageViews || 0,
          uniqueVisitors: uniqueVisitors || 0,
          avgSessionDuration,
          bounceRate,
          deviceBreakdown: deviceBreakdown ? JSON.stringify(deviceBreakdown) : null,
          // Initialize other fields
          topReferrers: JSON.stringify([]),
          eventsTriggered: JSON.stringify({}),
          activeUsers: 0,
          newUsers: uniqueVisitors || 0,
          returningUsers: 0,
          conversionRate: 0
        });
      }
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error tracking user engagement:", error);
      res.status(500).json({ message: "Failed to track user engagement" });
    }
  });
  
  app.post("/api/analytics/track-content-performance", async (req, res) => {
    try {
      const {
        forumId,
        contentType,
        contentId,
        title,
        url,
        impressions,
        clicks,
        socialShares,
        avgTimeOnContent,
        scoreDate
      } = req.body;
      
      // Validate required fields
      if (!forumId || !contentType || !contentId) {
        return res.status(400).json({ 
          message: "Forum ID, content type, and content ID are required" 
        });
      }
      
      // Find existing metrics for this content and date
      const existingMetrics = await storage.getContentPerformanceMetricsByContentAndDate(
        forumId, contentType, contentId, scoreDate
      );
      
      if (existingMetrics) {
        // Update existing metrics
        await storage.updateContentPerformanceMetrics(existingMetrics.id, {
          impressions: (existingMetrics.impressions || 0) + (impressions || 0),
          clicks: (existingMetrics.clicks || 0) + (clicks || 0),
          socialShares: (existingMetrics.socialShares || 0) + (socialShares || 0),
          // Calculate new CTR
          ctr: (existingMetrics.clicks || 0) + (clicks || 0) > 0 
            ? (((existingMetrics.clicks || 0) + (clicks || 0)) / 
               ((existingMetrics.impressions || 0) + (impressions || 0))) 
            : existingMetrics.ctr,
          // Calculate new average time on content (weighted)
          avgTimeOnContent: avgTimeOnContent 
            ? ((existingMetrics.avgTimeOnContent || 0) * (existingMetrics.impressions || 1) + 
               (avgTimeOnContent * (impressions || 1))) / 
              ((existingMetrics.impressions || 0) + (impressions || 1))
            : existingMetrics.avgTimeOnContent
        });
      } else {
        // Create new metrics
        await storage.createContentPerformanceMetrics({
          forumId,
          contentType,
          contentId,
          title: title || '',
          url: url || '',
          impressions: impressions || 0,
          clicks: clicks || 0,
          socialShares: socialShares || 0,
          ctr: impressions > 0 ? (clicks || 0) / impressions : 0,
          avgTimeOnContent: avgTimeOnContent || 0,
          avgPosition: 0, // Initialize with default values
          backlinks: 0,
          engagementRate: 0,
          conversionRate: 0,
          scoreDate,
          performance: JSON.stringify({})
        });
      }
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error tracking content performance:", error);
      res.status(500).json({ message: "Failed to track content performance" });
    }
  });
  


  // Content Schedule routes
  app.get("/api/content-schedules", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to access content schedules" });
      }
      
      const schedules = await storage.getContentSchedulesByUser(req.session.userId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content schedules" });
    }
  });

  app.get("/api/content-schedules/upcoming", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to access upcoming content schedules" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const schedules = await storage.getUpcomingContentSchedules(limit);
      
      // Filter to only show schedules from forums owned by the user
      const userSchedules = [];
      for (const schedule of schedules) {
        if (schedule.forum.userId === req.session.userId) {
          userSchedules.push(schedule);
        }
      }
      
      res.json(userSchedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming content schedules" });
    }
  });

  app.get("/api/forums/:id/content-schedules", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to access forum content schedules" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to access this forum's content schedules" });
      }
      
      const schedules = await storage.getContentSchedulesByForum(forumId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum content schedules" });
    }
  });

  app.get("/api/content-schedules/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to access content schedules" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to access this content schedule" });
      }
      
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content schedule" });
    }
  });

  app.post("/api/content-schedules", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to create a content schedule" });
      }
      
      // Validate the forum ownership
      const forum = await storage.getForum(req.body.forumId);
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      if (forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to create content for this forum" });
      }
      
      const validatedData = insertContentScheduleSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const schedule = await storage.createContentSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create content schedule" });
      }
    }
  });

  app.patch("/api/content-schedules/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to update a content schedule" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to update this content schedule" });
      }
      
      const updatedSchedule = await storage.updateContentSchedule(id, req.body);
      res.json(updatedSchedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to update content schedule" });
      }
    }
  });

  app.patch("/api/content-schedules/:id/status", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to update a content schedule status" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to update this content schedule" });
      }
      
      const { status, questionIds } = req.body;
      
      // Validate the status value
      if (!["draft", "scheduled", "published", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updatedSchedule = await storage.updateContentScheduleStatus(id, status, questionIds);
      res.json(updatedSchedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to update content schedule status" });
    }
  });

  app.delete("/api/content-schedules/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to delete a content schedule" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to delete this content schedule" });
      }
      
      await storage.deleteContentSchedule(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content schedule" });
    }
  });

  // Generate and publish content according to schedule
  app.post("/api/content-schedules/:id/publish", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to publish scheduled content" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to publish this content schedule" });
      }
      
      // Check if the schedule is ready to be published
      if (schedule.status !== "scheduled") {
        return res.status(400).json({ message: "Only scheduled content can be published" });
      }
      
      // Generate the requested number of questions based on the keyword
      const count = req.body.count || 5; // Default to 5 questions
      const questions = await generateKeywordOptimizedQuestions(
        schedule.keyword,
        count,
        req.body.difficulty || "intermediate"
      );
      
      // Create the questions in the database
      const createdQuestionIds = [];
      
      if (questions && questions.questions) {
        for (const questionData of questions.questions) {
          try {
            const newQuestion = await storage.createQuestion({
              userId: req.session.userId,
              title: questionData.title,
              content: questionData.content,
              categoryId: schedule.categoryId || 1, // Default to first category if none specified
              isAiGenerated: true,
              aiPersonaType: questionData.difficulty
            });
            
            createdQuestionIds.push(newQuestion.id);
          } catch (error) {
            console.error("Error creating question:", error);
          }
        }
      }
      
      // Update the content schedule status to published with the created question IDs
      const updatedSchedule = await storage.updateContentScheduleStatus(id, "published", createdQuestionIds);
      
      res.json({
        success: true,
        schedule: updatedSchedule,
        questionIds: createdQuestionIds,
        questionsCreated: createdQuestionIds.length
      });
    } catch (error) {
      console.error("Error publishing content schedule:", error);
      res.status(500).json({ message: "Failed to publish content schedule" });
    }
  });

  // SEO Tracking API Routes
  // Get all keywords for a forum
  app.get("/api/forums/:id/seo/keywords", async (req, res) => {
    try {
      const forumId = parseInt(req.params.id);
      const keywords = await storage.getSeoKeywordsByForum(forumId);
      res.json(keywords);
    } catch (error) {
      console.error("Error getting forum SEO keywords:", error);
      res.status(500).json({ message: "Failed to get SEO keywords" });
    }
  });

  // Get a specific keyword with position history
  app.get("/api/seo/keywords/:id", async (req, res) => {
    try {
      const keywordId = parseInt(req.params.id);
      const keyword = await storage.getSeoKeywordWithPositionHistory(keywordId);
      
      if (!keyword) {
        return res.status(404).json({ message: "Keyword not found" });
      }
      
      res.json(keyword);
    } catch (error) {
      console.error("Error getting SEO keyword details:", error);
      res.status(500).json({ message: "Failed to get SEO keyword details" });
    }
  });

  // Create a new SEO keyword to track
  app.post("/api/seo/keywords", async (req, res) => {
    try {
      const keywordData = req.body;
      
      // Validate input
      if (!keywordData.keyword || !keywordData.forumId) {
        return res.status(400).json({ message: "Keyword and forumId are required" });
      }
      
      const newKeyword = await storage.createSeoKeyword(keywordData);
      res.status(201).json(newKeyword);
    } catch (error) {
      console.error("Error creating SEO keyword:", error);
      res.status(500).json({ message: "Failed to create SEO keyword" });
    }
  });

  // Update an existing SEO keyword
  app.patch("/api/seo/keywords/:id", async (req, res) => {
    try {
      const keywordId = parseInt(req.params.id);
      const keywordData = req.body;
      
      const updatedKeyword = await storage.updateSeoKeyword(keywordId, keywordData);
      res.json(updatedKeyword);
    } catch (error) {
      console.error("Error updating SEO keyword:", error);
      res.status(500).json({ message: "Failed to update SEO keyword" });
    }
  });

  // Delete an SEO keyword
  app.delete("/api/seo/keywords/:id", async (req, res) => {
    try {
      const keywordId = parseInt(req.params.id);
      await storage.deleteSeoKeyword(keywordId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting SEO keyword:", error);
      res.status(500).json({ message: "Failed to delete SEO keyword" });
    }
  });

  // Add a position record for a keyword
  app.post("/api/seo/keywords/:id/positions", async (req, res) => {
    try {
      const keywordId = parseInt(req.params.id);
      const positionData = {
        ...req.body,
        keywordId
      };
      
      if (!positionData.position) {
        return res.status(400).json({ message: "Position value is required" });
      }
      
      const newPosition = await storage.createSeoPosition(positionData);
      res.status(201).json(newPosition);
    } catch (error) {
      console.error("Error creating SEO position:", error);
      res.status(500).json({ message: "Failed to create SEO position" });
    }
  });

  // Get content gaps for a forum
  app.get("/api/forums/:id/seo/content-gaps", async (req, res) => {
    try {
      const forumId = parseInt(req.params.id);
      const onlyUnaddressed = req.query.unaddressed === 'true';
      
      const gaps = onlyUnaddressed 
        ? await storage.getUnadressedSeoContentGaps(forumId)
        : await storage.getSeoContentGapsByForum(forumId);
        
      res.json(gaps);
    } catch (error) {
      console.error("Error getting content gaps:", error);
      res.status(500).json({ message: "Failed to get content gaps" });
    }
  });

  // Create a new content gap
  app.post("/api/seo/content-gaps", async (req, res) => {
    try {
      const gapData = req.body;
      
      if (!gapData.keyword || !gapData.forumId) {
        return res.status(400).json({ message: "Keyword and forumId are required" });
      }
      
      const newGap = await storage.createSeoContentGap(gapData);
      res.status(201).json(newGap);
    } catch (error) {
      console.error("Error creating content gap:", error);
      res.status(500).json({ message: "Failed to create content gap" });
    }
  });

  // Update a content gap's addressed status
  app.patch("/api/seo/content-gaps/:id/status", async (req, res) => {
    try {
      const gapId = parseInt(req.params.id);
      const { isAddressed, targetUrl } = req.body;
      
      if (typeof isAddressed !== 'boolean') {
        return res.status(400).json({ message: "isAddressed status is required" });
      }
      
      const updatedGap = await storage.updateSeoContentGapStatus(gapId, isAddressed, targetUrl);
      res.json(updatedGap);
    } catch (error) {
      console.error("Error updating content gap status:", error);
      res.status(500).json({ message: "Failed to update content gap status" });
    }
  });

  // Get SEO page metrics for a forum
  app.get("/api/forums/:id/seo/page-metrics", async (req, res) => {
    try {
      const forumId = parseInt(req.params.id);
      const metrics = await storage.getSeoPageMetricsByForum(forumId);
      res.json(metrics);
    } catch (error) {
      console.error("Error getting SEO page metrics:", error);
      res.status(500).json({ message: "Failed to get SEO page metrics" });
    }
  });

  // Create or update SEO page metric
  app.post("/api/seo/page-metrics", async (req, res) => {
    try {
      const metricData = req.body;
      
      if (!metricData.url || !metricData.forumId || !metricData.pageTitle) {
        return res.status(400).json({ 
          message: "URL, forumId, and pageTitle are required" 
        });
      }
      
      // Check if metric for this URL exists
      const existingMetric = await storage.getSeoPageMetricByUrl(
        metricData.forumId, 
        metricData.url
      );
      
      let result;
      if (existingMetric) {
        // Update existing metric
        result = await storage.updateSeoPageMetric(existingMetric.id, metricData);
      } else {
        // Create new metric
        result = await storage.createSeoPageMetric(metricData);
      }
      
      res.status(existingMetric ? 200 : 201).json(result);
    } catch (error) {
      console.error("Error creating/updating SEO page metric:", error);
      res.status(500).json({ message: "Failed to create/update SEO page metric" });
    }
  });

  // Get weekly SEO reports for a forum
  app.get("/api/forums/:id/seo/weekly-reports", async (req, res) => {
    try {
      const forumId = parseInt(req.params.id);
      const reports = await storage.getSeoWeeklyReportsByForum(forumId);
      res.json(reports);
    } catch (error) {
      console.error("Error getting SEO weekly reports:", error);
      res.status(500).json({ message: "Failed to get SEO weekly reports" });
    }
  });

  // Get latest SEO report for a forum
  app.get("/api/forums/:id/seo/weekly-reports/latest", async (req, res) => {
    try {
      const forumId = parseInt(req.params.id);
      const report = await storage.getLatestSeoWeeklyReport(forumId);
      
      if (!report) {
        return res.status(404).json({ message: "No weekly reports found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error getting latest SEO report:", error);
      res.status(500).json({ message: "Failed to get latest SEO report" });
    }
  });

  // Create a new weekly SEO report
  app.post("/api/seo/weekly-reports", async (req, res) => {
    try {
      const reportData = req.body;
      
      if (!reportData.forumId || !reportData.weekStartDate || !reportData.weekEndDate) {
        return res.status(400).json({ 
          message: "forumId, weekStartDate, and weekEndDate are required" 
        });
      }
      
      const newReport = await storage.createSeoWeeklyReport(reportData);
      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error creating SEO weekly report:", error);
      res.status(500).json({ message: "Failed to create SEO weekly report" });
    }
  });

  // Generate a batch of optimized questions and answers for a forum section
  app.post("/api/forums/:forumId/generate-section-content", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "You must be logged in to generate forum content" });
      }
      
      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to generate content for this forum" });
      }
      
      const { 
        sectionTitle, 
        keywordFocus, 
        questionCount = 5, 
        questionPersona = "expert",
        answerPersona = "expert", 
        generateAnswers = true,
        schedulePublication = false,
        scheduledDate
      } = req.body;
      
      if (!sectionTitle || !keywordFocus) {
        return res.status(400).json({ message: "Section title and keyword focus are required" });
      }
      
      // Check valid persona types
      if (!["beginner", "intermediate", "expert", "moderator"].includes(questionPersona)) {
        return res.status(400).json({ message: "Invalid question persona type" });
      }
      
      if (!["beginner", "intermediate", "expert", "moderator"].includes(answerPersona)) {
        return res.status(400).json({ message: "Invalid answer persona type" });
      }
      
      // Generate optimized questions using the AI service
      const optimizedQuestions = await generateSeoOptimizedQuestions(
        keywordFocus, 
        questionCount
      );
      
      const createdQuestions = [];
      const createdAnswers = [];
      
      // Create questions in the database
      for (const q of optimizedQuestions.questions) {
        const questionData = {
          userId: req.session.userId,
          forumId,
          title: q.title,
          content: q.content,
          keywordTargets: q.targetKeywords.primary + "," + q.targetKeywords.secondary.join(","),
          isAiGenerated: true,
          aiPersonaType: questionPersona,
          status: schedulePublication ? 'scheduled' : 'published',
          categoryId: null // Could be enhanced to match to existing categories
        };
        
        const newQuestion = await storage.createQuestion(questionData);
        createdQuestions.push(newQuestion);
        
        // Generate and save answers if requested
        if (generateAnswers) {
          const answerContent = await generateAnswer(q.title, q.content, answerPersona);
          
          const answerData = {
            userId: req.session.userId,
            questionId: newQuestion.id,
            content: answerContent,
            isAiGenerated: true,
            aiPersonaType: answerPersona
          };
          
          const newAnswer = await storage.createAnswer(answerData);
          createdAnswers.push(newAnswer);
        }
      }
      
      // Create a content schedule entry if requested
      let contentSchedule = null;
      if (schedulePublication && scheduledDate) {
        const scheduleData = {
          userId: req.session.userId,
          forumId,
          title: sectionTitle,
          keyword: keywordFocus,
          contentType: 'section',
          status: 'scheduled',
          personaType: questionPersona,
          answerPersonaType: answerPersona,
          scheduledFor: new Date(scheduledDate),
          questionCount: createdQuestions.length,
          questionIds: JSON.stringify(createdQuestions.map(q => q.id))
        };
        
        contentSchedule = await storage.createContentSchedule(scheduleData);
      }
      
      res.status(201).json({
        sectionTitle,
        keywordFocus,
        questions: createdQuestions,
        answers: createdAnswers,
        contentSchedule
      });
    } catch (error) {
      console.error("Error generating section content:", error);
      res.status(500).json({ message: "Failed to generate section content" });
    }
  });

  // Register the embed routes for JavaScript integration
  registerEmbedRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertQuestionSchema, insertAnswerSchema, insertVoteSchema } from "@shared/schema";
import { 
  generateAiContent,
  generateSeoQuestions,
  analyzeQuestionSeo,
  generateAnswer,
  generateInterlinkingSuggestions
} from "./ai";
import session from "express-session";

// Extend Express Request to include session property
declare module "express-session" {
  interface SessionData {
    userId?: number;
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
  // User authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json({ success: true, user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set up session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.json({ success: true, user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.get("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err: Error | null) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log out" });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

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
      const { questionId, personaType = "expert" } = req.body;
      
      if (!questionId) {
        return res.status(400).json({ message: "Question ID is required" });
      }
      
      // Get the question details
      const question = await storage.getQuestionWithDetails(parseInt(questionId));
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const answer = await generateAnswer(question.title, question.content, personaType);
      
      // If user is authenticated, save the AI-generated answer
      if (req.session?.userId) {
        // Default to a standard AI user ID since we can't access private properties of the storage class
        // In a production app, we would have a method in the storage class to find AI users by persona type
        
        // Use specific AI user IDs based on persona type
        let aiUserId = 6; // Default to AI Expert ID
        if (personaType === "beginner") {
          aiUserId = 7; // AI Beginner ID
        } else if (personaType === "intermediate") {
          aiUserId = 8; // AI Intermediate ID
        } else if (personaType === "moderator") {
          aiUserId = 9; // AI Moderator ID
        }
        
        const newAnswer = await storage.createAnswer({
          questionId: parseInt(questionId),
          userId: aiUserId,
          content: answer,
          isAiGenerated: true,
          aiPersonaType: personaType
        });
        
        return res.json({ answer, saved: true, answerId: newAnswer.id });
      }
      
      res.json({ answer, saved: false });
    } catch (error) {
      console.error("Error generating AI answer:", error);
      res.status(500).json({ message: "Failed to generate AI answer" });
    }
  });

  app.post("/api/ai/generate-interlinking", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // Get all questions to analyze for interlinking
      const questions = await storage.getAllQuestionsWithDetails();
      const questionData = questions.map(q => ({
        id: q.id,
        title: q.title,
        content: q.content
      }));
      
      const suggestions = await generateInterlinkingSuggestions(content, questionData);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating interlinking suggestions:", error);
      res.status(500).json({ message: "Failed to generate interlinking suggestions" });
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

  const httpServer = createServer(app);

  return httpServer;
}

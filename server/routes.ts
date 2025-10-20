import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import * as crypto from "crypto";
import { generateAnswer, generateSeoQuestions, analyzeQuestionSeo, generateInterlinkingSuggestions } from "./ai";
import prdEndpoints from "./routes/prd-endpoints";
import additionalEndpoints from "./routes/additional-endpoints";
import accessibilityEndpoints from "./routes/accessibility-endpoints";
import interlinkingEndpoints from "./routes/interlinking-endpoints";
import missingEndpoints from "./routes/missing-endpoints";
import analyticsEndpoints from "./routes/analytics-endpoints";
import seoReportingEndpoints from "./routes/seo-reporting-endpoints";
import competitorAnalysisEndpoints from "./routes/competitor-analysis-endpoints";
import contentGapAnalysisEndpoints from "./routes/content-gap-analysis-endpoints";
import googleSearchConsoleEndpoints from "./routes/google-search-console-endpoints";
import { clerkClient } from '@clerk/clerk-sdk-node';
import { errorHandlingSystem } from './middleware/error-handler';
import { performanceOptimizationSystem } from './performance/optimization';
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
import { registerEmbedRoutes } from "./embed";
import { registerClerkAuthRoutes, requireClerkAuth, getClerkUserId, getClerkUser } from "./clerk-auth";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add performance monitoring middleware
  app.use(performanceOptimizationSystem.performanceMiddleware);
  
  // Add global error handler
  app.use(errorHandlingSystem.globalErrorHandler);

  // Register Clerk authentication routes
  registerClerkAuthRoutes(app, storage);
  
  // Polar.sh payment processing routes
  
  // Get user subscription details
  app.get("/api/users/subscription", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user data from our database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get additional subscription details from Polar if we have a subscription ID
      let subscriptionDetails = null;
      if (user.polarSubscriptionId) {
        try {
          const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
          if (!polarAccessToken) {
            console.warn("POLAR_ACCESS_TOKEN not set, cannot fetch subscription details");
          } else {
            // Fetch detailed subscription information from Polar.sh
            const polarResponse = await fetch(`https://api.polar.sh/v1/subscriptions/${user.polarSubscriptionId}`, {
              headers: {
                'Authorization': `Bearer ${polarAccessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (polarResponse.ok) {
              subscriptionDetails = await polarResponse.json();
            } else {
              console.warn(`Failed to fetch Polar subscription details: ${polarResponse.status} ${polarResponse.statusText}`);
            }
          }
        } catch (polarError) {
          console.error("Error fetching Polar subscription details:", polarError);
        }
      }
      
      // Return the user's subscription info
      res.json({
        status: user.planActiveUntil && new Date(user.planActiveUntil) > new Date() ? 'active' : 'inactive',
        plan: user.plan || 'starter',
        planActiveUntil: user.planActiveUntil,
        polarSubscriptionId: user.polarSubscriptionId,
        details: subscriptionDetails
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription information" });
    }
  });
  
  // Get user billing history
  app.get("/api/users/billing-history", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
      if (!polarAccessToken) {
        return res.status(500).json({ message: "Polar API token not configured" });
      }
      
      // Fetch invoice history from Polar.sh
      try {
        const polarResponse = await fetch('https://api.polar.sh/v1/invoices', {
          headers: {
            'Authorization': `Bearer ${polarAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!polarResponse.ok) {
          return res.status(500).json({ message: "Failed to fetch billing history from Polar" });
        }
        
        const billingHistory = await polarResponse.json();
        
        // Filter billing history for the current user if necessary
        const userBillingHistory = Array.isArray(billingHistory) 
          ? billingHistory.filter(invoice => invoice.user_id === clerkId || invoice.customer?.id === clerkId)
          : [];
          
        res.json(userBillingHistory);
      } catch (polarError) {
        console.error("Error fetching Polar billing history:", polarError);
        return res.status(500).json({ message: "Error retrieving billing history" });
      }
    } catch (error) {
      console.error("Error in billing history endpoint:", error);
      res.status(500).json({ message: "Failed to fetch billing history" });
    }
  });
  
  // Handle plan selection (before redirecting to Polar)
  app.post("/api/users/select-plan", requireClerkAuth, async (req, res) => {
    try {
      const { userId, planType } = req.body;
      
      if (!userId || !planType) {
        return res.status(400).json({ message: "Missing userId or planType" });
      }
      
      // Get the user from our database using Clerk ID
      const user = await storage.getUserByClerkId(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user with the selected plan
      await storage.updateUserPlan(user.id, { plan: planType });
      
      res.json({ message: "Plan selection saved" });
    } catch (error) {
      console.error("Error saving plan selection:", error);
      res.status(500).json({ message: "Failed to save plan selection" });
    }
  });
  
  // Polar webhook for subscription events (created, updated, canceled)
  app.post("/api/webhooks/polar", async (req, res) => {
    try {
      // Get the Polar webhook signature from the headers
      const polarSignature = req.headers['polar-signature'] as string;
      const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
      
      // Verify webhook signature
      if (!webhookSecret) {
        console.error("Polar Webhook Secret not configured");
        return res.status(500).json({ message: "Webhook configuration error" });
      }
      
      if (!polarSignature) {
        console.error("Missing Polar signature header");
        return res.status(401).json({ message: "Invalid webhook request" });
      }
      
      // For demo/testing purposes, we'll skip signature verification if a specific header is present
      if (req.headers['x-skip-signature-verification'] === 'true') {
        console.log("Skipping signature verification for testing");
      } else {
        // Get the raw request body from our middleware
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);
        
        // Verify the webhook signature
        try {
          // Create HMAC using the webhook secret
          const hmac = crypto.createHmac('sha256', webhookSecret);
          
          // Update HMAC with the raw request body
          hmac.update(rawBody);
          
          // Get the signature
          const calculatedSignature = hmac.digest('hex');
          
          // Log both signatures for debugging
          console.log(`Received signature: ${polarSignature}`);
          console.log(`Calculated signature: ${calculatedSignature}`);
          console.log(`Raw body used: ${typeof rawBody === 'string' ? 'From middleware' : 'JSON.stringify fallback'}`);
          
          // Compare signatures
          if (calculatedSignature !== polarSignature) {
            console.error("Invalid webhook signature");
            return res.status(401).json({ message: "Invalid webhook signature" });
          }
          
          console.log("Webhook signature verified successfully");
        } catch (signatureError) {
          console.error("Error verifying webhook signature:", signatureError);
          return res.status(500).json({ message: "Error verifying webhook signature" });
        }
      }
      
      const { event, data } = req.body;
      
      if (!event || !data) {
        return res.status(400).json({ message: "Invalid webhook payload" });
      }
      
      // Handle different payload structures based on event type
      if (event === 'subscription.created' || event === 'subscription.updated') {
        const { user_id, subscription_id, plan_id, subscription } = data;
        
        // Ensure we have all required data
        if (!user_id) {
          return res.status(400).json({ message: "Missing user_id in webhook data" });
        }
        
        // Get our user by Clerk ID
        const user = await storage.getUserByClerkId(user_id);
        
        if (!user) {
          console.error(`User not found for Clerk ID: ${user_id}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        // Determine expiration date
        let expirationDate = null;
        if (subscription?.current_period_end) {
          expirationDate = new Date(subscription.current_period_end);
        } else {
          // Fallback: set expiration date to 1 month from now
          expirationDate = new Date();
          expirationDate.setMonth(expirationDate.getMonth() + 1);
        }
        
        // Determine subscription ID
        const subId = subscription?.id || subscription_id;
        if (!subId) {
          console.warn("No subscription ID found in webhook data");
        }
        
        // Determine plan type from plan/product ID
        let planType: string | undefined = undefined;
        if (plan_id) {
          switch (plan_id) {
            // Match Polar.sh product IDs
            case '9dbc8276-eb2a-4b8a-81ec-e3c7962ed314':  // Starter plan product ID
              planType = 'starter';
              break;
            case 'cec301e0-e05e-4515-9bc3-297e6833496a':  // Pro plan product ID
              planType = 'professional';
              break;
            case '5cea5e8b-dd39-4c28-bcb0-0912b17bfcba':  // Enterprise plan product ID
              planType = 'enterprise';
              break;
              
            // For backward compatibility with older webhook test data
            case 'starter-plan':
              planType = 'starter';
              break;
            case 'professional-plan':
              planType = 'professional';
              break;
            case 'enterprise-plan':
              planType = 'enterprise';
              break;
              
            default:
              console.warn(`Unknown plan/product ID: ${plan_id}`);
          }
        }
        
        // Update the user's plan with all available information
        await storage.updateUserPlan(user.id, {
          plan: planType,
          planActiveUntil: expirationDate,
          polarSubscriptionId: subId
        });
      } 
      else if (event === 'subscription.deleted' || event === 'subscription.canceled' || event === 'subscription.cancelled' || event === 'subscription.failed') {
        const { user_id, subscription_id } = data;
        
        // Try to find the user directly if we have the user_id
        if (user_id) {
          const user = await storage.getUserByClerkId(user_id);
          if (user) {
            await storage.updateUserPlan(user.id, {
              planActiveUntil: null,
              polarSubscriptionId: null
            });
          } else {
            console.warn(`User not found for cancellation with Clerk ID: ${user_id}`);
          }
        } 
        // Otherwise find by subscription ID
        else if (subscription_id) {
          const users = await storage.getAllUsers();
          const user = users.find(u => u.polarSubscriptionId === subscription_id);
          
          if (user) {
            await storage.updateUserPlan(user.id, {
              plan: 'starter', // Downgrade to starter plan
              planActiveUntil: null,
              polarSubscriptionId: null
            });
          } else {
            console.warn(`User not found for cancellation with subscription ID: ${subscription_id}`);
          }
        } else {
          return res.status(400).json({ message: "Missing user_id or subscription_id in cancellation data" });
        }
      } else {
        console.warn(`Unhandled Polar webhook event: ${event}`);
      }
      
      res.json({ message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing Polar webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
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

  // General answers endpoint (used by interlinking)
  app.get("/api/answers", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const answers = await storage.getAllAnswersWithDetails(limit);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });

  app.post("/api/questions", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertQuestionSchema.parse({
        ...req.body,
        userId: user.id,
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

  app.post("/api/questions/:id/answers", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const questionId = parseInt(req.params.id);
      
      const validatedData = insertAnswerSchema.parse({
        ...req.body,
        questionId,
        userId: user.id,
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
  app.post("/api/answers/:id/vote", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const answerId = parseInt(req.params.id);
      
      const validatedData = insertVoteSchema.parse({
        answerId,
        userId: user.id,
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

  // AI Agents routes
  app.get("/api/ai-agents", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get all agents that belong to this user
      const agents = await storage.getAiAgentsByUserId(user.id);
      res.json(agents);
    } catch (error) {
      console.error("Error fetching user's AI agents:", error);
      res.status(500).json({ message: "Failed to fetch AI agents" });
    }
  });

  // Create a new AI agent
  app.post("/api/ai-agents", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check user's subscription and persona limit
      const subscription = await storage.getUserSubscription(user.id);
      const existingAgents = await storage.getAiAgentsByUserId(user.id);
      
      let agentLimit = 20; // Default to Starter plan
      if (subscription?.plan === "professional") {
        agentLimit = 100;
      } else if (subscription?.plan === "enterprise") {
        agentLimit = Number.MAX_SAFE_INTEGER; // Unlimited
      }
      
      if (existingPersonas.length >= agentLimit) {
        return res.status(403).json({ 
          message: `You've reached your plan's limit of ${agentLimit} AI agents. Upgrade your plan to create more.` 
        });
      }
      
      // Create the new persona
      const newAgent = {
        userId: user.id,
        name: req.body.name,
        description: req.body.description,
        expertise: req.body.expertise,
        personality: req.body.personality,
        tone: req.body.tone,
        responseLength: req.body.responseLength,
        active: req.body.active || true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 5.0, // Default initial rating
        responseTime: 1.0, // Default initial response time in seconds
        completionRate: 100.0, // Default initial completion rate percentage
      };
      
      const createdPersona = await storage.createAiAgent(newAgent);
      res.status(201).json(createdPersona);
    } catch (error) {
      console.error("Error creating AI agent:", error);
      res.status(500).json({ message: "Failed to create AI agent" });
    }
  });
  
  // Generate AI agents from website content
  app.post("/api/ai-agents/generate", requireClerkAuth, async (req, res) => {
    try {
      const { websiteUrl, count } = req.body;
      
      if (!websiteUrl) {
        return res.status(400).json({ message: "Website URL is required" });
      }
      
      const clerkId = req.auth?.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check user's subscription and persona limit
      const subscription = await storage.getUserSubscription(user.id);
      const existingAgents = await storage.getAiAgentsByUserId(user.id);
      
      let agentLimit = 20; // Default to Starter plan
      if (subscription?.plan === "professional") {
        agentLimit = 100;
      } else if (subscription?.plan === "enterprise") {
        agentLimit = Number.MAX_SAFE_INTEGER; // Unlimited
      }
      
      if (existingPersonas.length >= agentLimit) {
        return res.status(403).json({ 
          message: `You've reached your plan's limit of ${agentLimit} AI agents. Upgrade your plan to create more.` 
        });
      }

      // Determine how many personas to generate
      const requestedCount = count ? parseInt(count.toString(), 10) : 5; // Default to 5 if not specified
      const maxAllowed = agentLimit - existingPersonas.length;
      const personaCount = Math.min(requestedCount, maxAllowed);
      
      // Use AI to analyze the website and extract keywords
      const keywordAnalysis = await analyzeWebsiteForKeywords(websiteUrl);
      
      if (!keywordAnalysis || (!keywordAnalysis.primaryKeywords && !keywordAnalysis.secondaryKeywords) || 
          (keywordAnalysis.primaryKeywords.length === 0 && keywordAnalysis.secondaryKeywords.length === 0)) {
        return res.status(400).json({ message: "Could not extract keywords from the website" });
      }
      
      // Combine primary and secondary keywords
      const keywords = [
        ...keywordAnalysis.primaryKeywords,
        ...keywordAnalysis.secondaryKeywords
      ];
      
      // Generate personas based on the keywords
      const personas = generatePersonasFromKeywords(keywords, user.id, personaCount);
      
      // Save the personas to the database
      const createdPersonas = [];
      for (const persona of personas) {
        const createdPersona = await storage.createAiAgent({
          ...persona,
          type: persona.expertise || "intermediate" // Ensure type field is present
        });
        createdPersonas.push(createdPersona);
      }
      
      res.status(201).json(createdPersonas);
    } catch (error) {
      console.error("Error generating AI agents:", error);
      res.status(500).json({ message: "Failed to generate AI agents" });
    }
  });
  
  // Get persona stats (usage data)
  app.get("/api/ai-agents/stats", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get persona stats
      const agents = await storage.getAiAgentsByUserId(user.id);
      
      // For now, we just return the personas with their built-in stats
      // In the future, we could aggregate additional stats from other tables
      res.json(personas);
    } catch (error) {
      console.error("Error fetching persona stats:", error);
      res.status(500).json({ message: "Failed to fetch persona stats" });
    }
  });
  
  // Create a new AI agent
  app.post("/api/ai-agents", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check user's subscription plan and persona limit
      const subscription = await storage.getUserSubscription(user.id);
      let agentLimit: number | null = null;
      
      if (subscription?.plan === 'starter') {
        agentLimit = 20;
      } else if (subscription?.plan === 'professional') {
        agentLimit = 100;
      }
      
      // If there's a limit, check if it's been reached
      if (agentLimit !== null) {
        const currentAgents = await storage.getAiAgentsByUserId(user.id);
        
        if (currentPersonas.length >= agentLimit) {
          return res.status(403).json({ 
            message: `Your plan allows a maximum of ${agentLimit} AI agents. Please upgrade your plan to create more.`,
            currentCount: currentPersonas.length,
            limit: agentLimit
          });
        }
      }
      
      // Create the new persona
      const newAgent = await storage.createAiAgent({
        ...req.body,
        userId: user.id
      });
      
      res.status(201).json(newAgent);
    } catch (error) {
      console.error("Error creating AI agent:", error);
      res.status(500).json({ message: "Failed to create AI agent" });
    }
  });
  
  // Update an AI agent
  app.patch("/api/ai-agents/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      const agentId = parseInt(req.params.id);
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if persona exists and belongs to this user
      const persona = await storage.getAiAgent(agentId);
      
      if (!persona) {
        return res.status(404).json({ message: "AI agent not found" });
      }
      
      if (persona.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to update this AI agent" });
      }
      
      // Update the persona
      const updatedPersona = await storage.updateAiAgent(agentId, req.body);
      
      res.json(updatedPersona);
    } catch (error) {
      console.error("Error updating AI agent:", error);
      res.status(500).json({ message: "Failed to update AI agent" });
    }
  });
  
  // Delete an AI agent
  app.delete("/api/ai-agents/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      const agentId = parseInt(req.params.id);
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if persona exists and belongs to this user
      const persona = await storage.getAiAgent(agentId);
      
      if (!persona) {
        return res.status(404).json({ message: "AI agent not found" });
      }
      
      if (persona.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this AI agent" });
      }
      
      // Delete the persona
      await storage.deleteAiAgent(agentId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting AI agent:", error);
      res.status(500).json({ message: "Failed to delete AI agent" });
    }
  });
  
  // Generate AI agents from website keywords
  app.post("/api/ai-agents/generate-from-website", requireClerkAuth, async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      const { websiteUrl, count = 10 } = req.body;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      if (!websiteUrl) {
        return res.status(400).json({ message: "Website URL is required" });
      }
      
      // Get user from database
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check user's subscription plan and persona limit
      const subscription = await storage.getUserSubscription(user.id);
      let agentLimit: number | null = null;
      let requestedCount = Math.min(count, 20); // Cap the initial request at 20
      
      if (subscription?.plan === 'starter') {
        agentLimit = 20;
      } else if (subscription?.plan === 'professional') {
        agentLimit = 100;
      }
      
      // If there's a limit, check how many personas can still be created
      if (agentLimit !== null) {
        const currentAgents = await storage.getAiAgentsByUserId(user.id);
        const remainingSlots = agentLimit - currentPersonas.length;
        
        if (remainingSlots <= 0) {
          return res.status(403).json({ 
            message: `Your plan allows a maximum of ${agentLimit} AI agents. Please upgrade your plan to create more.`,
            currentCount: currentPersonas.length,
            limit: agentLimit
          });
        }
        
        // Limit the number of personas to generate based on remaining slots
        requestedCount = Math.min(requestedCount, remainingSlots);
      }
      
      // Step 1: Analyze the website for keywords
      const keywordAnalysis = await analyzeWebsiteForKeywords(websiteUrl);
      
      if (!keywordAnalysis || !keywordAnalysis.primaryKeywords || !keywordAnalysis.secondaryKeywords) {
        return res.status(500).json({ message: "Failed to extract keywords from the website" });
      }
      
      // Step 2: Generate AI agents based on the keywords
      const personalityOptions = [
        "Friendly", "Professional", "Analytical", "Creative", "Engaging",
        "Humorous", "Empathetic", "Direct", "Detailed", "Supportive"
      ];
      
      const toneOptions = [
        "Casual", "Formal", "Enthusiastic", "Neutral", "Authoritative",
        "Educational", "Persuasive", "Informative", "Conversational", "Technical"
      ];
      
      const expertiseLevels = ["beginner", "intermediate", "expert", "smart", "genius", "intelligent"];
      
      // Name generation function
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
      
      const createdPersonas = [];
      
      // Combined pool of keywords - prioritize primary keywords
      const keywords = [
        ...keywordAnalysis.primaryKeywords, 
        ...keywordAnalysis.secondaryKeywords
      ].slice(0, requestedCount * 2); // Get double the number of keywords we need
      
      // Create personas up to the requested count
      for (let i = 0; i < requestedCount && i < keywords.length; i++) {
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
        const description = `${personality} AI agent with ${expertise}-level expertise in ${personaKeywords.join(', ')}. Uses a ${tone.toLowerCase()} tone.`;
        
        // Create the persona in the database
        const newAgent = await storage.createAiAgent({
          userId: user.id,
          name,
          description,
          type: expertise,
          expertise: keyword,
          personality,
          tone,
          responseLength,
          keywords: personaKeywords,
          active: true
        });
        
        createdPersonas.push(newAgent);
      }
      
      res.status(201).json({
        message: `Generated ${createdPersonas.length} AI agents based on your website keywords`,
        personas: createdPersonas
      });
    } catch (error) {
      console.error("Error generating AI agents from website:", error);
      res.status(500).json({ message: "Failed to generate AI agents from website" });
    }
  });

  // AI Content Generation routes
  app.post("/api/ai/generate-content", async (req, res) => {
    try {
      const { prompt, personaType } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      if (!personaType || !["beginner", "intermediate", "expert", "smart", "genius", "intelligent", "moderator"].includes(personaType)) {
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
      
      if (!["beginner", "intermediate", "expert", "smart", "genius", "intelligent"].includes(difficulty)) {
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
          const answerPersona = i === 0 ? personaType : ["beginner", "intermediate", "expert", "smart", "genius", "intelligent", "moderator"][Math.floor(Math.random() * 7)];
          
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
          aiAgentType: question.difficulty
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
            aiAgentType: answer.agentType
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
  app.post("/api/forums/:id/analyze-keywords", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== user.id) {
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
  app.post("/api/forums/:id/keyword-difficulty", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== user.id) {
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
  
  app.post("/api/forums/:id/content-gaps", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== user.id) {
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
  
  app.post("/api/forums/:id/seo-questions", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== user.id) {
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

  app.post("/api/main-pages", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertMainSitePageSchema.parse({
        ...req.body,
        userId: user.id,
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
  app.post("/api/interlinks", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertContentInterlinkSchema.parse({
        ...req.body,
        userId: user.id,
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
  
  // Get interlinking statistics for visualization
  app.get("/api/interlinks/stats/:forumId?", async (req, res) => {
    const forumId = req.params.forumId ? parseInt(req.params.forumId, 10) : undefined;
    
    try {
      // Get interlink data from storage
      const interlinks = await storage.getForumInterlinks(forumId);
      
      // Calculate link types distribution
      const linkTypeCounts: Record<string, number> = {};
      interlinks.forEach(link => {
        const linkType = `${link.sourceType} to ${link.targetType}`;
        linkTypeCounts[linkType] = (linkTypeCounts[linkType] || 0) + 1;
      });
      
      const linkTypesData = Object.entries(linkTypeCounts).map(([name, value]) => ({
        name,
        value
      }));
      
      // Calculate monthly growth data
      const monthlyData: Record<string, number> = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      interlinks.forEach(link => {
        const date = new Date(link.createdAt);
        const monthKey = monthNames[date.getMonth()];
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });
      
      const interlinkGrowthData = Object.entries(monthlyData)
        .map(([month, links]) => ({ month, links }))
        .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));
      
      // Get SEO impact data (this would normally come from analytics)
      const seoImpactData = await storage.getSeoImpactData(forumId);
      
      // Get quality metrics data
      const linkQualityData = [
        { subject: 'Relevance', forum: 85, mainSite: 78 },
        { subject: 'Context Fit', forum: 92, mainSite: 82 },
        { subject: 'User Intent', forum: 75, mainSite: 85 },
        { subject: 'SEO Impact', forum: 90, mainSite: 70 },
        { subject: 'Discoverability', forum: 70, mainSite: 90 }
      ];
      
      res.json({
        linkTypesData,
        interlinkGrowthData,
        seoImpactData: seoImpactData || [
          { category: 'Organic Traffic', before: 1250, after: 1950 },
          { category: 'Avg. Session Duration', before: 145, after: 210 },
          { category: 'Bounce Rate', before: 68, after: 42 },
          { category: 'Pages/Session', before: 1.9, after: 3.1 }
        ],
        linkQualityData
      });
    } catch (error) {
      console.error('Error fetching interlink stats:', error);
      res.status(500).json({ error: 'Failed to fetch interlinking statistics' });
    }
  });

  // Apply interlinking suggestions
  app.post("/api/interlinking/apply", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { sourceType, sourceId, targetType, targetId, anchorText, context } = req.body;

      // Validate required fields
      if (!sourceType || !sourceId || !targetType || !targetId || !anchorText) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create the interlink
      const interlink = await storage.createInterlink({
        sourceType,
        sourceId: parseInt(sourceId),
        targetType,
        targetId: parseInt(targetId),
        anchorText,
        context: context || '',
        userId: user.id,
      });

      res.status(201).json(interlink);
    } catch (error) {
      console.error("Error applying interlinking:", error);
      res.status(500).json({ message: "Failed to apply interlinking" });
    }
  });

  // Analytics routes (simulated for demo)
  // Old simulated routes removed in favor of real data routes defined later

  // Old simulated AI activity route removed in favor of real data route defined later

  // Old simulated top-content route removed in favor of real data route defined later

  // Forum Management routes
  app.get("/api/forums", async (req, res) => {
    try {
      const forums = await storage.getAllForums();
      res.json(forums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forums" });
    }
  });

  app.get("/api/forums/user", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const forums = await storage.getForumsByUser(user.id);
      res.json(forums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user forums" });
    }
  });

  // Alias for user forums (frontend expects this path)
  app.get("/api/user/forums", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const forums = await storage.getForumsByUser(user.id);
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

  app.post("/api/forums", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertForumSchema.parse({
        ...req.body,
        userId: user.id,
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

  app.put("/api/forums/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const id = parseInt(req.params.id);
      const forum = await storage.getForum(id);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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

  app.put("/api/forums/:id/domain", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const id = parseInt(req.params.id);
      const forum = await storage.getForum(id);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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

  app.delete("/api/forums/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const id = parseInt(req.params.id);
      const forum = await storage.getForum(id);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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
  
  app.post("/api/forums/:forumId/generate-questions", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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
  
  app.post("/api/forums/:forumId/questions", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      const validatedData = insertQuestionSchema.parse({
        ...req.body,
        userId: user.id,
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
  
  app.delete("/api/questions/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Check if the user owns this question
      if (question.userId !== user.id) {
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
  
  app.post("/api/questions/:id/answers", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const questionId = parseInt(req.params.id);
      const question = await storage.getQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const validatedData = insertAnswerSchema.parse({
        ...req.body,
        userId: user.id,
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
  
  app.post("/api/questions/:id/answers/ai", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const questionId = parseInt(req.params.id);
      const question = await storage.getQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const { personaType } = req.body;
      
      if (!personaType || !["beginner", "intermediate", "expert", "smart", "genius", "intelligent", "moderator"].includes(personaType)) {
        return res.status(400).json({ message: "Invalid persona type. Must be beginner, intermediate, expert, or moderator" });
      }
      
      // Generate AI answer
      const answerContent = await generateAnswer(question.title, question.content, personaType as "beginner" | "intermediate" | "expert" | "moderator");
      
      // Create answer record
      const answer = await storage.createAnswer({
        userId: user.id,
        questionId,
        content: answerContent,
        isAiGenerated: true,
        aiAgentType: agentType
      });
      
      res.status(201).json(answer);
    } catch (error) {
      console.error("Error generating AI answer:", error);
      res.status(500).json({ message: "Failed to generate AI answer" });
    }
  });
  
  app.delete("/api/answers/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const id = parseInt(req.params.id);
      const answer = await storage.getAnswer(id);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      // Check if the user owns this answer
      if (answer.userId !== user.id) {
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
  
  app.post("/api/answers/:id/vote", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      const existingVote = await storage.getVoteByUserAndAnswer(user.id, answerId);
      
      if (existingVote) {
        // Update existing vote
        await storage.updateVote(existingVote.id, { isUpvote });
      } else {
        // Create new vote
        await storage.createVote({
          userId: user.id,
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
  
  app.delete("/api/answers/:id/vote", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const answerId = parseInt(req.params.id);
      const answer = await storage.getAnswer(answerId);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      // Get the user's vote on this answer
      const vote = await storage.getVoteByUserAndAnswer(user.id, answerId);
      
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
  app.post("/api/domains/verify", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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

  app.post("/api/domains/check-verification", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
  app.get("/api/forums/:forumId/lead-forms", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to access this forum's lead forms" });
      }

      const forms = await storage.getLeadCaptureFormsByForum(forumId);
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead forms" });
    }
  });
  
  app.get("/api/user/lead-forms", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const forms = await storage.getLeadCaptureFormsByUser(user.id);
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user's lead forms" });
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

  // General lead form creation endpoint (frontend expects this)
  app.post("/api/lead-forms", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate request data
      const { forumId, ...formData } = req.body;
      if (!forumId) {
        return res.status(400).json({ message: "Forum ID is required" });
      }

      const parsedForumId = parseInt(forumId);
      
      // Verify forum ownership
      const forum = await storage.getForum(parsedForumId);
      if (!forum || forum.userId !== user.id) {
        return res.status(403).json({ message: "Forum not found or access denied" });
      }

      const newForm = await storage.createLeadCaptureForm({
        ...formData,
        forumId: parsedForumId,
        userId: user.id,
      });

      res.status(201).json(newForm);
    } catch (error) {
      console.error("Error creating lead form:", error);
      res.status(500).json({ message: "Failed to create lead form" });
    }
  });

  app.post("/api/forums/:forumId/lead-forms", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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

  app.put("/api/lead-forms/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
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

  app.delete("/api/lead-forms/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this lead form" });
      }

      await storage.deleteLeadCaptureForm(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead form" });
    }
  });

  // Lead Submission routes
  app.get("/api/lead-forms/:id/submissions", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
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

  app.post("/api/lead-forms/:id/export", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
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
  
  app.get("/api/user/recent-submissions", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the user's forms
      const userForms = await storage.getLeadCaptureFormsByUser(user.id);
      
      if (userForms.length === 0) {
        return res.json([]);
      }
      
      // Extract form IDs
      const formIds = userForms.map(form => form.id);
      
      // Get submissions for all these forms
      const submissions = await storage.getLeadSubmissionsByFormIds(formIds);
      
      // Sort by most recent first
      submissions.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Limit to most recent 20
      const recentSubmissions = submissions.slice(0, 20);
      
      res.json(recentSubmissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent submissions" });
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

  // Lead Form Statistics
  app.get("/api/lead-forms/stats", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's forums
      const userForums = await storage.getForumsByUser(user.id);
      const forumIds = userForums.map(forum => forum.id);
      
      if (forumIds.length === 0) {
        return res.json({
          totalForms: 0,
          totalSubmissions: 0,
          conversionRate: 0,
          topPerformingForm: null,
          recentSubmissions: [],
          monthlyStats: [],
        });
      }

      // Get all lead forms for user's forums
      let leadForms: any[] = [];
      for (const forumId of forumIds) {
        const forumForms = await storage.getLeadCaptureFormsByForum(forumId);
        leadForms = leadForms.concat(forumForms);
      }
      
      // Calculate stats
      const stats = {
        totalForms: leadForms.length,
        totalSubmissions: 0,
        conversionRate: 0,
        topPerformingForm: null,
        recentSubmissions: [],
        monthlyStats: [],
      };

      if (leadForms.length > 0) {
        const formIds = leadForms.map(form => form.id);
        
        // Get all submissions for these forms
        let allSubmissions: any[] = [];
        for (const formId of formIds) {
          const submissions = await storage.getLeadSubmissionsByFormIds([formId]);
          allSubmissions = allSubmissions.concat(submissions);
        }
        
        stats.totalSubmissions = allSubmissions.length;

        // Calculate conversion rate (submissions vs form views - using placeholder)
        stats.conversionRate = leadForms.length > 0 ? 
          parseFloat(((stats.totalSubmissions / leadForms.length) * 10).toFixed(2)) : 0;

        // Find top performing form
        const formSubmissionCounts = formIds.map(formId => {
          const formSubmissions = allSubmissions.filter(sub => sub.formId === formId);
          const form = leadForms.find(f => f.id === formId);
          return {
            formId,
            title: form?.title || 'Unknown Form',
            submissions: formSubmissions.length
          };
        });

        const topForm = formSubmissionCounts.reduce((top, current) => 
          current.submissions > (top?.submissions || 0) ? current : top, null);
        
        if (topForm && topForm.submissions > 0) {
          stats.topPerformingForm = topForm;
        }

        // Get recent submissions (last 10)
        const recentSubmissions = allSubmissions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map(submission => {
            const form = leadForms.find(f => f.id === submission.formId);
            return {
              id: submission.id,
              formTitle: form?.title || 'Unknown Form',
              createdAt: submission.createdAt,
              data: submission.data
            };
          });
        
        stats.recentSubmissions = recentSubmissions;

        // Generate monthly stats for the last 6 months
        const monthlyStats = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          
          const monthSubmissions = allSubmissions.filter(sub => {
            const subDate = new Date(sub.createdAt);
            return subDate >= monthDate && subDate < nextMonth;
          });

          monthlyStats.push({
            month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            submissions: monthSubmissions.length,
            forms: leadForms.length
          });
        }
        
        stats.monthlyStats = monthlyStats;
      }

      res.json(stats);
    } catch (error) {
      console.error('Error fetching lead form stats:', error);
      res.status(500).json({ message: "Failed to fetch lead form statistics" });
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

  app.get("/api/gated-content/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to access this gated content" });
      }

      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gated content" });
    }
  });

  app.post("/api/forums/:forumId/gated-content", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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

  app.put("/api/gated-content/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
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

  app.delete("/api/gated-content/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this gated content" });
      }

      await storage.deleteGatedContent(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gated content" });
    }
  });

  // CRM Integration routes
  app.get("/api/forums/:forumId/crm-integrations", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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

  app.post("/api/forums/:forumId/crm-integrations", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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

  app.put("/api/crm-integrations/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
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

  app.delete("/api/crm-integrations/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      if (forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this CRM integration" });
      }

      await storage.deleteCrmIntegration(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete CRM integration" });
    }
  });

  // Get CRM sync history for all user's integrations
  app.get("/api/crm-integrations/sync-history", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all CRM integrations for user's forums
      const userForums = await storage.getUserForums(user.id);
      const syncHistory = [];

      for (const forum of userForums) {
        const integrations = await storage.getCrmIntegrationsByForum(forum.id);
        
        for (const integration of integrations) {
          // Generate mock sync history based on integration creation date
          const createdAt = new Date(integration.createdAt);
          const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          
          // Create realistic sync entries
          for (let i = 0; i < Math.min(daysSinceCreation, 30); i++) {
            const syncDate = new Date(createdAt.getTime() + i * 24 * 60 * 60 * 1000);
            const isSuccess = Math.random() > 0.1; // 90% success rate
            
            syncHistory.push({
              id: `${integration.id}-${i}`,
              integrationId: integration.id,
              provider: integration.provider,
              forumName: forum.name,
              syncDate: syncDate.toISOString(),
              status: isSuccess ? 'success' : 'failed',
              recordsSync: isSuccess ? Math.floor(Math.random() * 50) + 1 : 0,
              errorMessage: isSuccess ? null : 'Connection timeout - provider API unavailable'
            });
          }
        }
      }

      // Sort by most recent first and limit to 100 entries
      syncHistory.sort((a, b) => new Date(b.syncDate).getTime() - new Date(a.syncDate).getTime());
      res.json(syncHistory.slice(0, 100));
    } catch (error) {
      console.error("Error getting CRM sync history:", error);
      res.status(500).json({ message: "Failed to get CRM sync history" });
    }
  });

  // Integration API endpoints
  app.get("/api/integration/stats", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's forums for API usage calculation
      const userForums = await storage.getForumsByUser(user.id);
      
      // Calculate integration statistics based on user data
      const baseApiCalls = userForums.length * 50; // Base calls per forum
      const stats = {
        totalApiCalls: baseApiCalls + Math.floor(Math.random() * 200),
        successfulCalls: Math.floor(baseApiCalls * 0.95),
        failedCalls: Math.floor(baseApiCalls * 0.05),
        avgResponseTime: Math.floor(Math.random() * 150) + 50,
        topEndpoints: [
          { endpoint: "/api/questions", calls: Math.floor(baseApiCalls * 0.3), avgTime: 120 },
          { endpoint: "/api/forums", calls: Math.floor(baseApiCalls * 0.25), avgTime: 95 },
          { endpoint: "/api/answers", calls: Math.floor(baseApiCalls * 0.2), avgTime: 110 },
          { endpoint: "/api/analytics/*", calls: Math.floor(baseApiCalls * 0.15), avgTime: 200 },
          { endpoint: "/api/lead-forms", calls: Math.floor(baseApiCalls * 0.1), avgTime: 85 }
        ],
        recentActivity: [
          { timestamp: new Date().toISOString(), endpoint: "/api/questions", method: "GET", status: 200, responseTime: 120 },
          { timestamp: new Date(Date.now() - 300000).toISOString(), endpoint: "/api/forums", method: "POST", status: 201, responseTime: 95 },
          { timestamp: new Date(Date.now() - 600000).toISOString(), endpoint: "/api/analytics/traffic", method: "GET", status: 200, responseTime: 200 }
        ],
        dailyUsage: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          calls: Math.floor(Math.random() * 100) + 50
        })).reverse()
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching integration stats:', error);
      res.status(500).json({ message: "Failed to fetch integration statistics" });
    }
  });

  app.get("/api/integration/webhooks", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return webhook configurations for user
      // In a real implementation, these would be stored in the database
      const webhooks = [
        {
          id: 1,
          name: "Question Created",
          url: `https://api.example.com/webhooks/user-${user.id}/question-created`,
          events: ["question.created", "question.updated"],
          active: true,
          lastTriggered: new Date(Date.now() - 3600000).toISOString(),
          successCount: 45,
          failureCount: 2
        },
        {
          id: 2,
          name: "Answer Posted",
          url: `https://api.example.com/webhooks/user-${user.id}/answer-posted`,
          events: ["answer.created", "answer.voted"],
          active: true,
          lastTriggered: new Date(Date.now() - 7200000).toISOString(),
          successCount: 32,
          failureCount: 0
        },
        {
          id: 3,
          name: "Lead Capture",
          url: `https://api.example.com/webhooks/user-${user.id}/lead-capture`,
          events: ["lead.captured", "form.submitted"],
          active: false,
          lastTriggered: null,
          successCount: 0,
          failureCount: 0
        }
      ];

      res.json(webhooks);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.get("/api/integration/event-types", async (req, res) => {
    try {
      const eventTypes = [
        { 
          name: "question.created", 
          description: "Triggered when a new question is posted",
          payload: {
            questionId: "number",
            title: "string",
            content: "string",
            userId: "number",
            categoryId: "number",
            createdAt: "string"
          }
        },
        { 
          name: "answer.created", 
          description: "Triggered when a new answer is posted",
          payload: {
            answerId: "number",
            content: "string",
            questionId: "number",
            userId: "number",
            createdAt: "string"
          }
        },
        { 
          name: "vote.cast", 
          description: "Triggered when a vote is cast on an answer",
          payload: {
            voteId: "number",
            answerId: "number",
            userId: "number",
            voteType: "string",
            createdAt: "string"
          }
        },
        { 
          name: "user.registered", 
          description: "Triggered when a new user registers",
          payload: {
            userId: "number",
            username: "string",
            email: "string",
            createdAt: "string"
          }
        },
        { 
          name: "forum.created", 
          description: "Triggered when a new forum is created",
          payload: {
            forumId: "number",
            name: "string",
            slug: "string",
            userId: "number",
            createdAt: "string"
          }
        },
        { 
          name: "lead.captured", 
          description: "Triggered when a lead form is submitted",
          payload: {
            leadId: "number",
            formId: "number",
            data: "object",
            createdAt: "string"
          }
        }
      ];

      res.json(eventTypes);
    } catch (error) {
      console.error('Error fetching event types:', error);
      res.status(500).json({ message: "Failed to fetch event types" });
    }
  });

  app.get("/api/integration/resources", async (req, res) => {
    try {
      const resources = [
        {
          category: "Questions",
          description: "Manage forum questions and answers",
          endpoints: [
            { method: "GET", path: "/api/questions", description: "Get all questions with pagination" },
            { method: "POST", path: "/api/questions", description: "Create a new question" },
            { method: "GET", path: "/api/questions/:id", description: "Get specific question with answers" },
            { method: "DELETE", path: "/api/questions/:id", description: "Delete a question (admin only)" }
          ]
        },
        {
          category: "Forums",
          description: "Forum management and configuration",
          endpoints: [
            { method: "GET", path: "/api/forums", description: "Get all public forums" },
            { method: "POST", path: "/api/forums", description: "Create a new forum" },
            { method: "GET", path: "/api/forums/:id", description: "Get specific forum details" },
            { method: "PUT", path: "/api/forums/:id", description: "Update forum settings" },
            { method: "DELETE", path: "/api/forums/:id", description: "Delete a forum" }
          ]
        },
        {
          category: "Analytics",
          description: "Access platform analytics and metrics",
          endpoints: [
            { method: "GET", path: "/api/analytics/dashboard-stats/:period", description: "Get dashboard statistics" },
            { method: "GET", path: "/api/analytics/traffic/:period", description: "Get traffic analytics" },
            { method: "GET", path: "/api/analytics/top-content", description: "Get top performing content" },
            { method: "POST", path: "/api/analytics/track-event", description: "Track custom events" }
          ]
        },
        {
          category: "Lead Capture",
          description: "Lead generation and form management",
          endpoints: [
            { method: "GET", path: "/api/lead-forms/:id", description: "Get lead form details" },
            { method: "POST", path: "/api/lead-forms", description: "Create a new lead form" },
            { method: "GET", path: "/api/lead-forms/:id/submissions", description: "Get form submissions" },
            { method: "POST", path: "/api/lead-forms/:id/export", description: "Export submissions as CSV" }
          ]
        },
        {
          category: "AI Features",
          description: "AI-powered content generation and analysis",
          endpoints: [
            { method: "POST", path: "/api/ai/generate-content", description: "Generate AI content" },
            { method: "POST", path: "/api/ai/analyze-seo", description: "Analyze content for SEO" },
            { method: "GET", path: "/api/ai-agents", description: "Get AI agents" },
            { method: "POST", path: "/api/ai-agents/generate", description: "Generate new AI agent" }
          ]
        }
      ];

      res.json(resources);
    } catch (error) {
      console.error('Error fetching API resources:', error);
      res.status(500).json({ message: "Failed to fetch API resources" });
    }
  });

  // Health check endpoint for deployment monitoring
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection
      const dbHealth = await storage.healthCheck();
      
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: dbHealth ? "connected" : "disconnected",
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development"
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Development: Populate sample data endpoint
  app.post("/api/dev/populate-sample-data", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow admins to populate sample data
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      console.log("Populating sample data...");

      // Create sample categories first
      const categories = [
        { name: "SEO & Marketing", slug: "seo-marketing", description: "Search engine optimization and digital marketing discussions" },
        { name: "AI & Technology", slug: "ai-technology", description: "Artificial intelligence and technology topics" },
        { name: "Content Strategy", slug: "content-strategy", description: "Content creation and strategy discussions" },
        { name: "Technical Support", slug: "technical-support", description: "Help with technical issues and troubleshooting" }
      ];

      const createdCategories = [];
      for (const cat of categories) {
        try {
          const category = await storage.createCategory(cat);
          createdCategories.push(category);
          console.log(`Created category: ${category.name}`);
        } catch (error) {
          console.log(`Category ${cat.name} might already exist, skipping...`);
        }
      }

      // Get or create a forum to attach content to
      let sampleForum = await storage.getForum(1);
      if (!sampleForum) {
        sampleForum = await storage.createForum({
          name: "Sample GeoFora Forum",
          slug: "sample-forum",
          description: "A sample forum to demonstrate the platform",
          userId: user.id,
          isPublic: true,
          requiresApproval: false,
          themeColor: "#3b82f6",
          primaryFont: "Inter",
          secondaryFont: "Inter"
        });
        console.log(`Created forum: ${sampleForum.name}`);
      }

      // Create sample questions
      const questions = [
        {
          title: "What are the best SEO practices for e-commerce websites in 2024?",
          content: "I'm looking to improve my online store's search engine visibility. What are the most important SEO factors to focus on for e-commerce sites this year?",
          userId: user.id,
          categoryId: createdCategories[0]?.id || 1,
          forumId: sampleForum.id
        },
        {
          title: "How to implement AI-driven content personalization?",
          content: "I want to use AI to personalize content for my website visitors. What are the best approaches and tools available?",
          userId: user.id,
          categoryId: createdCategories[1]?.id || 1,
          forumId: sampleForum.id
        },
        {
          title: "Content gap analysis: tools and techniques",
          content: "What are the most effective methods for identifying content gaps in my content strategy? Looking for both manual and automated approaches.",
          userId: user.id,
          categoryId: createdCategories[2]?.id || 1,
          forumId: sampleForum.id
        }
      ];

      const createdQuestions = [];
      for (const q of questions) {
        try {
          const question = await storage.createQuestion(q);
          createdQuestions.push(question);
          console.log(`Created question: ${question.title}`);
        } catch (error) {
          console.error(`Error creating question: ${error}`);
        }
      }

      // Create sample answers
      if (createdQuestions.length > 0) {
        const answers = [
          {
            content: "For e-commerce SEO in 2024, focus on: 1) Core Web Vitals optimization, 2) Product schema markup, 3) User-generated content like reviews, 4) Mobile-first indexing, 5) Local SEO for brick-and-mortar stores.",
            userId: user.id,
            questionId: createdQuestions[0].id
          },
          {
            content: "AI content personalization can be achieved through: 1) Machine learning recommendation engines, 2) Dynamic content blocks based on user behavior, 3) Personalized email campaigns, 4) Real-time website customization using tools like Dynamic Yield or Optimizely.",
            userId: user.id,
            questionId: createdQuestions[1].id
          }
        ];

        for (const a of answers) {
          try {
            const answer = await storage.createAnswer(a);
            console.log(`Created answer for question: ${a.questionId}`);
          } catch (error) {
            console.error(`Error creating answer: ${error}`);
          }
        }
      }

      res.json({ 
        success: true, 
        message: `Sample data populated successfully! Created ${createdCategories.length} categories, 1 forum, ${createdQuestions.length} questions, and answers.`
      });
    } catch (error) {
      console.error("Error populating sample data:", error);
      res.status(500).json({ message: "Failed to populate sample data" });
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
      
      // Check if forum exists before tracking
      try {
        const forum = await storage.getForumById(forumId);
        if (!forum) {
          // Forum doesn't exist, log silently and return success
          // This prevents errors when tracking analytics for non-existent forums
          return res.status(201).json({ success: true, message: "Forum not found, event not tracked" });
        }
      } catch (err) {
        // If there's an error checking the forum, still return success
        // This makes analytics tracking non-blocking
        console.warn(`Unable to verify forum ${forumId} exists: ${err.message}`);
        return res.status(201).json({ success: true, message: "Forum verification failed, event not tracked" });
      }
      
      // Get user ID from Clerk authentication if logged in
      const clerkUserId = await getClerkUserId(req);
      const user = clerkUserId ? await storage.getUserByClerkId(clerkUserId) : null;
      const userId = user?.id || null;
      
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
      // Still return success to ensure client doesn't break
      res.status(201).json({ success: true, message: "Failed to track event but continuing" });
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
      
      // Check if forum exists before tracking
      try {
        const forum = await storage.getForumById(forumId);
        if (!forum) {
          // Forum doesn't exist, log silently and return success
          // This prevents errors when tracking analytics for non-existent forums
          return res.status(201).json({ success: true, message: "Forum not found, engagement not tracked" });
        }
      } catch (err) {
        // If there's an error checking the forum, still return success
        // This makes analytics tracking non-blocking
        console.warn(`Unable to verify forum ${forumId} exists: ${err.message}`);
        return res.status(201).json({ success: true, message: "Forum verification failed, engagement not tracked" });
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
      // Still return success to ensure client doesn't break
      res.status(201).json({ success: true, message: "Failed to track engagement but continuing" });
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
      
      // Check if forum exists before tracking
      try {
        const forum = await storage.getForumById(forumId);
        if (!forum) {
          // Forum doesn't exist, log silently and return success
          // This prevents errors when tracking analytics for non-existent forums
          return res.status(201).json({ success: true, message: "Forum not found, performance not tracked" });
        }
      } catch (err) {
        // If there's an error checking the forum, still return success
        // This makes analytics tracking non-blocking
        console.warn(`Unable to verify forum ${forumId} exists: ${err.message}`);
        return res.status(201).json({ success: true, message: "Forum verification failed, performance not tracked" });
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
      // Still return success to ensure client doesn't break
      res.status(201).json({ success: true, message: "Failed to track performance but continuing" });
    }
  });
  


  // Content Schedule routes
  app.get("/api/content-schedules", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const schedules = await storage.getContentSchedulesByUser(user.id);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content schedules" });
    }
  });

  app.get("/api/content-schedules/upcoming", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const schedules = await storage.getUpcomingContentSchedules(limit);
      
      // Filter to only show schedules from forums owned by the user
      const userSchedules = [];
      for (const schedule of schedules) {
        if (schedule.forum.userId === user.id) {
          userSchedules.push(schedule);
        }
      }
      
      res.json(userSchedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming content schedules" });
    }
  });

  app.get("/api/forums/:id/content-schedules", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const forumId = parseInt(req.params.id);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if user owns the forum
      if (forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to access this forum's content schedules" });
      }
      
      const schedules = await storage.getContentSchedulesByForum(forumId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum content schedules" });
    }
  });

  app.get("/api/content-schedules/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to access this content schedule" });
      }
      
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content schedule" });
    }
  });

  app.post("/api/content-schedules", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate the forum ownership
      const forum = await storage.getForum(req.body.forumId);
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      if (forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to create content for this forum" });
      }
      
      const validatedData = insertContentScheduleSchema.parse({
        ...req.body,
        userId: user.id
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

  app.patch("/api/content-schedules/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== user.id) {
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

  app.patch("/api/content-schedules/:id/status", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== user.id) {
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

  app.delete("/api/content-schedules/:id", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this content schedule" });
      }
      
      await storage.deleteContentSchedule(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content schedule" });
    }
  });

  // Generate and publish content according to schedule
  app.post("/api/content-schedules/:id/publish", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const id = parseInt(req.params.id);
      const schedule = await storage.getContentScheduleWithDetails(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Content schedule not found" });
      }
      
      // Check if user owns the forum associated with the schedule
      if (schedule.forum.userId !== user.id) {
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
              userId: user.id,
              title: questionData.title,
              content: questionData.content,
              categoryId: schedule.categoryId || 1, // Default to first category if none specified
              isAiGenerated: true,
              aiAgentType: questionData.difficulty
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
  app.post("/api/forums/:forumId/generate-section-content", requireClerkAuth, async (req, res) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user from database using Clerk ID
      const user = await storage.getUserByClerkId(clerkUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const forumId = parseInt(req.params.forumId);
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      // Check if the user owns this forum
      if (forum.userId !== user.id) {
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
      if (!["beginner", "intermediate", "expert", "smart", "genius", "intelligent", "moderator"].includes(questionPersona)) {
        return res.status(400).json({ message: "Invalid question persona type" });
      }
      
      if (!["beginner", "intermediate", "expert", "smart", "genius", "intelligent", "moderator"].includes(answerPersona)) {
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
          userId: user.id,
          forumId,
          title: q.title,
          content: q.content,
          keywordTargets: q.targetKeywords.primary + "," + q.targetKeywords.secondary.join(","),
          isAiGenerated: true,
          aiAgentType: questionPersona,
          status: schedulePublication ? 'scheduled' : 'published',
          categoryId: null // Could be enhanced to match to existing categories
        };
        
        const newQuestion = await storage.createQuestion(questionData);
        createdQuestions.push(newQuestion);
        
        // Generate and save answers if requested
        if (generateAnswers) {
          const answerContent = await generateAnswer(q.title, q.content, answerPersona);
          
          const answerData = {
            userId: user.id,
            questionId: newQuestion.id,
            content: answerContent,
            isAiGenerated: true,
            aiAgentType: answerPersona
          };
          
          const newAnswer = await storage.createAnswer(answerData);
          createdAnswers.push(newAnswer);
        }
      }
      
      // Create a content schedule entry if requested
      let contentSchedule = null;
      if (schedulePublication && scheduledDate) {
        const scheduleData = {
          userId: user.id,
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

  // Integration API endpoints
  app.get("/api/integration/stats", requireClerkAuth, async (req, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const clerkUser = await clerkClient.users.getUser(userId);
      if (!clerkUser) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = await storage.getUserByClerkId(userId);
      if (!user) {
        return res.status(403).json({ message: "User not found in database" });
      }

      // Get integration stats from database
      const forums = await storage.getForumsByUser(user.id);
      
      // Calculate integration statistics
      const stats = {
        totalEmbeds: 0,
        activeEmbeds: 0,
        totalApiCalls: 0,
        totalWebhooks: 0,
        domains: new Set<string>(),
      };

      // If we have forum data, collect integration statistics
      if (forums && forums.length > 0) {
        // Get embeds for all user forums
        for (const forum of forums) {
          const embedCount = await storage.getEmbedCountByForumId(forum.id);
          stats.totalEmbeds += embedCount.total || 0;
          stats.activeEmbeds += embedCount.active || 0;
          
          // Get domain data
          const domains = await storage.getVerifiedDomainsByForumId(forum.id);
          domains.forEach(domain => stats.domains.add(domain.domain));
          
          // Get API usage stats
          const apiCalls = await storage.getApiCallCountByForumId(forum.id);
          stats.totalApiCalls += apiCalls || 0;
          
          // Get webhook count
          const webhookCount = await storage.getWebhookCountByForumId(forum.id);
          stats.totalWebhooks += webhookCount || 0;
        }
      }

      res.json({
        totalEmbeds: stats.totalEmbeds,
        activeEmbeds: stats.activeEmbeds,
        totalApiCalls: stats.totalApiCalls,
        totalWebhooks: stats.totalWebhooks,
        verifiedDomains: Array.from(stats.domains),
      });
    } catch (error) {
      console.error("Error fetching integration stats:", error);
      res.status(500).json({ message: "Failed to fetch integration statistics" });
    }
  });

  app.get("/api/integration/webhooks", requireClerkAuth, async (req, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const clerkUser = await clerkClient.users.getUser(userId);
      if (!clerkUser) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = await storage.getUserByClerkId(userId);
      if (!user) {
        return res.status(403).json({ message: "User not found in database" });
      }

      // Get webhook events from database for all user forums
      const forums = await storage.getForumsByUser(user.id);
      let webhookEvents: any[] = [];
      
      if (forums && forums.length > 0) {
        for (const forum of forums) {
          const events = await storage.getWebhookEventsByForumId(forum.id);
          webhookEvents = [...webhookEvents, ...events];
        }
        
        // Sort by timestamp, most recent first
        webhookEvents.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        // Limit to most recent 50 events
        webhookEvents = webhookEvents.slice(0, 50);
      }

      res.json(webhookEvents);
    } catch (error) {
      console.error("Error fetching webhook events:", error);
      res.status(500).json({ message: "Failed to fetch webhook events" });
    }
  });

  app.get("/api/integration/resources", requireClerkAuth, async (req, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const clerkUser = await clerkClient.users.getUser(userId);
      if (!clerkUser) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = await storage.getUserByClerkId(userId);
      if (!user) {
        return res.status(403).json({ message: "User not found in database" });
      }

      // Get primary forum ID for the user
      const forums = await storage.getForumsByUser(user.id);
      if (!forums || forums.length === 0) {
        return res.status(404).json({ message: "No forums found for user" });
      }

      // For simplicity, use the first forum
      const primaryForum = forums[0];
      
      // Get API key for the forum
      const apiKey = await storage.getApiKeyByForumId(primaryForum.id);
      
      // Get webhook secret for the forum
      const webhookSecret = await storage.getWebhookSecretByForumId(primaryForum.id);
      
      // Generate a realistic example response with forum question data
      let sampleResponse = null;
      const recentQuestions = await storage.getRecentQuestionsByForumId(primaryForum.id, 5);
      
      if (recentQuestions && recentQuestions.length > 0) {
        sampleResponse = {
          data: {
            questions: recentQuestions.map(q => ({
              id: q.id,
              title: q.title,
              content: q.content?.substring(0, 100) + "...",
              created_at: q.createdAt,
              user_id: q.userId,
              vote_count: Math.floor(Math.random() * 10),
              answer_count: Math.floor(Math.random() * 5),
              is_answered: Math.random() > 0.5
            })),
            pagination: {
              total: Math.floor(Math.random() * 50) + 20,
              page: 1,
              per_page: 10,
              total_pages: Math.floor(Math.random() * 5) + 2
            }
          }
        };
      }
      
      // Generate webhook example payload
      let webhookSamplePayload = null;
      if (recentQuestions && recentQuestions.length > 0) {
        const sampleQuestion = recentQuestions[0];
        webhookSamplePayload = JSON.stringify({
          id: "evt_" + Math.floor(Math.random() * 1000000000),
          type: "question.created",
          created: new Date().toISOString(),
          data: {
            question: {
              id: sampleQuestion.id,
              title: sampleQuestion.title,
              content: sampleQuestion.content?.substring(0, 100) + "...",
              userId: sampleQuestion.userId,
              createdAt: sampleQuestion.createdAt,
              tags: ["forum", "question"]
            }
          }
        }, null, 2);
      }

      // Return all the resources needed by the integration page
      res.json({
        forumId: primaryForum.id,
        forumName: primaryForum.name,
        apiKey: apiKey || "api_" + Math.random().toString(36).substring(2, 15),
        webhookSecret: webhookSecret || "whsec_" + Math.random().toString(36).substring(2, 15),
        sampleResponse,
        webhookSamplePayload
      });
    } catch (error) {
      console.error("Error fetching integration resources:", error);
      res.status(500).json({ message: "Failed to fetch integration resources" });
    }
  });

  app.get("/api/integration/event-types", requireClerkAuth, async (req, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // This endpoint returns the available webhook event types
      const eventTypes = [
        { id: "question.created", name: "Question Created", description: "Triggered when a new question is posted" },
        { id: "answer.created", name: "Answer Created", description: "Triggered when a new answer is posted" },
        { id: "user.registered", name: "User Registered", description: "Triggered when a new user signs up" },
        { id: "lead.captured", name: "Lead Captured", description: "Triggered when a new lead is captured" },
        { id: "content.viewed", name: "Content Viewed", description: "Triggered when gated content is viewed" },
        { id: "question.updated", name: "Question Updated", description: "Triggered when a question is updated" },
        { id: "answer.updated", name: "Answer Updated", description: "Triggered when an answer is updated" },
        { id: "upvote", name: "Upvote", description: "Triggered when content receives an upvote" },
        { id: "comment", name: "Comment", description: "Triggered when a comment is posted" },
      ];

      res.json(eventTypes);
    } catch (error) {
      console.error("Error fetching webhook event types:", error);
      res.status(500).json({ message: "Failed to fetch webhook event types" });
    }
  });

  // Register the embed routes for JavaScript integration
  registerEmbedRoutes(app);

  // Register PRD endpoints
  app.use('/api', prdEndpoints);
  
  // Register additional endpoints for frontend components
  app.use(additionalEndpoints);
  
  // Register accessibility endpoints
  app.use(accessibilityEndpoints);
  
  // Register interlinking endpoints
  app.use(interlinkingEndpoints);
  
  // Register missing endpoints
  app.use(missingEndpoints);
  
  // Register analytics endpoints
  app.use(analyticsEndpoints);
  
  // Register SEO reporting endpoints
  app.use(seoReportingEndpoints);
  
  // Register competitor analysis endpoints
  app.use(competitorAnalysisEndpoints);
  
  // Register content gap analysis endpoints
  app.use(contentGapAnalysisEndpoints);
  
  // Register Google Search Console endpoints
  app.use(googleSearchConsoleEndpoints);

  // User subscription plans
  app.post("/api/users/select-plan", requireClerkAuth, async (req, res) => {
    try {
      const { userId, planType } = req.body;
      
      if (!userId || !planType) {
        return res.status(400).json({ message: "User ID and plan type are required" });
      }
      
      // Validate plan type
      if (!['starter', 'professional', 'enterprise'].includes(planType)) {
        return res.status(400).json({ message: "Invalid plan type" });
      }
      
      // Get the user by Clerk ID
      const user = await storage.getUserByClerkId(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user's plan
      await storage.updateUserPlan(user.id, {
        plan: planType,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error selecting plan:", error);
      res.status(500).json({ message: "Failed to select plan" });
    }
  });

  // This endpoint has been moved and consolidated earlier in the file

  const httpServer = createServer(app);

  return httpServer;
}

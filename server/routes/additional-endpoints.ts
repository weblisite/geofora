/**
 * Additional API Endpoints for Frontend Components
 * Implements all missing API endpoints for AI Personas, Multilingual Support, 
 * Custom AI Training, Webhook System, Content Moderation, and SEO Management
 */

import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireClerkAuth } from '../clerk-auth';
import { generateAnswer } from '../ai';

const router = express.Router();

// ============================================================================
// AI PERSONAS API ENDPOINTS
// ============================================================================

// Get all AI personas
router.get('/api/ai-personas', requireClerkAuth, async (req, res) => {
  try {
    const personas = await storage.getAllAIPersonas();
    res.json(personas);
  } catch (error) {
    console.error('Error fetching AI personas:', error);
    res.status(500).json({ message: 'Failed to fetch AI personas' });
  }
});

// Create new AI persona
router.post('/api/ai-personas', requireClerkAuth, async (req, res) => {
  try {
    const personaData = z.object({
      name: z.string().min(1),
      description: z.string(),
      personality: z.string(),
      expertise: z.array(z.string()),
      tone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'conversational']),
      knowledgeLevel: z.enum(['beginner', 'intermediate', 'expert']),
      responseLength: z.enum(['short', 'medium', 'long']),
      brandVoice: z.string(),
      customPrompts: z.array(z.string()),
      isActive: z.boolean()
    }).parse(req.body);

    const persona = await storage.createAIPersona(personaData);
    res.status(201).json(persona);
  } catch (error) {
    console.error('Error creating AI persona:', error);
    res.status(500).json({ message: 'Failed to create AI persona' });
  }
});

// Update AI persona
router.put('/api/ai-personas/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const personaData = req.body;
    
    const persona = await storage.updateAIPersona(parseInt(id), personaData);
    res.json(persona);
  } catch (error) {
    console.error('Error updating AI persona:', error);
    res.status(500).json({ message: 'Failed to update AI persona' });
  }
});

// Delete AI persona
router.delete('/api/ai-personas/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteAIPersona(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting AI persona:', error);
    res.status(500).json({ message: 'Failed to delete AI persona' });
  }
});

// Test AI persona
router.post('/api/ai-personas/test', requireClerkAuth, async (req, res) => {
  try {
    const { personaId, question } = req.body;
    
    const persona = await storage.getAIPersona(personaId);
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    const response = await generateAnswer(question, persona);
    res.json({ response });
  } catch (error) {
    console.error('Error testing AI persona:', error);
    res.status(500).json({ message: 'Failed to test AI persona' });
  }
});

// ============================================================================
// MULTILINGUAL SUPPORT API ENDPOINTS
// ============================================================================

// Get all languages
router.get('/api/languages', requireClerkAuth, async (req, res) => {
  try {
    const languages = await storage.getAllLanguages();
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ message: 'Failed to fetch languages' });
  }
});

// Add language
router.post('/api/languages', requireClerkAuth, async (req, res) => {
  try {
    const languageData = z.object({
      code: z.string().min(2).max(5),
      name: z.string(),
      nativeName: z.string(),
      flag: z.string(),
      isActive: z.boolean(),
      isDefault: z.boolean(),
      translationQuality: z.enum(['basic', 'good', 'excellent']),
      aiProvider: z.string(),
      customPrompts: z.array(z.string())
    }).parse(req.body);

    const language = await storage.createLanguage(languageData);
    res.status(201).json(language);
  } catch (error) {
    console.error('Error creating language:', error);
    res.status(500).json({ message: 'Failed to create language' });
  }
});

// Update language
router.put('/api/languages/:code', requireClerkAuth, async (req, res) => {
  try {
    const { code } = req.params;
    const languageData = req.body;
    
    const language = await storage.updateLanguage(code, languageData);
    res.json(language);
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ message: 'Failed to update language' });
  }
});

// Delete language
router.delete('/api/languages/:code', requireClerkAuth, async (req, res) => {
  try {
    const { code } = req.params;
    await storage.deleteLanguage(code);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting language:', error);
    res.status(500).json({ message: 'Failed to delete language' });
  }
});

// Test translation
router.post('/api/translations/test', requireClerkAuth, async (req, res) => {
  try {
    const { sourceLanguage, targetLanguage, content } = req.body;
    
    // Use AI service to translate content
    const translation = await storage.translateContent(content, sourceLanguage, targetLanguage);
    res.json({ translation });
  } catch (error) {
    console.error('Error testing translation:', error);
    res.status(500).json({ message: 'Failed to test translation' });
  }
});

// Bulk translate
router.post('/api/translations/bulk', requireClerkAuth, async (req, res) => {
  try {
    const { targetLanguage, contentType } = req.body;
    
    const result = await storage.bulkTranslateContent(targetLanguage, contentType);
    res.json(result);
  } catch (error) {
    console.error('Error bulk translating:', error);
    res.status(500).json({ message: 'Failed to bulk translate' });
  }
});

// Get recent translations
router.get('/api/translations/recent', requireClerkAuth, async (req, res) => {
  try {
    const translations = await storage.getRecentTranslations();
    res.json(translations);
  } catch (error) {
    console.error('Error fetching recent translations:', error);
    res.status(500).json({ message: 'Failed to fetch recent translations' });
  }
});

// Get translation configs
router.get('/api/translation-configs', requireClerkAuth, async (req, res) => {
  try {
    const configs = await storage.getTranslationConfigs();
    res.json(configs);
  } catch (error) {
    console.error('Error fetching translation configs:', error);
    res.status(500).json({ message: 'Failed to fetch translation configs' });
  }
});

// ============================================================================
// CUSTOM AI TRAINING API ENDPOINTS
// ============================================================================

// Get all custom models
router.get('/api/custom-models', requireClerkAuth, async (req, res) => {
  try {
    const models = await storage.getAllCustomModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching custom models:', error);
    res.status(500).json({ message: 'Failed to fetch custom models' });
  }
});

// Create custom model
router.post('/api/custom-models', requireClerkAuth, async (req, res) => {
  try {
    const modelData = z.object({
      name: z.string().min(1),
      description: z.string(),
      baseModel: z.string(),
      trainingData: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['questions', 'answers', 'conversations', 'custom']),
        size: z.number(),
        quality: z.number(),
        isActive: z.boolean()
      })),
      hyperparameters: z.object({
        learningRate: z.number(),
        batchSize: z.number(),
        epochs: z.number(),
        temperature: z.number(),
        maxTokens: z.number(),
        customInstructions: z.array(z.string())
      }),
      status: z.enum(['draft', 'training', 'completed', 'failed', 'deployed'])
    }).parse(req.body);

    const model = await storage.createCustomModel(modelData);
    res.status(201).json(model);
  } catch (error) {
    console.error('Error creating custom model:', error);
    res.status(500).json({ message: 'Failed to create custom model' });
  }
});

// Update custom model
router.put('/api/custom-models/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const modelData = req.body;
    
    const model = await storage.updateCustomModel(parseInt(id), modelData);
    res.json(model);
  } catch (error) {
    console.error('Error updating custom model:', error);
    res.status(500).json({ message: 'Failed to update custom model' });
  }
});

// Delete custom model
router.delete('/api/custom-models/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteCustomModel(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting custom model:', error);
    res.status(500).json({ message: 'Failed to delete custom model' });
  }
});

// Start training
router.post('/api/custom-models/:id/train', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const trainingJob = await storage.startModelTraining(parseInt(id));
    res.json(trainingJob);
  } catch (error) {
    console.error('Error starting training:', error);
    res.status(500).json({ message: 'Failed to start training' });
  }
});

// Deploy model
router.post('/api/custom-models/:id/deploy', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await storage.deployModel(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error deploying model:', error);
    res.status(500).json({ message: 'Failed to deploy model' });
  }
});

// Test custom model
router.post('/api/custom-models/:id/test', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;
    
    const response = await storage.testCustomModel(parseInt(id), prompt);
    res.json({ response });
  } catch (error) {
    console.error('Error testing custom model:', error);
    res.status(500).json({ message: 'Failed to test custom model' });
  }
});

// Get training datasets
router.get('/api/training-datasets', requireClerkAuth, async (req, res) => {
  try {
    const datasets = await storage.getTrainingDatasets();
    res.json(datasets);
  } catch (error) {
    console.error('Error fetching training datasets:', error);
    res.status(500).json({ message: 'Failed to fetch training datasets' });
  }
});

// Get training jobs
router.get('/api/training-jobs', requireClerkAuth, async (req, res) => {
  try {
    const jobs = await storage.getTrainingJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching training jobs:', error);
    res.status(500).json({ message: 'Failed to fetch training jobs' });
  }
});

// Stop training job
router.post('/api/training-jobs/:id/stop', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.stopTrainingJob(parseInt(id));
    res.json({ message: 'Training stopped' });
  } catch (error) {
    console.error('Error stopping training job:', error);
    res.status(500).json({ message: 'Failed to stop training job' });
  }
});

// ============================================================================
// WEBHOOK SYSTEM API ENDPOINTS
// ============================================================================

// Get all webhooks
router.get('/api/webhooks', requireClerkAuth, async (req, res) => {
  try {
    const webhooks = await storage.getAllWebhooks();
    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ message: 'Failed to fetch webhooks' });
  }
});

// Create webhook
router.post('/api/webhooks', requireClerkAuth, async (req, res) => {
  try {
    const webhookData = z.object({
      name: z.string().min(1),
      url: z.string().url(),
      events: z.array(z.string()),
      secret: z.string(),
      isActive: z.boolean(),
      retryPolicy: z.object({
        maxRetries: z.number(),
        retryDelay: z.number(),
        backoffMultiplier: z.number()
      }),
      headers: z.record(z.string())
    }).parse(req.body);

    const webhook = await storage.createWebhook(webhookData);
    res.status(201).json(webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ message: 'Failed to create webhook' });
  }
});

// Update webhook
router.put('/api/webhooks/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const webhookData = req.body;
    
    const webhook = await storage.updateWebhook(parseInt(id), webhookData);
    res.json(webhook);
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({ message: 'Failed to update webhook' });
  }
});

// Delete webhook
router.delete('/api/webhooks/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteWebhook(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ message: 'Failed to delete webhook' });
  }
});

// Test webhook
router.post('/api/webhooks/:id/test', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { payload } = req.body;
    
    const result = await storage.testWebhook(parseInt(id), payload);
    res.json(result);
  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({ message: 'Failed to test webhook' });
  }
});

// Get webhook events
router.get('/api/webhook-events', requireClerkAuth, async (req, res) => {
  try {
    const events = await storage.getWebhookEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    res.status(500).json({ message: 'Failed to fetch webhook events' });
  }
});

// Retry webhook event
router.post('/api/webhook-events/:id/retry', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.retryWebhookEvent(parseInt(id));
    res.json({ message: 'Webhook retry initiated' });
  } catch (error) {
    console.error('Error retrying webhook event:', error);
    res.status(500).json({ message: 'Failed to retry webhook event' });
  }
});

// Get webhook tests
router.get('/api/webhook-tests', requireClerkAuth, async (req, res) => {
  try {
    const tests = await storage.getWebhookTests();
    res.json(tests);
  } catch (error) {
    console.error('Error fetching webhook tests:', error);
    res.status(500).json({ message: 'Failed to fetch webhook tests' });
  }
});

// ============================================================================
// CONTENT MODERATION API ENDPOINTS
// ============================================================================

// Get moderation stats
router.get('/api/moderation/stats', requireClerkAuth, async (req, res) => {
  try {
    const stats = await storage.getModerationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({ message: 'Failed to fetch moderation stats' });
  }
});

// Get moderation rules
router.get('/api/moderation/rules', requireClerkAuth, async (req, res) => {
  try {
    const rules = await storage.getModerationRules();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching moderation rules:', error);
    res.status(500).json({ message: 'Failed to fetch moderation rules' });
  }
});

// Create moderation rule
router.post('/api/moderation/rules', requireClerkAuth, async (req, res) => {
  try {
    const ruleData = z.object({
      name: z.string().min(1),
      description: z.string(),
      type: z.enum(['keyword', 'pattern', 'ai_analysis']),
      pattern: z.string(),
      action: z.enum(['flag', 'hide', 'delete', 'review']),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      isActive: z.boolean()
    }).parse(req.body);

    const rule = await storage.createModerationRule(ruleData);
    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating moderation rule:', error);
    res.status(500).json({ message: 'Failed to create moderation rule' });
  }
});

// Update moderation rule
router.put('/api/moderation/rules/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const ruleData = req.body;
    
    const rule = await storage.updateModerationRule(parseInt(id), ruleData);
    res.json(rule);
  } catch (error) {
    console.error('Error updating moderation rule:', error);
    res.status(500).json({ message: 'Failed to update moderation rule' });
  }
});

// Delete moderation rule
router.delete('/api/moderation/rules/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteModerationRule(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting moderation rule:', error);
    res.status(500).json({ message: 'Failed to delete moderation rule' });
  }
});

// Get moderation actions
router.get('/api/moderation/actions', requireClerkAuth, async (req, res) => {
  try {
    const actions = await storage.getModerationActions();
    res.json(actions);
  } catch (error) {
    console.error('Error fetching moderation actions:', error);
    res.status(500).json({ message: 'Failed to fetch moderation actions' });
  }
});

// Perform moderation action
router.post('/api/moderation/actions', requireClerkAuth, async (req, res) => {
  try {
    const actionData = z.object({
      contentId: z.string(),
      contentType: z.enum(['question', 'answer', 'comment']),
      action: z.enum(['approve', 'reject', 'flag', 'hide', 'delete']),
      reason: z.string().optional(),
      moderatorId: z.string()
    }).parse(req.body);

    const action = await storage.performModerationAction(actionData);
    res.status(201).json(action);
  } catch (error) {
    console.error('Error performing moderation action:', error);
    res.status(500).json({ message: 'Failed to perform moderation action' });
  }
});

// Get moderation reports
router.get('/api/moderation/reports', requireClerkAuth, async (req, res) => {
  try {
    const reports = await storage.getModerationReports();
    res.json(reports);
  } catch (error) {
    console.error('Error fetching moderation reports:', error);
    res.status(500).json({ message: 'Failed to fetch moderation reports' });
  }
});

// ============================================================================
// SEO MANAGEMENT API ENDPOINTS
// ============================================================================

// Get SEO config
router.get('/api/seo/config', requireClerkAuth, async (req, res) => {
  try {
    const config = await storage.getSEOConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching SEO config:', error);
    res.status(500).json({ message: 'Failed to fetch SEO config' });
  }
});

// Update SEO config
router.put('/api/seo/config', requireClerkAuth, async (req, res) => {
  try {
    const configData = req.body;
    const config = await storage.updateSEOConfig(configData);
    res.json(config);
  } catch (error) {
    console.error('Error updating SEO config:', error);
    res.status(500).json({ message: 'Failed to update SEO config' });
  }
});

// Get indexing status
router.get('/api/seo/indexing-status', requireClerkAuth, async (req, res) => {
  try {
    const status = await storage.getIndexingStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching indexing status:', error);
    res.status(500).json({ message: 'Failed to fetch indexing status' });
  }
});

// Trigger indexing
router.post('/api/seo/index', requireClerkAuth, async (req, res) => {
  try {
    const { contentIds, priority } = req.body;
    const result = await storage.triggerIndexing(contentIds, priority);
    res.json(result);
  } catch (error) {
    console.error('Error triggering indexing:', error);
    res.status(500).json({ message: 'Failed to trigger indexing' });
  }
});

// Get sitemap
router.get('/api/seo/sitemap', async (req, res) => {
  try {
    const sitemap = await storage.generateSitemap();
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ message: 'Failed to generate sitemap' });
  }
});

// Get robots.txt
router.get('/api/seo/robots', async (req, res) => {
  try {
    const robots = await storage.generateRobotsTxt();
    res.set('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).json({ message: 'Failed to generate robots.txt' });
  }
});

// Update robots.txt
router.put('/api/seo/robots', requireClerkAuth, async (req, res) => {
  try {
    const { content } = req.body;
    await storage.updateRobotsTxt(content);
    res.json({ message: 'Robots.txt updated' });
  } catch (error) {
    console.error('Error updating robots.txt:', error);
    res.status(500).json({ message: 'Failed to update robots.txt' });
  }
});

// Get structured data
router.get('/api/seo/structured-data', requireClerkAuth, async (req, res) => {
  try {
    const structuredData = await storage.getStructuredData();
    res.json(structuredData);
  } catch (error) {
    console.error('Error fetching structured data:', error);
    res.status(500).json({ message: 'Failed to fetch structured data' });
  }
});

// Update structured data
router.put('/api/seo/structured-data', requireClerkAuth, async (req, res) => {
  try {
    const structuredData = req.body;
    const result = await storage.updateStructuredData(structuredData);
    res.json(result);
  } catch (error) {
    console.error('Error updating structured data:', error);
    res.status(500).json({ message: 'Failed to update structured data' });
  }
});

// ============================================================================
// CUSTOM DOMAIN SETUP API ENDPOINTS
// ============================================================================

// Get domains
router.get('/api/domains', requireClerkAuth, async (req, res) => {
  try {
    const domains = await storage.getDomains();
    res.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ message: 'Failed to fetch domains' });
  }
});

// Add domain
router.post('/api/domains', requireClerkAuth, async (req, res) => {
  try {
    const domainData = z.object({
      domain: z.string(),
      isVerified: z.boolean(),
      verificationToken: z.string().optional()
    }).parse(req.body);

    const domain = await storage.addDomain(domainData);
    res.status(201).json(domain);
  } catch (error) {
    console.error('Error adding domain:', error);
    res.status(500).json({ message: 'Failed to add domain' });
  }
});

// Verify domain
router.post('/api/domains/:id/verify', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await storage.verifyDomain(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({ message: 'Failed to verify domain' });
  }
});

// Get subdomains
router.get('/api/subdomains', requireClerkAuth, async (req, res) => {
  try {
    const subdomains = await storage.getSubdomains();
    res.json(subdomains);
  } catch (error) {
    console.error('Error fetching subdomains:', error);
    res.status(500).json({ message: 'Failed to fetch subdomains' });
  }
});

// Create subdomain
router.post('/api/subdomains', requireClerkAuth, async (req, res) => {
  try {
    const subdomainData = z.object({
      subdomain: z.string(),
      domainId: z.number(),
      forumId: z.number().optional()
    }).parse(req.body);

    const subdomain = await storage.createSubdomain(subdomainData);
    res.status(201).json(subdomain);
  } catch (error) {
    console.error('Error creating subdomain:', error);
    res.status(500).json({ message: 'Failed to create subdomain' });
  }
});

// Get SSL certificates
router.get('/api/domains/ssl', requireClerkAuth, async (req, res) => {
  try {
    const certificates = await storage.getSSLCertificates();
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching SSL certificates:', error);
    res.status(500).json({ message: 'Failed to fetch SSL certificates' });
  }
});

// Get URL redirects
router.get('/api/domains/redirects', requireClerkAuth, async (req, res) => {
  try {
    const redirects = await storage.getURLRedirects();
    res.json(redirects);
  } catch (error) {
    console.error('Error fetching URL redirects:', error);
    res.status(500).json({ message: 'Failed to fetch URL redirects' });
  }
});

// Create URL redirect
router.post('/api/domains/redirects', requireClerkAuth, async (req, res) => {
  try {
    const redirectData = z.object({
      from: z.string(),
      to: z.string(),
      type: z.enum(['301', '302', '307', '308']),
      isActive: z.boolean()
    }).parse(req.body);

    const redirect = await storage.createURLRedirect(redirectData);
    res.status(201).json(redirect);
  } catch (error) {
    console.error('Error creating URL redirect:', error);
    res.status(500).json({ message: 'Failed to create URL redirect' });
  }
});

export default router;

/**
 * PRD API Endpoints
 * Implements all backend functions, routes, and API endpoints as specified in PRD
 */

import express from 'express';
import { 
  generateBusinessAwareContent, 
  generateComprehensiveDialogue, 
  generateBusinessSEOQuestions,
  generateAiContent,
  generateSeoQuestions,
  generateAnswer
} from '../ai';
import { businessAnalysisEngine } from '../business-analysis/engine';
import { consentManagementSystem } from '../consent-management/system';
import { dataAnonymizationPipeline } from '../data-anonymization/pipeline';
import { aiProviderGateway } from '../ai-providers/gateway';
import { seoAutoIndexingSystem } from '../seo/auto-indexing';
import { realTimeAnalyticsDashboard } from '../analytics/dashboard';
import { usageTrackingSystem } from '../usage/tracking';
import { setupFeeService } from '../billing/setup-fee';
import { aiPersonasSystem } from '../ai/personas';
import { aiRateLimitFallbackSystem } from '../ai/rate-limit-fallback';
import { structuredDataSystem } from '../seo/structured-data';
import { xmlSitemapsSystem } from '../seo/xml-sitemaps';
import { dataExportSystem } from '../data-export/system';
import { privacyControlsSystem } from '../privacy/controls';
import { healthMonitoringSystem } from '../monitoring/health';
import { backupRecoverySystem } from '../backup/recovery';
import { polarApi } from '../../shared/polar-service';
import { securityHardeningSystem } from '../security/hardening';
import { sequentialResponseSystem } from '../business-analysis/sequential-responses';
import { contextAwarenessSystem } from '../business-analysis/context-awareness';
import { personalityConsistencySystem } from '../business-analysis/personality-consistency';
import { industryDetectionAlgorithm } from '../business-analysis/industry-detection';
import { brandVoiceIntegrationSystem } from '../business-analysis/brand-voice';

const router = express.Router();

// ============================================================================
// BUSINESS ANALYSIS ENDPOINTS
// ============================================================================

/**
 * POST /api/business/analyze
 * Analyze business context and generate business profile
 */
router.post('/business/analyze', async (req, res) => {
  try {
    const { websiteUrl, productDescription, companyName, additionalInfo } = req.body;
    
    const businessProfile = await businessAnalysisEngine.analyzeBusiness(
      websiteUrl,
      productDescription,
      companyName,
      additionalInfo
    );
    
    res.json({
      success: true,
      data: businessProfile
    });
  } catch (error) {
    console.error('Business analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze business context'
    });
  }
});

/**
 * GET /api/business/industry/:industry
 * Get industry-specific insights and trends
 */
router.get('/business/industry/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    
    // This would typically query a database or external API
    const industryData = {
      industry,
      trends: ['AI integration', 'Digital transformation', 'Cloud migration'],
      competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
      keywords: ['technology', 'innovation', 'digital', 'automation'],
      marketSize: '$100B',
      growthRate: '15%'
    };
    
    res.json({
      success: true,
      data: industryData
    });
  } catch (error) {
    console.error('Industry analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get industry insights'
    });
  }
});

// ============================================================================
// AI CONTENT GENERATION ENDPOINTS
// ============================================================================

/**
 * POST /api/ai/generate/business-aware
 * Generate business-aware content using business analysis
 */
router.post('/ai/generate/business-aware', async (req, res) => {
  try {
    const { 
      prompt, 
      websiteUrl, 
      productDescription, 
      companyName, 
      organizationId 
    } = req.body;
    
    const result = await generateBusinessAwareContent(
      prompt,
      websiteUrl,
      productDescription,
      companyName,
      organizationId
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Business-aware content generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate business-aware content'
    });
  }
});

/**
 * POST /api/ai/generate/temporal-dialogue
 * Generate comprehensive temporal dialogue
 */
router.post('/ai/generate/temporal-dialogue', async (req, res) => {
  try {
    const { 
      topic, 
      websiteUrl, 
      productDescription, 
      companyName, 
      organizationId,
      config 
    } = req.body;
    
    const result = await generateComprehensiveDialogue(
      topic,
      websiteUrl,
      productDescription,
      companyName,
      organizationId
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Temporal dialogue generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate temporal dialogue'
    });
  }
});

/**
 * POST /api/ai/generate/business-seo-questions
 * Generate SEO-optimized questions with business context
 */
router.post('/ai/generate/business-seo-questions', async (req, res) => {
  try {
    const { 
      topic, 
      count = 5, 
      websiteUrl, 
      productDescription, 
      companyName 
    } = req.body;
    
    const questions = await generateBusinessSEOQuestions(
      topic,
      count,
      websiteUrl,
      productDescription,
      companyName
    );
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Business SEO questions generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate business SEO questions'
    });
  }
});

/**
 * POST /api/ai/generate/content
 * Generate AI content using specific persona
 */
router.post('/ai/generate/content', async (req, res) => {
  try {
    const { prompt, agentType, organizationId, businessContext } = req.body;
    
    const content = await generateAiContent(
      prompt,
      agentType,
      organizationId,
      businessContext
    );
    
    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    console.error('AI content generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI content'
    });
  }
});

// ============================================================================
// AI PROVIDER MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/ai/providers
 * Get all available AI providers and their status
 */
router.get('/ai/providers', async (req, res) => {
  try {
    const providerStatuses = aiProviderGateway.getAllProviderStatuses();
    
    res.json({
      success: true,
      data: providerStatuses
    });
  } catch (error) {
    console.error('Provider status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get provider status'
    });
  }
});

/**
 * GET /api/ai/providers/:providerId/status
 * Get specific provider status
 */
router.get('/ai/providers/:providerId/status', async (req, res) => {
  try {
    const { providerId } = req.params;
    const status = aiProviderGateway.getProviderStatus(providerId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Provider status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get provider status'
    });
  }
});

/**
 * GET /api/ai/personas
 * Get available personas for organization plan
 */
router.get('/ai/personas', async (req, res) => {
  try {
    const { plan = 'pro' } = req.query;
    const personas = aiProviderGateway.getPersonasForPlan(plan as any);
    
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Personas error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personas'
    });
  }
});

// ============================================================================
// DATA SHARING AND CONSENT ENDPOINTS
// ============================================================================

/**
 * POST /api/consent/grant
 * Grant consent for data sharing with AI provider
 */
router.post('/consent/grant', async (req, res) => {
  try {
    const { organizationId, providerId, dataScope, consentVersion } = req.body;
    
    const consent = await consentManagementSystem.grantConsent({
      organizationId,
      providerId,
      dataScope,
      consentVersion
    });
    
    res.json({
      success: true,
      data: consent
    });
  } catch (error) {
    console.error('Consent grant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grant consent'
    });
  }
});

/**
 * POST /api/consent/revoke
 * Revoke consent for data sharing
 */
router.post('/consent/revoke', async (req, res) => {
  try {
    const { organizationId, providerId } = req.body;
    
    await consentManagementSystem.revokeConsent(organizationId, providerId);
    
    res.json({
      success: true,
      message: 'Consent revoked successfully'
    });
  } catch (error) {
    console.error('Consent revocation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke consent'
    });
  }
});

/**
 * GET /api/consent/:organizationId
 * Get all consents for organization
 */
router.get('/consent/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const consents = await consentManagementSystem.getOrganizationConsents(Number(organizationId));
    
    res.json({
      success: true,
      data: consents
    });
  } catch (error) {
    console.error('Consent retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consents'
    });
  }
});

/**
 * GET /api/consent/:organizationId/stats
 * Get consent statistics for organization
 */
router.get('/consent/:organizationId/stats', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const stats = await consentManagementSystem.getConsentStats(Number(organizationId));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Consent stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consent statistics'
    });
  }
});

// ============================================================================
// DATA ANONYMIZATION ENDPOINTS
// ============================================================================

/**
 * POST /api/data/anonymize
 * Anonymize content for AI training
 */
router.post('/data/anonymize', async (req, res) => {
  try {
    const { content, organizationId, dataType, providerId } = req.body;
    
    const result = await dataAnonymizationPipeline.anonymizeContent(
      content,
      organizationId,
      dataType,
      providerId
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Data anonymization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to anonymize data'
    });
  }
});

/**
 * GET /api/data/anonymize/:organizationId/stats
 * Get anonymization statistics
 */
router.get('/data/anonymize/:organizationId/stats', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const stats = await dataAnonymizationPipeline.getAnonymizationStats(Number(organizationId));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Anonymization stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get anonymization statistics'
    });
  }
});

/**
 * POST /api/data/export
 * Export anonymized data for AI provider training
 */
router.post('/data/export', async (req, res) => {
  try {
    const { organizationId, providerId, startDate, endDate } = req.body;
    
    const data = await dataAnonymizationPipeline.exportAnonymizedData(
      organizationId,
      providerId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
});

// ============================================================================
// USAGE TRACKING AND ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/usage/:organizationId
 * Get usage statistics for organization
 */
router.get('/usage/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { startDate, endDate } = req.query;
    
    const usageStats = aiProviderGateway.getUsageStats(
      organizationId,
      startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate as string) : new Date()
    );
    
    res.json({
      success: true,
      data: usageStats
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage statistics'
    });
  }
});

/**
 * POST /api/analytics/track
 * Track analytics event
 */
router.post('/analytics/track', async (req, res) => {
  try {
    const { eventType, eventData, organizationId, userId } = req.body;
    
    // This would typically save to analytics database
    console.log('Analytics event:', { eventType, eventData, organizationId, userId });
    
    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track analytics event'
    });
  }
});

// ============================================================================
// SEO AUTO-INDEXING ENDPOINTS
// ============================================================================

/**
 * POST /api/seo/auto-index
 * Auto-index content for SEO
 */
router.post('/seo/auto-index', async (req, res) => {
  try {
    const { forumId } = req.body;
    
    await seoAutoIndexingSystem.autoIndexContent(forumId);
    
    res.json({
      success: true,
      message: 'Content auto-indexed successfully'
    });
  } catch (error) {
    console.error('SEO auto-indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to auto-index content'
    });
  }
});

/**
 * GET /api/seo/sitemap/:forumId
 * Get XML sitemap for forum
 */
router.get('/seo/sitemap/:forumId', async (req, res) => {
  try {
    const { forumId } = req.params;
    const sitemap = await seoAutoIndexingSystem.generateSitemap(Number(forumId));
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sitemap'
    });
  }
});

/**
 * GET /api/seo/structured-data/:forumId
 * Get structured data for forum
 */
router.get('/seo/structured-data/:forumId', async (req, res) => {
  try {
    const { forumId } = req.params;
    const structuredData = await seoAutoIndexingSystem.generateStructuredData(Number(forumId));
    
    res.json({
      success: true,
      data: structuredData
    });
  } catch (error) {
    console.error('Structured data generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate structured data'
    });
  }
});

/**
 * GET /api/seo/stats/:forumId
 * Get SEO statistics
 */
router.get('/seo/stats/:forumId', async (req, res) => {
  try {
    const { forumId } = req.params;
    const stats = await seoAutoIndexingSystem.getSEOStats(Number(forumId));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('SEO stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get SEO statistics'
    });
  }
});

// ============================================================================
// REAL-TIME ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/metrics
 * Get comprehensive analytics metrics
 */
router.get('/analytics/metrics', async (req, res) => {
  try {
    const { forumId } = req.query;
    const metrics = await realTimeAnalyticsDashboard.getAnalyticsMetrics(
      forumId ? Number(forumId) : undefined
    );
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Analytics metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics metrics'
    });
  }
});

/**
 * GET /api/analytics/real-time
 * Get real-time statistics
 */
router.get('/analytics/real-time', async (req, res) => {
  try {
    const { forumId } = req.query;
    const stats = await realTimeAnalyticsDashboard.getRealTimeStats(
      forumId ? Number(forumId) : undefined
    );
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get real-time statistics'
    });
  }
});

/**
 * GET /api/analytics/performance
 * Get performance metrics
 */
router.get('/analytics/performance', async (req, res) => {
  try {
    const metrics = await realTimeAnalyticsDashboard.getPerformanceMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    });
  }
});

// ============================================================================
// USAGE TRACKING ENDPOINTS
// ============================================================================

/**
 * POST /api/usage/track
 * Track usage for organization
 */
router.post('/usage/track', async (req, res) => {
  try {
    const { organizationId, usageType, amount, metadata } = req.body;
    
    await usageTrackingSystem.trackUsage(organizationId, usageType, amount, metadata);
    
    res.json({
      success: true,
      message: 'Usage tracked successfully'
    });
  } catch (error) {
    console.error('Usage tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track usage'
    });
  }
});

/**
 * GET /api/usage/stats/:organizationId
 * Get usage statistics
 */
router.get('/usage/stats/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { period = 'daily' } = req.query;
    
    const stats = await usageTrackingSystem.getUsageStats(
      Number(organizationId),
      period as 'daily' | 'weekly' | 'monthly'
    );
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage statistics'
    });
  }
});

/**
 * GET /api/usage/limits/:organizationId
 * Check usage limits
 */
router.get('/usage/limits/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { plan = 'pro' } = req.query;
    
    const limits = await usageTrackingSystem.checkLimits(
      Number(organizationId),
      plan as 'starter' | 'pro' | 'enterprise'
    );
    
    res.json({
      success: true,
      data: limits
    });
  } catch (error) {
    console.error('Usage limits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check usage limits'
    });
  }
});

/**
 * GET /api/usage/alerts/:organizationId
 * Get usage alerts
 */
router.get('/usage/alerts/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { plan = 'pro' } = req.query;
    
    const alerts = await usageTrackingSystem.getUsageAlerts(
      Number(organizationId),
      plan as 'starter' | 'pro' | 'enterprise'
    );
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Usage alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage alerts'
    });
  }
});

/**
 * GET /api/usage/trends/:organizationId
 * Get usage trends
 */
router.get('/usage/trends/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { days = 30 } = req.query;
    
    const trends = await usageTrackingSystem.getUsageTrends(
      Number(organizationId),
      Number(days)
    );
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Usage trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage trends'
    });
  }
});

// ============================================================================
// AI PERSONAS ENDPOINTS
// ============================================================================

/**
 * GET /api/personas
 * Get all AI personas
 */
router.get('/personas', async (req, res) => {
  try {
    const personas = await aiPersonasSystem.getAllPersonas();
    
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Get personas error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personas',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/debug/personas
 * Debug personas database state
 */
router.get('/debug/personas', async (req, res) => {
  try {
    const { db } = await import('../db');
    const { aiPersonas, aiProviders, aiModels } = await import('../../shared/schema');
    
    // Check if tables exist and have data
    const personaCount = await db.select().from(aiPersonas);
    const providerCount = await db.select().from(aiProviders);
    const modelCount = await db.select().from(aiModels);
    
    res.json({
      success: true,
      data: {
        personas: personaCount.length,
        providers: providerCount.length,
        models: modelCount.length,
        personaData: personaCount,
        providerData: providerCount,
        modelData: modelCount
      }
    });
  } catch (error) {
    console.error('Debug personas error:', error);
    res.status(500).json({
      success: false,
      error: 'Debug failed',
      details: error.message
    });
  }
});

/**
 * GET /api/personas/:name
 * Get persona by name
 */
router.get('/personas/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const persona = await aiPersonasSystem.getPersonaByName(name);
    
    if (!persona) {
      return res.status(404).json({
        success: false,
        error: 'Persona not found'
      });
    }
    
    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error('Get persona error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get persona'
    });
  }
});

/**
 * GET /api/personas/era/:era
 * Get personas by era
 */
router.get('/personas/era/:era', async (req, res) => {
  try {
    const { era } = req.params;
    const personas = await aiPersonasSystem.getPersonasByEra(era);
    
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Get personas by era error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personas by era'
    });
  }
});

/**
 * GET /api/personas/knowledge-level/:level
 * Get personas by knowledge level
 */
router.get('/personas/knowledge-level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const personas = await aiPersonasSystem.getPersonasByKnowledgeLevel(
      level as 'basic' | 'intermediate' | 'advanced' | 'expert'
    );
    
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Get personas by knowledge level error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personas by knowledge level'
    });
  }
});

/**
 * GET /api/personas/provider/:provider
 * Get personas by provider
 */
router.get('/personas/provider/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const personas = await aiPersonasSystem.getPersonasByProvider(provider);
    
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Get personas by provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personas by provider'
    });
  }
});

/**
 * GET /api/personas/plan/:plan
 * Get personas for plan
 */
router.get('/personas/plan/:plan', async (req, res) => {
  try {
    const { plan } = req.params;
    const personas = await aiPersonasSystem.getPersonasForPlan(
      plan as 'starter' | 'pro' | 'enterprise'
    );
    
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Get personas for plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personas for plan'
    });
  }
});

/**
 * GET /api/personas/recommendations
 * Get persona recommendations for topic
 */
router.get('/personas/recommendations', async (req, res) => {
  try {
    const { topic, context } = req.query;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }
    
    const personas = await aiPersonasSystem.getPersonaRecommendations(
      topic as string,
      context as string
    );
    
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Get persona recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get persona recommendations'
    });
  }
});

/**
 * GET /api/personas/stats
 * Get persona statistics
 */
router.get('/personas/stats', async (req, res) => {
  try {
    const stats = await aiPersonasSystem.getPersonaStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get persona stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get persona statistics'
    });
  }
});

/**
 * POST /api/personas/initialize
 * Initialize all personas
 */
router.post('/personas/initialize', async (req, res) => {
  try {
    await aiPersonasSystem.initializePersonas();
    
    res.json({
      success: true,
      message: 'Personas initialized successfully'
    });
  } catch (error) {
    console.error('Initialize personas error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize personas'
    });
  }
});

/**
 * PUT /api/personas/:id
 * Update persona
 */
router.put('/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    await aiPersonasSystem.updatePersona(Number(id), updates);
    
    res.json({
      success: true,
      message: 'Persona updated successfully'
    });
  } catch (error) {
    console.error('Update persona error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update persona'
    });
  }
});

/**
 * DELETE /api/personas/:id
 * Deactivate persona
 */
router.delete('/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await aiPersonasSystem.deactivatePersona(Number(id));
    
    res.json({
      success: true,
      message: 'Persona deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate persona error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate persona'
    });
  }
});

// ============================================================================
// SETUP FEE ENDPOINTS
// ============================================================================

/**
 * GET /api/setup-fee/status/:userId
 * Get setup fee status for user
 */
router.get('/setup-fee/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await setupFeeService.getSetupFeeStatus(Number(userId));
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Setup fee status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get setup fee status'
    });
  }
});

/**
 * POST /api/setup-fee/create-payment
 * Create setup fee payment request
 */
router.post('/setup-fee/create-payment', async (req, res) => {
  try {
    const { userId, planId, paymentMethod, returnUrl, cancelUrl } = req.body;
    
    const result = await setupFeeService.createSetupFeePayment({
      userId,
      planId,
      paymentMethod,
      returnUrl,
      cancelUrl
    });
    
    res.json(result);
  } catch (error) {
    console.error('Setup fee payment creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create setup fee payment'
    });
  }
});

/**
 * POST /api/setup-fee/webhook
 * Handle setup fee payment webhook
 */
router.post('/setup-fee/webhook', async (req, res) => {
  try {
    await setupFeeService.handlePaymentWebhook(req.body);
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Setup fee webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

/**
 * GET /api/setup-fee/stats
 * Get setup fee statistics
 */
router.get('/setup-fee/stats', async (req, res) => {
  try {
    const stats = await setupFeeService.getSetupFeeStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Setup fee stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get setup fee statistics'
    });
  }
});

/**
 * POST /api/setup-fee/refund/:setupFeeId
 * Refund setup fee
 */
router.post('/setup-fee/refund/:setupFeeId', async (req, res) => {
  try {
    const { setupFeeId } = req.params;
    const { reason } = req.body;
    
    const success = await setupFeeService.refundSetupFee(Number(setupFeeId), reason);
    
    res.json({
      success,
      message: success ? 'Setup fee refunded successfully' : 'Failed to refund setup fee'
    });
  } catch (error) {
    console.error('Setup fee refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refund setup fee'
    });
  }
});

/**
 * GET /api/setup-fee/config
 * Get setup fee configuration
 */
router.get('/setup-fee/config', async (req, res) => {
  try {
    const config = setupFeeService.getSetupFeeConfig();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Setup fee config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get setup fee configuration'
    });
  }
});

// ============================================================================
// AI RATE LIMITING AND FALLBACK ENDPOINTS
// ============================================================================

/**
 * GET /api/ai/providers/status
 * Get all AI provider statuses
 */
router.get('/ai/providers/status', async (req, res) => {
  try {
    const statuses = aiRateLimitFallbackSystem.getAllProviderStatuses();
    
    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    console.error('Get AI provider statuses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI provider statuses'
    });
  }
});

/**
 * GET /api/ai/providers/stats
 * Get AI provider statistics
 */
router.get('/ai/providers/stats', async (req, res) => {
  try {
    const stats = aiRateLimitFallbackSystem.getProviderStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get AI provider stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI provider statistics'
    });
  }
});

/**
 * POST /api/ai/providers/reset/:provider
 * Reset AI provider status
 */
router.post('/ai/providers/reset/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    aiRateLimitFallbackSystem.resetProviderStatus(provider as any);
    
    res.json({
      success: true,
      message: 'Provider status reset successfully'
    });
  } catch (error) {
    console.error('Reset AI provider status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset AI provider status'
    });
  }
});

/**
 * GET /api/ai/providers/fallback/:provider
 * Get recommended fallback providers
 */
router.get('/ai/providers/fallback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    const fallbackProviders = aiRateLimitFallbackSystem.getRecommendedFallbackProviders(provider as any);
    
    res.json({
      success: true,
      data: fallbackProviders
    });
  } catch (error) {
    console.error('Get fallback providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fallback providers'
    });
  }
});

// ============================================================================
// STRUCTURED DATA ENDPOINTS
// ============================================================================

/**
 * GET /api/seo/structured-data/question/:id
 * Get structured data for question
 */
router.get('/seo/structured-data/question/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const structuredData = await structuredDataSystem.generateQuestionStructuredData(Number(id));
    
    res.json({
      success: true,
      data: structuredData
    });
  } catch (error) {
    console.error('Get question structured data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get question structured data'
    });
  }
});

/**
 * GET /api/seo/structured-data/answer/:id
 * Get structured data for answer
 */
router.get('/seo/structured-data/answer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const structuredData = await structuredDataSystem.generateAnswerStructuredData(Number(id));
    
    res.json({
      success: true,
      data: structuredData
    });
  } catch (error) {
    console.error('Get answer structured data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get answer structured data'
    });
  }
});

/**
 * GET /api/seo/structured-data/forum/:id
 * Get structured data for forum
 */
router.get('/seo/structured-data/forum/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const structuredData = await structuredDataSystem.generateForumStructuredData(Number(id));
    
    res.json({
      success: true,
      data: structuredData
    });
  } catch (error) {
    console.error('Get forum structured data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get forum structured data'
    });
  }
});

/**
 * GET /api/seo/structured-data/page/:type
 * Get structured data for page type
 */
router.get('/seo/structured-data/page/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { id } = req.query;
    
    const structuredData = await structuredDataSystem.generatePageStructuredData(
      type as 'question' | 'answer' | 'forum' | 'home',
      id ? Number(id) : undefined
    );
    
    res.json({
      success: true,
      data: structuredData
    });
  } catch (error) {
    console.error('Get page structured data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get page structured data'
    });
  }
});

/**
 * GET /api/seo/structured-data/json-ld/:type
 * Get structured data as JSON-LD
 */
router.get('/seo/structured-data/json-ld/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { id } = req.query;
    
    const structuredData = await structuredDataSystem.generatePageStructuredData(
      type as 'question' | 'answer' | 'forum' | 'home',
      id ? Number(id) : undefined
    );
    
    const jsonLd = structuredDataSystem.toJsonLd(structuredData);
    
    res.set('Content-Type', 'application/ld+json');
    res.send(jsonLd);
  } catch (error) {
    console.error('Get JSON-LD structured data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get JSON-LD structured data'
    });
  }
});

/**
 * GET /api/seo/structured-data/stats
 * Get structured data statistics
 */
router.get('/seo/structured-data/stats', async (req, res) => {
  try {
    const stats = await structuredDataSystem.getStructuredDataStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get structured data stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get structured data statistics'
    });
  }
});

// ============================================================================
// XML SITEMAPS ENDPOINTS
// ============================================================================

/**
 * GET /api/seo/sitemap/index
 * Get sitemap index
 */
router.get('/seo/sitemap/index', async (req, res) => {
  try {
    const sitemapIndex = await xmlSitemapsSystem.generateSitemapIndex();
    const xml = xmlSitemapsSystem.sitemapIndexToXML(sitemapIndex);
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Get sitemap index error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sitemap index'
    });
  }
});

/**
 * GET /api/seo/sitemap/main
 * Get main sitemap
 */
router.get('/seo/sitemap/main', async (req, res) => {
  try {
    const sitemap = await xmlSitemapsSystem.generateMainSitemap();
    const xml = xmlSitemapsSystem.entriesToXML(sitemap);
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Get main sitemap error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get main sitemap'
    });
  }
});

/**
 * GET /api/seo/sitemap/forums
 * Get forums sitemap
 */
router.get('/seo/sitemap/forums', async (req, res) => {
  try {
    const sitemap = await xmlSitemapsSystem.generateForumsSitemap();
    const xml = xmlSitemapsSystem.entriesToXML(sitemap);
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Get forums sitemap error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get forums sitemap'
    });
  }
});

/**
 * GET /api/seo/sitemap/questions
 * Get questions sitemap
 */
router.get('/seo/sitemap/questions', async (req, res) => {
  try {
    const sitemap = await xmlSitemapsSystem.generateQuestionsSitemap();
    const xml = xmlSitemapsSystem.entriesToXML(sitemap);
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Get questions sitemap error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get questions sitemap'
    });
  }
});

/**
 * GET /api/seo/sitemap/pages
 * Get pages sitemap
 */
router.get('/seo/sitemap/pages', async (req, res) => {
  try {
    const sitemap = await xmlSitemapsSystem.generatePagesSitemap();
    const xml = xmlSitemapsSystem.entriesToXML(sitemap);
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Get pages sitemap error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pages sitemap'
    });
  }
});

/**
 * GET /api/seo/sitemap/news
 * Get news sitemap
 */
router.get('/seo/sitemap/news', async (req, res) => {
  try {
    const sitemap = await xmlSitemapsSystem.generateNewsSitemap();
    const xml = xmlSitemapsSystem.entriesToXML(sitemap);
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Get news sitemap error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get news sitemap'
    });
  }
});

/**
 * GET /api/seo/sitemap/images
 * Get image sitemap
 */
router.get('/seo/sitemap/images', async (req, res) => {
  try {
    const sitemap = await xmlSitemapsSystem.generateImageSitemap();
    const xml = xmlSitemapsSystem.entriesToXML(sitemap);
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Get image sitemap error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get image sitemap'
    });
  }
});

/**
 * POST /api/seo/sitemap/submit
 * Submit sitemap to search engines
 */
router.post('/seo/sitemap/submit', async (req, res) => {
  try {
    const { sitemapUrl } = req.body;
    
    const results = await xmlSitemapsSystem.submitSitemapToSearchEngines(sitemapUrl);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Submit sitemap error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit sitemap'
    });
  }
});

/**
 * GET /api/seo/sitemap/stats
 * Get sitemap statistics
 */
router.get('/seo/sitemap/stats', async (req, res) => {
  try {
    const stats = await xmlSitemapsSystem.getSitemapStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get sitemap stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sitemap statistics'
    });
  }
});

// ============================================================================
// INDUSTRY DETECTION ENDPOINTS
// ============================================================================

/**
 * POST /api/business/industry/detect-text
 * Detect industry from text content
 */
router.post('/business/industry/detect-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required'
      });
    }

    const result = await industryDetectionAlgorithm.detectIndustryFromText(text);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Industry detection from text error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect industry from text'
    });
  }
});

/**
 * POST /api/business/industry/detect-website
 * Detect industry from website content
 */
router.post('/business/industry/detect-website', async (req, res) => {
  try {
    const { websiteUrl } = req.body;
    
    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'Website URL is required'
      });
    }

    const result = await industryDetectionAlgorithm.detectIndustryFromWebsite(websiteUrl);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Industry detection from website error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect industry from website'
    });
  }
});

/**
 * POST /api/business/industry/detect-description
 * Detect industry from business description
 */
router.post('/business/industry/detect-description', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Business description is required'
      });
    }

    const result = await industryDetectionAlgorithm.detectIndustryFromDescription(description);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Industry detection from description error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect industry from description'
    });
  }
});

/**
 * GET /api/business/industry/insights/:industry
 * Get industry insights
 */
router.get('/business/industry/insights/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    
    const insights = await industryDetectionAlgorithm.getIndustryInsights(industry);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Get industry insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get industry insights'
    });
  }
});

/**
 * GET /api/business/industry/compare
 * Compare two industries
 */
router.get('/business/industry/compare', async (req, res) => {
  try {
    const { industry1, industry2 } = req.query;
    
    if (!industry1 || !industry2) {
      return res.status(400).json({
        success: false,
        error: 'Both industry1 and industry2 are required'
      });
    }

    const comparison = industryDetectionAlgorithm.compareIndustries(
      industry1 as string, 
      industry2 as string
    );
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Compare industries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare industries'
    });
  }
});

/**
 * GET /api/business/industry/list
 * Get all available industries
 */
router.get('/business/industry/list', async (req, res) => {
  try {
    const industries = industryDetectionAlgorithm.getAllIndustries();
    
    res.json({
      success: true,
      data: industries
    });
  } catch (error) {
    console.error('Get industries list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get industries list'
    });
  }
});

/**
 * GET /api/business/industry/stats
 * Get industry detection statistics
 */
router.get('/business/industry/stats', async (req, res) => {
  try {
    const stats = industryDetectionAlgorithm.getIndustryStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get industry stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get industry statistics'
    });
  }
});

// ============================================================================
// BRAND VOICE ENDPOINTS
// ============================================================================

/**
 * POST /api/brand-voice/create
 * Create custom brand voice profile
 */
router.post('/brand-voice/create', async (req, res) => {
  try {
    const config = req.body;
    
    const profile = await brandVoiceIntegrationSystem.createBrandVoiceProfile(config);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Create brand voice profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create brand voice profile'
    });
  }
});

/**
 * POST /api/brand-voice/apply
 * Apply brand voice to content
 */
router.post('/brand-voice/apply', async (req, res) => {
  try {
    const { content, brandVoiceId, context } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    const result = await brandVoiceIntegrationSystem.applyBrandVoice(
      content, 
      brandVoiceId, 
      context
    );
    
    res.json({
      success: true,
      data: { content: result }
    });
  } catch (error) {
    console.error('Apply brand voice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply brand voice'
    });
  }
});

/**
 * POST /api/brand-voice/analyze
 * Analyze content for brand voice consistency
 */
router.post('/brand-voice/analyze', async (req, res) => {
  try {
    const { content, brandVoiceId } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    const analysis = await brandVoiceIntegrationSystem.analyzeBrandVoiceConsistency(
      content, 
      brandVoiceId
    );
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analyze brand voice consistency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze brand voice consistency'
    });
  }
});

/**
 * GET /api/brand-voice/guidelines/:id
 * Get brand voice guidelines
 */
router.get('/brand-voice/guidelines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const guidelines = await brandVoiceIntegrationSystem.generateBrandVoiceGuidelines(id);
    
    res.json({
      success: true,
      data: { guidelines }
    });
  } catch (error) {
    console.error('Get brand voice guidelines error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get brand voice guidelines'
    });
  }
});

/**
 * GET /api/brand-voice/profiles
 * Get all brand voice profiles
 */
router.get('/brand-voice/profiles', async (req, res) => {
  try {
    const profiles = brandVoiceIntegrationSystem.getAllBrandVoiceProfiles();
    
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Get brand voice profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get brand voice profiles'
    });
  }
});

/**
 * GET /api/brand-voice/profile/:id
 * Get specific brand voice profile
 */
router.get('/brand-voice/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = brandVoiceIntegrationSystem.getBrandVoiceProfile(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Brand voice profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get brand voice profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get brand voice profile'
    });
  }
});

/**
 * PUT /api/brand-voice/profile/:id
 * Update brand voice profile
 */
router.put('/brand-voice/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    brandVoiceIntegrationSystem.updateBrandVoiceProfile(id, updates);
    
    res.json({
      success: true,
      message: 'Brand voice profile updated successfully'
    });
  } catch (error) {
    console.error('Update brand voice profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update brand voice profile'
    });
  }
});

/**
 * DELETE /api/brand-voice/profile/:id
 * Delete brand voice profile
 */
router.delete('/brand-voice/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = brandVoiceIntegrationSystem.deleteBrandVoiceProfile(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Brand voice profile not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Brand voice profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete brand voice profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete brand voice profile'
    });
  }
});

/**
 * POST /api/brand-voice/generate
 * Generate content with brand voice
 */
router.post('/brand-voice/generate', async (req, res) => {
  try {
    const { prompt, brandVoiceId, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const content = await brandVoiceIntegrationSystem.generateContentWithBrandVoice(
      prompt, 
      brandVoiceId, 
      context
    );
    
    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    console.error('Generate content with brand voice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content with brand voice'
    });
  }
});

/**
 * POST /api/brand-voice/batch-apply
 * Batch apply brand voice to multiple content pieces
 */
router.post('/brand-voice/batch-apply', async (req, res) => {
  try {
    const { contentList, brandVoiceId, context } = req.body;
    
    if (!contentList || !Array.isArray(contentList)) {
      return res.status(400).json({
        success: false,
        error: 'Content list is required and must be an array'
      });
    }

    const results = await brandVoiceIntegrationSystem.batchApplyBrandVoice(
      contentList, 
      brandVoiceId, 
      context
    );
    
    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    console.error('Batch apply brand voice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch apply brand voice'
    });
  }
});

/**
 * GET /api/brand-voice/stats
 * Get brand voice statistics
 */
router.get('/brand-voice/stats', async (req, res) => {
  try {
    const stats = brandVoiceIntegrationSystem.getBrandVoiceStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get brand voice stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get brand voice statistics'
    });
  }
});

/**
 * POST /api/brand-voice/export/:id
 * Export brand voice profile
 */
router.post('/brand-voice/export/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profileData = brandVoiceIntegrationSystem.exportBrandVoiceProfile(id);
    
    res.json({
      success: true,
      data: { profileData }
    });
  } catch (error) {
    console.error('Export brand voice profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export brand voice profile'
    });
  }
});

/**
 * POST /api/brand-voice/import
 * Import brand voice profile
 */
router.post('/brand-voice/import', async (req, res) => {
  try {
    const { profileData } = req.body;
    
    if (!profileData) {
      return res.status(400).json({
        success: false,
        error: 'Profile data is required'
      });
    }

    const profile = brandVoiceIntegrationSystem.importBrandVoiceProfile(profileData);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Import brand voice profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import brand voice profile'
    });
  }
});

// ============================================================================
// SEQUENTIAL RESPONSE ENDPOINTS
// ============================================================================

/**
 * POST /api/sequential/start-conversation
 * Start a new sequential conversation
 */
router.post('/sequential/start-conversation', async (req, res) => {
  try {
    const { questionId, initialPersona, businessContext, config } = req.body;
    
    if (!questionId || !initialPersona) {
      return res.status(400).json({
        success: false,
        error: 'Question ID and initial persona are required'
      });
    }

    const thread = await sequentialResponseSystem.startSequentialConversation(
      questionId,
      initialPersona,
      businessContext,
      config
    );
    
    res.json({
      success: true,
      data: thread
    });
  } catch (error) {
    console.error('Start sequential conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start sequential conversation'
    });
  }
});

/**
 * POST /api/sequential/generate-response
 * Generate the next sequential response
 */
router.post('/sequential/generate-response', async (req, res) => {
  try {
    const { conversationId, config } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      });
    }

    const response = await sequentialResponseSystem.generateSequentialResponse(
      conversationId,
      config
    );
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Generate sequential response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sequential response'
    });
  }
});

/**
 * GET /api/sequential/conversation/:id
 * Get conversation thread
 */
router.get('/sequential/conversation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const thread = sequentialResponseSystem.getConversationThread(id);
    
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Conversation thread not found'
      });
    }
    
    res.json({
      success: true,
      data: thread
    });
  } catch (error) {
    console.error('Get conversation thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation thread'
    });
  }
});

/**
 * GET /api/sequential/conversations
 * Get all active conversations
 */
router.get('/sequential/conversations', async (req, res) => {
  try {
    const conversations = sequentialResponseSystem.getAllActiveConversations();
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get active conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active conversations'
    });
  }
});

/**
 * DELETE /api/sequential/conversation/:id
 * End conversation thread
 */
router.delete('/sequential/conversation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const ended = sequentialResponseSystem.endConversationThread(id);
    
    if (!ended) {
      return res.status(404).json({
        success: false,
        error: 'Conversation thread not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Conversation thread ended successfully'
    });
  } catch (error) {
    console.error('End conversation thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end conversation thread'
    });
  }
});

/**
 * GET /api/sequential/stats
 * Get conversation statistics
 */
router.get('/sequential/stats', async (req, res) => {
  try {
    const stats = sequentialResponseSystem.getConversationStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get conversation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation statistics'
    });
  }
});

/**
 * GET /api/sequential/analytics/:id
 * Get conversation analytics
 */
router.get('/sequential/analytics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const analytics = sequentialResponseSystem.getConversationAnalytics(id);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Conversation analytics not found'
      });
    }
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get conversation analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation analytics'
    });
  }
});

// ============================================================================
// CONTEXT AWARENESS ENDPOINTS
// ============================================================================

/**
 * POST /api/context/store-memory
 * Store contextual memory
 */
router.post('/context/store-memory', async (req, res) => {
  try {
    const { contextType, content, source, persona, businessContext, tags } = req.body;
    
    if (!contextType || !content || !source || !persona) {
      return res.status(400).json({
        success: false,
        error: 'Context type, content, source, and persona are required'
      });
    }

    const memory = await contextAwarenessSystem.storeContextualMemory(
      contextType,
      content,
      source,
      persona,
      businessContext,
      tags
    );
    
    res.json({
      success: true,
      data: memory
    });
  } catch (error) {
    console.error('Store contextual memory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store contextual memory'
    });
  }
});

/**
 * POST /api/context/analyze
 * Analyze context for response generation
 */
router.post('/context/analyze', async (req, res) => {
  try {
    const { currentContext, source, persona, businessContext } = req.body;
    
    if (!currentContext || !source || !persona) {
      return res.status(400).json({
        success: false,
        error: 'Current context, source, and persona are required'
      });
    }

    const analysis = await contextAwarenessSystem.analyzeContext(
      currentContext,
      source,
      persona,
      businessContext
    );
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analyze context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze context'
    });
  }
});

/**
 * POST /api/context/generate-response
 * Generate context-aware response
 */
router.post('/context/generate-response', async (req, res) => {
  try {
    const { prompt, source, persona, businessContext, awarenessLevel } = req.body;
    
    if (!prompt || !source || !persona) {
      return res.status(400).json({
        success: false,
        error: 'Prompt, source, and persona are required'
      });
    }

    const response = await contextAwarenessSystem.generateContextAwareResponse(
      prompt,
      source,
      persona,
      businessContext,
      awarenessLevel
    );
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Generate context-aware response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate context-aware response'
    });
  }
});

/**
 * GET /api/context/memories/:source
 * Get contextual memories for a source
 */
router.get('/context/memories/:source', async (req, res) => {
  try {
    const { source } = req.params;
    
    const memories = contextAwarenessSystem.getContextualMemories(source);
    
    res.json({
      success: true,
      data: memories
    });
  } catch (error) {
    console.error('Get contextual memories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contextual memories'
    });
  }
});

/**
 * DELETE /api/context/memories/:source
 * Clear contextual memories for a source
 */
router.delete('/context/memories/:source', async (req, res) => {
  try {
    const { source } = req.params;
    
    contextAwarenessSystem.clearContextualMemories(source);
    
    res.json({
      success: true,
      message: 'Contextual memories cleared successfully'
    });
  } catch (error) {
    console.error('Clear contextual memories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear contextual memories'
    });
  }
});

/**
 * GET /api/context/stats
 * Get context awareness statistics
 */
router.get('/context/stats', async (req, res) => {
  try {
    const stats = contextAwarenessSystem.getContextAwarenessStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get context awareness stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get context awareness statistics'
    });
  }
});

/**
 * GET /api/context/profiles
 * Get all context awareness profiles
 */
router.get('/context/profiles', async (req, res) => {
  try {
    const profiles = contextAwarenessSystem.getAllContextAwarenessProfiles();
    
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Get context awareness profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get context awareness profiles'
    });
  }
});

/**
 * GET /api/context/profile/:id
 * Get specific context awareness profile
 */
router.get('/context/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = contextAwarenessSystem.getContextAwarenessProfile(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Context awareness profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get context awareness profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get context awareness profile'
    });
  }
});

// ============================================================================
// PERSONALITY CONSISTENCY ENDPOINTS
// ============================================================================

/**
 * POST /api/personality/check-consistency
 * Check personality consistency
 */
router.post('/personality/check-consistency', async (req, res) => {
  try {
    const { personaName, content } = req.body;
    
    if (!personaName || !content) {
      return res.status(400).json({
        success: false,
        error: 'Persona name and content are required'
      });
    }

    const check = await personalityConsistencySystem.checkPersonalityConsistency(
      personaName,
      content
    );
    
    res.json({
      success: true,
      data: check
    });
  } catch (error) {
    console.error('Check personality consistency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check personality consistency'
    });
  }
});

/**
 * POST /api/personality/correct-inconsistencies
 * Correct personality inconsistencies
 */
router.post('/personality/correct-inconsistencies', async (req, res) => {
  try {
    const { content, personaName, inconsistencies } = req.body;
    
    if (!content || !personaName || !inconsistencies) {
      return res.status(400).json({
        success: false,
        error: 'Content, persona name, and inconsistencies are required'
      });
    }

    const correctedContent = await personalityConsistencySystem.correctPersonalityInconsistencies(
      content,
      personaName,
      inconsistencies
    );
    
    res.json({
      success: true,
      data: { correctedContent }
    });
  } catch (error) {
    console.error('Correct personality inconsistencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to correct personality inconsistencies'
    });
  }
});

/**
 * GET /api/personality/profiles
 * Get all personality profiles
 */
router.get('/personality/profiles', async (req, res) => {
  try {
    const profiles = personalityConsistencySystem.getAllPersonalityProfiles();
    
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Get personality profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personality profiles'
    });
  }
});

/**
 * GET /api/personality/profile/:name
 * Get specific personality profile
 */
router.get('/personality/profile/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const profile = personalityConsistencySystem.getPersonalityProfile(name);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Personality profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get personality profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personality profile'
    });
  }
});

/**
 * PUT /api/personality/profile/:name
 * Update personality profile
 */
router.put('/personality/profile/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const updates = req.body;
    
    await personalityConsistencySystem.updatePersonalityProfile(name);
    
    res.json({
      success: true,
      message: 'Personality profile updated successfully'
    });
  } catch (error) {
    console.error('Update personality profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update personality profile'
    });
  }
});

/**
 * GET /api/personality/stats
 * Get personality consistency statistics
 */
router.get('/personality/stats', async (req, res) => {
  try {
    const stats = personalityConsistencySystem.getPersonalityConsistencyStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get personality consistency stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personality consistency statistics'
    });
  }
});

/**
 * GET /api/personality/config
 * Get consistency configuration
 */
router.get('/personality/config', async (req, res) => {
  try {
    const config = personalityConsistencySystem.getConsistencyConfig();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get consistency config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consistency configuration'
    });
  }
});

/**
 * PUT /api/personality/config
 * Update consistency configuration
 */
router.put('/personality/config', async (req, res) => {
  try {
    const config = req.body;
    
    personalityConsistencySystem.updateConsistencyConfig(config);
    
    res.json({
      success: true,
      message: 'Consistency configuration updated successfully'
    });
  } catch (error) {
    console.error('Update consistency config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update consistency configuration'
    });
  }
});

/**
 * POST /api/personality/export/:name
 * Export personality profile
 */
router.post('/personality/export/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const profileData = personalityConsistencySystem.exportPersonalityProfile(name);
    
    res.json({
      success: true,
      data: { profileData }
    });
  } catch (error) {
    console.error('Export personality profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export personality profile'
    });
  }
});

/**
 * POST /api/personality/import
 * Import personality profile
 */
router.post('/personality/import', async (req, res) => {
  try {
    const { profileData } = req.body;
    
    if (!profileData) {
      return res.status(400).json({
        success: false,
        error: 'Profile data is required'
      });
    }

    const profile = personalityConsistencySystem.importPersonalityProfile(profileData);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Import personality profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import personality profile'
    });
  }
});

// ============================================================================
// DATA EXPORT ENDPOINTS
// ============================================================================

/**
 * POST /api/data-export/create
 * Create data export for AI provider
 */
router.post('/data-export/create', async (req, res) => {
  try {
    const config = req.body;
    
    // Validate export configuration
    const validation = dataExportSystem.validateExportConfig(config);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid export configuration',
        details: validation.errors
      });
    }

    const exportResult = await dataExportSystem.createExport(config);
    
    res.json({
      success: true,
      data: exportResult
    });
  } catch (error) {
    console.error('Create data export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create data export'
    });
  }
});

/**
 * GET /api/data-export/status/:id
 * Get export status
 */
router.get('/data-export/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const exportResult = dataExportSystem.getExportStatus(id);
    
    if (!exportResult) {
      return res.status(404).json({
        success: false,
        error: 'Export not found'
      });
    }
    
    res.json({
      success: true,
      data: exportResult
    });
  } catch (error) {
    console.error('Get export status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get export status'
    });
  }
});

/**
 * GET /api/data-export/exports
 * Get all exports
 */
router.get('/data-export/exports', async (req, res) => {
  try {
    const exports = dataExportSystem.getAllExports();
    
    res.json({
      success: true,
      data: exports
    });
  } catch (error) {
    console.error('Get all exports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get exports'
    });
  }
});

/**
 * GET /api/data-export/exports/provider/:provider
 * Get exports by provider
 */
router.get('/data-export/exports/provider/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    const exports = dataExportSystem.getExportsByProvider(provider);
    
    res.json({
      success: true,
      data: exports
    });
  } catch (error) {
    console.error('Get exports by provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get exports by provider'
    });
  }
});

/**
 * DELETE /api/data-export/:id
 * Delete export
 */
router.delete('/data-export/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = dataExportSystem.deleteExport(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Export not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Export deleted successfully'
    });
  } catch (error) {
    console.error('Delete export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete export'
    });
  }
});

/**
 * GET /api/data-export/stats
 * Get export statistics
 */
router.get('/data-export/stats', async (req, res) => {
  try {
    const stats = dataExportSystem.getExportStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get export stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get export statistics'
    });
  }
});

/**
 * GET /api/data-export/metadata/:id
 * Get export metadata
 */
router.get('/data-export/metadata/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const metadata = await dataExportSystem.getExportMetadata(id);
    
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: 'Export metadata not found'
      });
    }
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Get export metadata error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get export metadata'
    });
  }
});

/**
 * GET /api/data-export/formats
 * Get supported export formats
 */
router.get('/data-export/formats', async (req, res) => {
  try {
    const formats = dataExportSystem.getSupportedFormats();
    
    res.json({
      success: true,
      data: formats
    });
  } catch (error) {
    console.error('Get supported formats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported formats'
    });
  }
});

/**
 * GET /api/data-export/providers
 * Get supported providers
 */
router.get('/data-export/providers', async (req, res) => {
  try {
    const providers = dataExportSystem.getSupportedProviders();
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Get supported providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported providers'
    });
  }
});

/**
 * GET /api/data-export/trends
 * Get export trends
 */
router.get('/data-export/trends', async (req, res) => {
  try {
    const { days } = req.query;
    
    const trends = dataExportSystem.getExportTrends(Number(days) || 30);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Get export trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get export trends'
    });
  }
});

// ============================================================================
// PRIVACY CONTROLS ENDPOINTS
// ============================================================================

/**
 * GET /api/privacy/settings/:userId
 * Get privacy settings for user
 */
router.get('/privacy/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const settings = await privacyControlsSystem.getPrivacySettings(Number(userId));
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Privacy settings not found'
      });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get privacy settings'
    });
  }
});

/**
 * PUT /api/privacy/settings/:userId
 * Update privacy settings
 */
router.put('/privacy/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const settings = await privacyControlsSystem.updatePrivacySettings(Number(userId), updates);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update privacy settings'
    });
  }
});

/**
 * POST /api/privacy/gdpr-request
 * Create GDPR request
 */
router.post('/privacy/gdpr-request', async (req, res) => {
  try {
    const { userId, type, description } = req.body;
    
    if (!userId || !type || !description) {
      return res.status(400).json({
        success: false,
        error: 'User ID, type, and description are required'
      });
    }

    const request = await privacyControlsSystem.createGDPRRequest(userId, type, description);
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Create GDPR request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create GDPR request'
    });
  }
});

/**
 * GET /api/privacy/gdpr-request/:id
 * Get GDPR request
 */
router.get('/privacy/gdpr-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = privacyControlsSystem.getGDPRRequest(id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'GDPR request not found'
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get GDPR request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get GDPR request'
    });
  }
});

/**
 * GET /api/privacy/gdpr-requests/:userId
 * Get GDPR requests for user
 */
router.get('/privacy/gdpr-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const requests = privacyControlsSystem.getGDPRRequestsForUser(Number(userId));
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get GDPR requests for user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get GDPR requests for user'
    });
  }
});

/**
 * POST /api/privacy/data-breach
 * Report data breach
 */
router.post('/privacy/data-breach', async (req, res) => {
  try {
    const { severity, description, affectedUsers, dataTypes } = req.body;
    
    if (!severity || !description || !affectedUsers || !dataTypes) {
      return res.status(400).json({
        success: false,
        error: 'Severity, description, affected users, and data types are required'
      });
    }

    const breach = await privacyControlsSystem.reportDataBreach(
      severity,
      description,
      affectedUsers,
      dataTypes
    );
    
    res.json({
      success: true,
      data: breach
    });
  } catch (error) {
    console.error('Report data breach error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to report data breach'
    });
  }
});

/**
 * GET /api/privacy/data-breach/:id
 * Get data breach
 */
router.get('/privacy/data-breach/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const breach = privacyControlsSystem.getDataBreach(id);
    
    if (!breach) {
      return res.status(404).json({
        success: false,
        error: 'Data breach not found'
      });
    }
    
    res.json({
      success: true,
      data: breach
    });
  } catch (error) {
    console.error('Get data breach error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get data breach'
    });
  }
});

/**
 * GET /api/privacy/data-breaches
 * Get all data breaches
 */
router.get('/privacy/data-breaches', async (req, res) => {
  try {
    const breaches = privacyControlsSystem.getAllDataBreaches();
    
    res.json({
      success: true,
      data: breaches
    });
  } catch (error) {
    console.error('Get all data breaches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get data breaches'
    });
  }
});

/**
 * GET /api/privacy/audit-logs
 * Get audit logs
 */
router.get('/privacy/audit-logs', async (req, res) => {
  try {
    const { userId, limit } = req.query;
    
    const logs = privacyControlsSystem.getAuditLogs(
      userId ? Number(userId) : undefined,
      Number(limit) || 100
    );
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audit logs'
    });
  }
});

/**
 * GET /api/privacy/compliance-report
 * Generate privacy compliance report
 */
router.get('/privacy/compliance-report', async (req, res) => {
  try {
    const report = await privacyControlsSystem.generatePrivacyComplianceReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Generate privacy compliance report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate privacy compliance report'
    });
  }
});

/**
 * GET /api/privacy/stats
 * Get privacy statistics
 */
router.get('/privacy/stats', async (req, res) => {
  try {
    const stats = privacyControlsSystem.getPrivacyStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get privacy stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get privacy statistics'
    });
  }
});

/**
 * POST /api/privacy/cleanup
 * Clean up expired data
 */
router.post('/privacy/cleanup', async (req, res) => {
  try {
    const result = await privacyControlsSystem.cleanupExpiredData();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Cleanup expired data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup expired data'
    });
  }
});

// ============================================================================
// HEALTH MONITORING ENDPOINTS
// ============================================================================

/**
 * GET /api/health
 * Get system health status
 */
router.get('/health', async (req, res) => {
  try {
    const health = healthMonitoringSystem.getSystemHealth();
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system health'
    });
  }
});

/**
 * GET /api/health/metrics
 * Get performance metrics
 */
router.get('/health/metrics', async (req, res) => {
  try {
    const { limit } = req.query;
    
    const metrics = healthMonitoringSystem.getPerformanceMetrics(Number(limit) || 100);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    });
  }
});

/**
 * GET /api/health/alerts
 * Get system alerts
 */
router.get('/health/alerts', async (req, res) => {
  try {
    const { resolved } = req.query;
    
    const alerts = healthMonitoringSystem.getAlerts(resolved === 'true');
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get system alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system alerts'
    });
  }
});

/**
 * PUT /api/health/alerts/:id/resolve
 * Resolve alert
 */
router.put('/health/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resolved = healthMonitoringSystem.resolveAlert(id);
    
    if (!resolved) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert'
    });
  }
});

/**
 * GET /api/health/stats
 * Get monitoring statistics
 */
router.get('/health/stats', async (req, res) => {
  try {
    const stats = healthMonitoringSystem.getMonitoringStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get monitoring stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring statistics'
    });
  }
});

// ============================================================================
// BACKUP RECOVERY ENDPOINTS
// ============================================================================

/**
 * GET /api/backup/configs
 * Get backup configurations
 */
router.get('/backup/configs', async (req, res) => {
  try {
    const configs = backupRecoverySystem.getBackupConfigs();
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Get backup configs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get backup configurations'
    });
  }
});

/**
 * POST /api/backup/perform/:configId
 * Perform backup
 */
router.post('/backup/perform/:configId', async (req, res) => {
  try {
    const { configId } = req.params;
    
    const result = await backupRecoverySystem.performBackup(configId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Perform backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform backup'
    });
  }
});

/**
 * GET /api/backup/results
 * Get backup results
 */
router.get('/backup/results', async (req, res) => {
  try {
    const { configId } = req.query;
    
    const results = backupRecoverySystem.getBackupResults(configId as string);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Get backup results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get backup results'
    });
  }
});

/**
 * POST /api/backup/restore/:backupId
 * Restore from backup
 */
router.post('/backup/restore/:backupId', async (req, res) => {
  try {
    const { backupId } = req.params;
    const { tables } = req.body;
    
    const result = await backupRecoverySystem.restoreFromBackup(backupId, tables);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Restore from backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore from backup'
    });
  }
});

/**
 * GET /api/backup/stats
 * Get backup statistics
 */
router.get('/backup/stats', async (req, res) => {
  try {
    const stats = backupRecoverySystem.getBackupStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get backup stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get backup statistics'
    });
  }
});

/**
 * DELETE /api/backup/:backupId
 * Delete backup
 */
router.delete('/backup/:backupId', async (req, res) => {
  try {
    const { backupId } = req.params;
    
    const deleted = await backupRecoverySystem.deleteBackup(backupId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Backup not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete backup'
    });
  }
});

// ============================================================================
// SECURITY HARDENING ENDPOINTS
// ============================================================================

/**
 * POST /api/security/validate-password
 * Validate password strength
 */
router.post('/security/validate-password', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const strength = securityHardeningSystem.validatePasswordStrength(password);
    
    res.json({
      success: true,
      data: strength
    });
  } catch (error) {
    console.error('Validate password strength error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate password strength'
    });
  }
});

/**
 * POST /api/security/hash-password
 * Hash password
 */
router.post('/security/hash-password', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const hash = await securityHardeningSystem.hashPassword(password);
    
    res.json({
      success: true,
      data: { hash }
    });
  } catch (error) {
    console.error('Hash password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to hash password'
    });
  }
});

/**
 * POST /api/security/verify-password
 * Verify password
 */
router.post('/security/verify-password', async (req, res) => {
  try {
    const { password, hash } = req.body;
    
    if (!password || !hash) {
      return res.status(400).json({
        success: false,
        error: 'Password and hash are required'
      });
    }

    const isValid = await securityHardeningSystem.verifyPassword(password, hash);
    
    res.json({
      success: true,
      data: { isValid }
    });
  } catch (error) {
    console.error('Verify password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify password'
    });
  }
});

/**
 * POST /api/security/validate-input
 * Validate input
 */
router.post('/security/validate-input', async (req, res) => {
  try {
    const { input, type } = req.body;
    
    if (!input || !type) {
      return res.status(400).json({
        success: false,
        error: 'Input and type are required'
      });
    }

    const validation = securityHardeningSystem.validateInput(input, type);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Validate input error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate input'
    });
  }
});

/**
 * GET /api/security/headers
 * Get security headers
 */
router.get('/security/headers', async (req, res) => {
  try {
    const headers = securityHardeningSystem.getSecurityHeaders();
    
    res.json({
      success: true,
      data: headers
    });
  } catch (error) {
    console.error('Get security headers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security headers'
    });
  }
});

/**
 * GET /api/security/events
 * Get security events
 */
router.get('/security/events', async (req, res) => {
  try {
    const { type, severity, limit } = req.query;
    
    const events = securityHardeningSystem.getSecurityEvents(
      type as any,
      severity as any,
      Number(limit) || 100
    );
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get security events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security events'
    });
  }
});

/**
 * PUT /api/security/events/:id/resolve
 * Resolve security event
 */
router.put('/security/events/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resolved = securityHardeningSystem.resolveSecurityEvent(id);
    
    if (!resolved) {
      return res.status(404).json({
        success: false,
        error: 'Security event not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Security event resolved successfully'
    });
  } catch (error) {
    console.error('Resolve security event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve security event'
    });
  }
});

/**
 * GET /api/security/metrics
 * Get security metrics
 */
router.get('/security/metrics', async (req, res) => {
  try {
    const metrics = securityHardeningSystem.getSecurityMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get security metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security metrics'
    });
  }
});

/**
 * GET /api/security/report
 * Generate security report
 */
router.get('/security/report', async (req, res) => {
  try {
    const report = securityHardeningSystem.generateSecurityReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Generate security report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate security report'
    });
  }
});

/**
 * GET /api/security/suspicious-ips
 * Get suspicious IPs
 */
router.get('/security/suspicious-ips', async (req, res) => {
  try {
    const ips = securityHardeningSystem.getSuspiciousIPs();
    
    res.json({
      success: true,
      data: ips
    });
  } catch (error) {
    console.error('Get suspicious IPs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suspicious IPs'
    });
  }
});

/**
 * DELETE /api/security/suspicious-ips/:ip
 * Remove suspicious IP
 */
router.delete('/security/suspicious-ips/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    
    const removed = securityHardeningSystem.removeSuspiciousIP(ip);
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Suspicious IP not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Suspicious IP removed successfully'
    });
  } catch (error) {
    console.error('Remove suspicious IP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove suspicious IP'
    });
  }
});

// ============================================================================
// LEGACY ENDPOINTS (for backward compatibility)
// ============================================================================

/**
 * POST /api/ai/generate/seo-questions
 * Generate SEO questions (legacy)
 */
router.post('/ai/generate/seo-questions', async (req, res) => {
  try {
    const { topic, count = 5, agentType = 'beginner' } = req.body;
    
    const questions = await generateSeoQuestions(topic, count, agentType);
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('SEO questions generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate SEO questions'
    });
  }
});

/**
 * POST /api/ai/generate/answer
 * Generate answer (legacy)
 */
router.post('/ai/generate/answer', async (req, res) => {
  try {
    const { questionTitle, questionContent, agentType = 'expert' } = req.body;
    
    const answer = await generateAnswer(questionTitle, questionContent, agentType);
    
    res.json({
      success: true,
      data: { answer }
    });
  } catch (error) {
    console.error('Answer generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate answer'
    });
  }
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const providerStatuses = aiProviderGateway.getAllProviderStatuses();
    const healthyProviders = providerStatuses.filter(p => p.isHealthy).length;
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      providers: {
        total: providerStatuses.length,
        healthy: healthyProviders,
        unhealthy: providerStatuses.length - healthyProviders
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed'
    });
  }
});

// Polar.sh Integration Endpoints
router.get('/users/subscription', async (req, res) => {
  try {
    // Get user ID from Clerk auth (you'll need to implement this)
    const userId = req.user?.id; // This should be set by Clerk middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // For now, return a mock subscription until we implement Clerk user mapping
    // In production, you would map Clerk user ID to Polar customer ID
    const mockSubscription = {
      id: 'sub_mock_' + userId,
      plan: 'starter',
      status: 'active',
      planActiveUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      details: {
        hosted_portal_url: 'https://polar.sh/dashboard',
        cancel_url: 'https://polar.sh/dashboard'
      }
    };

    res.json({
      success: true,
      data: mockSubscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription data',
      details: error.message
    });
  }
});

router.get('/users/billing-history', async (req, res) => {
  try {
    // Get user ID from Clerk auth
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // For now, return mock billing history
    // In production, you would fetch from Polar.sh API
    const mockBillingHistory = [
      {
        id: 'inv_1',
        amount: 29900, // $299 in cents
        currency: 'usd',
        status: 'paid',
        description: 'GEOFORA Starter Plan - Monthly',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        invoiceUrl: 'https://polar.sh/dashboard'
      },
      {
        id: 'inv_2',
        amount: 100000, // $1000 in cents
        currency: 'usd',
        status: 'paid',
        description: 'GEOFORA Setup Fee',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        invoiceUrl: 'https://polar.sh/dashboard'
      }
    ];

    res.json({
      success: true,
      data: mockBillingHistory
    });
  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get billing history',
      details: error.message
    });
  }
});

export default router;

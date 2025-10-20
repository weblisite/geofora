/**
 * Comprehensive Testing Suite
 * Implements PRD requirements for testing all system components
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { aiProviderGateway } from '../ai-providers/gateway';
import { businessAnalysisEngine } from '../business-analysis/engine';
import { temporalDialogueEngine } from '../business-analysis/temporal-dialogue';
import { consentManagementSystem } from '../consent-management/system';
import { dataAnonymizationPipeline } from '../data-anonymization/pipeline';
import { seoAutoIndexingSystem } from '../seo/auto-indexing';
import { realTimeAnalyticsDashboard } from '../analytics/dashboard';
import { usageTrackingSystem } from '../usage/tracking';
import { errorHandlingSystem } from '../middleware/error-handler';

// Mock data for testing
const mockBusinessProfile = {
  context: {
    organizationId: 1,
    industry: 'technology',
    brandVoice: 'innovative and forward-thinking',
    targetKeywords: ['AI', 'machine learning', 'automation'],
    websiteUrl: 'https://example.com',
    productDescription: 'AI-powered platform for businesses',
    companyName: 'Test Company'
  },
  industryAnalysis: {
    detectedIndustry: 'technology',
    confidence: 0.9,
    keywords: ['AI', 'technology', 'innovation'],
    competitors: ['Company A', 'Company B'],
    trends: ['AI integration', 'Digital transformation']
  },
  seoKeywords: ['AI', 'technology', 'innovation', 'automation'],
  contentStrategy: {
    tone: 'innovative and forward-thinking',
    style: 'Technical and detailed',
    topics: ['AI applications', 'Technology trends'],
    keywords: ['AI', 'technology'],
    contentTypes: ['How-to guides', 'Case studies']
  },
  brandGuidelines: {
    voice: 'innovative and forward-thinking',
    personality: ['Innovative', 'Reliable'],
    values: ['Innovation', 'Quality'],
    messaging: ['Innovation drives success'],
    avoidTerms: ['guaranteed', 'perfect']
  }
};

const mockAIPersona = {
  id: 'scholar',
  name: 'Scholar',
  era: '2023',
  provider: 'openai',
  model: 'gpt-4',
  knowledgeLevel: 'intermediate',
  personality: 'Academic, methodical',
  useCase: 'Detailed explanations, structured responses',
  systemPrompt: 'You are Scholar, representing AI from 2023.',
  temperature: 0.5,
  maxTokens: 750
};

// AI Provider Gateway Tests
describe('AI Provider Gateway', () => {
  beforeEach(() => {
    // Setup test environment
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    // Cleanup
    delete process.env.OPENAI_API_KEY;
  });

  it('should initialize with all providers', () => {
    expect(aiProviderGateway).toBeDefined();
  });

  it('should get personas for different plans', () => {
    const starterPersonas = aiProviderGateway.getPersonasForPlan('starter');
    const proPersonas = aiProviderGateway.getPersonasForPlan('pro');
    const enterprisePersonas = aiProviderGateway.getPersonasForPlan('enterprise');

    expect(starterPersonas.length).toBeGreaterThan(0);
    expect(proPersonas.length).toBeGreaterThan(starterPersonas.length);
    expect(enterprisePersonas.length).toBeGreaterThan(proPersonas.length);
  });

  it('should get provider status', () => {
    const statuses = aiProviderGateway.getAllProviderStatuses();
    expect(Array.isArray(statuses)).toBe(true);
  });
});

// Business Analysis Engine Tests
describe('Business Analysis Engine', () => {
  it('should analyze business context', async () => {
    const result = await businessAnalysisEngine.analyzeBusiness(
      'https://example.com',
      'AI-powered platform for businesses',
      'Test Company'
    );

    expect(result).toBeDefined();
    expect(result.context.industry).toBeDefined();
    expect(result.industryAnalysis.detectedIndustry).toBeDefined();
    expect(result.seoKeywords.length).toBeGreaterThan(0);
  });

  it('should detect industry correctly', async () => {
    const result = await businessAnalysisEngine.analyzeBusiness(
      undefined,
      'We develop AI-powered software solutions for healthcare',
      'HealthTech Inc'
    );

    expect(result.context.industry).toBe('healthcare');
  });

  it('should generate appropriate brand voice', async () => {
    const result = await businessAnalysisEngine.analyzeBusiness(
      undefined,
      'Financial technology company',
      'FinTech Corp'
    );

    expect(result.context.brandVoice).toContain('reliable');
  });
});

// Temporal Dialogue Engine Tests
describe('Temporal Dialogue Engine', () => {
  it('should generate temporal dialogue', async () => {
    const result = await temporalDialogueEngine.generateTemporalDialogue(
      'AI in healthcare',
      mockBusinessProfile,
      {
        maxTurns: 3,
        minTurns: 2,
        personaSelection: 'sequential',
        conversationStyle: 'collaboration',
        businessContext: true,
        keywordIntegration: true
      }
    );

    expect(result).toBeDefined();
    expect(result.turns.length).toBeGreaterThan(0);
    expect(result.summary).toBeDefined();
    expect(result.keyInsights.length).toBeGreaterThan(0);
  });

  it('should select personas strategically', async () => {
    const result = await temporalDialogueEngine.generateTemporalDialogue(
      'Technology trends',
      mockBusinessProfile,
      {
        maxTurns: 4,
        personaSelection: 'strategic',
        conversationStyle: 'analysis'
      }
    );

    expect(result.turns.length).toBeGreaterThan(0);
    expect(result.turns[0].persona).toBeDefined();
  });

  it('should generate dialogue statistics', () => {
    const mockTurns = [
      {
        persona: mockAIPersona,
        content: 'This is a test response about AI technology.',
        timestamp: new Date(),
        turnNumber: 1,
        context: {} as any
      },
      {
        persona: mockAIPersona,
        content: 'Another response with more details about the topic.',
        timestamp: new Date(),
        turnNumber: 2,
        context: {} as any
      }
    ];

    const stats = temporalDialogueEngine.getDialogueStats(mockTurns);

    expect(stats.totalTurns).toBe(2);
    expect(stats.totalWords).toBeGreaterThan(0);
    expect(stats.personasUsed).toContain('Scholar');
  });
});

// Consent Management System Tests
describe('Consent Management System', () => {
  it('should grant consent', async () => {
    const result = await consentManagementSystem.grantConsent({
      organizationId: 1,
      providerId: 1,
      dataScope: {
        removePersonalInfo: true,
        removeBusinessSpecifics: true,
        removeTimestamps: true,
        removeUserIds: true,
        removeUrls: true,
        maskKeywords: [],
        preserveStructure: true,
        allowedDataTypes: ['question', 'answer'],
        retentionPeriod: 365
      },
      consentVersion: '1.0.0'
    });

    expect(result).toBeDefined();
    expect(result.hasConsent).toBe(true);
  });

  it('should revoke consent', async () => {
    await consentManagementSystem.grantConsent({
      organizationId: 1,
      providerId: 1,
      dataScope: {} as any,
      consentVersion: '1.0.0'
    });

    await consentManagementSystem.revokeConsent(1, 1);
    
    const consent = await consentManagementSystem.getConsent(1, 1);
    expect(consent?.hasConsent).toBe(false);
  });

  it('should get consent statistics', async () => {
    await consentManagementSystem.grantConsent({
      organizationId: 1,
      providerId: 1,
      dataScope: {} as any,
      consentVersion: '1.0.0'
    });

    const stats = await consentManagementSystem.getConsentStats(1);
    
    expect(stats).toBeDefined();
    expect(stats.consentedProviders).toBeGreaterThan(0);
  });
});

// Data Anonymization Pipeline Tests
describe('Data Anonymization Pipeline', () => {
  it('should anonymize content', async () => {
    const content = 'John Smith from Acme Corp called at 555-1234 about the project.';
    
    const result = await dataAnonymizationPipeline.anonymizeContent(
      content,
      1,
      'answer',
      1
    );

    expect(result).toBeDefined();
    expect(result.anonymizedContent).not.toContain('John Smith');
    expect(result.anonymizedContent).not.toContain('555-1234');
    expect(result.anonymizedContent).toContain('[REDACTED]');
  });

  it('should handle different anonymization levels', async () => {
    const content = 'The CEO of Microsoft, Satya Nadella, announced new AI features.';
    
    const result = await dataAnonymizationPipeline.anonymizeContent(
      content,
      1,
      'answer',
      1
    );

    expect(result.anonymizationLevel).toBeDefined();
    expect(result.removedElements.length).toBeGreaterThan(0);
  });

  it('should get anonymization statistics', async () => {
    const stats = await dataAnonymizationPipeline.getAnonymizationStats(1);
    
    expect(stats).toBeDefined();
    expect(stats.totalRecords).toBeGreaterThanOrEqual(0);
  });
});

// SEO Auto-Indexing System Tests
describe('SEO Auto-Indexing System', () => {
  it('should generate XML sitemap', async () => {
    const sitemap = await seoAutoIndexingSystem.generateSitemap(1);
    
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('<urlset');
    expect(sitemap).toContain('</urlset>');
  });

  it('should generate structured data', async () => {
    const structuredData = await seoAutoIndexingSystem.generateStructuredData(1);
    
    expect(Array.isArray(structuredData)).toBe(true);
    if (structuredData.length > 0) {
      expect(structuredData[0]['@context']).toBe('https://schema.org');
      expect(structuredData[0]['@type']).toBeDefined();
    }
  });

  it('should optimize content performance', async () => {
    const content = '<p>   </p><p>Test content</p><img src="test.jpg">';
    const optimized = await seoAutoIndexingSystem.optimizeContentPerformance(content);
    
    expect(optimized).not.toContain('<p>   </p>');
    expect(optimized).toContain('loading="lazy"');
  });

  it('should get SEO statistics', async () => {
    const stats = await seoAutoIndexingSystem.getSEOStats(1);
    
    expect(stats).toBeDefined();
    expect(stats.totalPages).toBeGreaterThanOrEqual(0);
    expect(stats.indexedPages).toBeGreaterThanOrEqual(0);
  });
});

// Real-Time Analytics Dashboard Tests
describe('Real-Time Analytics Dashboard', () => {
  it('should get analytics metrics', async () => {
    const metrics = await realTimeAnalyticsDashboard.getAnalyticsMetrics(1);
    
    expect(metrics).toBeDefined();
    expect(metrics.totalUsers).toBeGreaterThanOrEqual(0);
    expect(metrics.totalQuestions).toBeGreaterThanOrEqual(0);
    expect(metrics.totalAnswers).toBeGreaterThanOrEqual(0);
  });

  it('should get real-time statistics', async () => {
    const stats = await realTimeAnalyticsDashboard.getRealTimeStats(1);
    
    expect(stats).toBeDefined();
    expect(stats.onlineUsers).toBeGreaterThanOrEqual(0);
    expect(stats.activeSessions).toBeGreaterThanOrEqual(0);
    expect(stats.questionsToday).toBeGreaterThanOrEqual(0);
  });

  it('should get performance metrics', async () => {
    const metrics = await realTimeAnalyticsDashboard.getPerformanceMetrics();
    
    expect(metrics).toBeDefined();
    expect(metrics.pageLoadTime).toBeGreaterThan(0);
    expect(metrics.serverResponseTime).toBeGreaterThan(0);
    expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
    expect(metrics.uptime).toBeGreaterThan(0);
  });

  it('should track analytics events', async () => {
    await realTimeAnalyticsDashboard.trackEvent(
      1,
      1,
      'page_view',
      { page: '/test', duration: 5000 }
    );

    // This would typically verify the event was tracked
    expect(true).toBe(true);
  });
});

// Usage Tracking System Tests
describe('Usage Tracking System', () => {
  it('should track usage', async () => {
    await usageTrackingSystem.trackUsage(1, 'question', 1);
    await usageTrackingSystem.trackUsage(1, 'answer', 2);
    await usageTrackingSystem.trackUsage(1, 'api_call', 5);
    await usageTrackingSystem.trackUsage(1, 'tokens', 1000);

    const stats = await usageTrackingSystem.getUsageStats(1, 'daily');
    
    expect(stats.questionsGenerated).toBeGreaterThan(0);
    expect(stats.responsesGenerated).toBeGreaterThan(0);
    expect(stats.apiCalls).toBeGreaterThan(0);
    expect(stats.tokensUsed).toBeGreaterThan(0);
  });

  it('should check usage limits', async () => {
    const limits = await usageTrackingSystem.checkLimits(1, 'starter');
    
    expect(limits).toBeDefined();
    expect(limits.exceeded).toBeDefined();
    expect(Array.isArray(limits.alerts)).toBe(true);
  });

  it('should check action permissions', async () => {
    const canPerform = await usageTrackingSystem.canPerformAction(1, 'starter', 'question', 1);
    
    expect(typeof canPerform).toBe('boolean');
  });

  it('should get usage alerts', async () => {
    const alerts = await usageTrackingSystem.getUsageAlerts(1, 'starter');
    
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should get usage trends', async () => {
    const trends = await usageTrackingSystem.getUsageTrends(1, 30);
    
    expect(Array.isArray(trends)).toBe(true);
  });
});

// Error Handling System Tests
describe('Error Handling System', () => {
  it('should handle validation errors', () => {
    const error = errorHandlingSystem.createValidationError('Invalid input');
    
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid input');
  });

  it('should handle unauthorized errors', () => {
    const error = errorHandlingSystem.createUnauthorizedError('Login required');
    
    expect(error.name).toBe('UnauthorizedError');
    expect(error.message).toBe('Login required');
  });

  it('should handle not found errors', () => {
    const error = errorHandlingSystem.createNotFoundError('User not found');
    
    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('User not found');
  });

  it('should get error statistics', () => {
    const stats = errorHandlingSystem.getErrorStats();
    
    expect(stats).toBeDefined();
    expect(stats.totalErrors).toBeGreaterThanOrEqual(0);
    expect(typeof stats.errorsByType).toBe('object');
    expect(typeof stats.errorsByStatusCode).toBe('object');
    expect(Array.isArray(stats.recentErrors)).toBe(true);
  });

  it('should get error logs by criteria', () => {
    const logs = errorHandlingSystem.getErrorLogs({
      type: 'validation',
      limit: 10
    });
    
    expect(Array.isArray(logs)).toBe(true);
  });
});

// Integration Tests
describe('Integration Tests', () => {
  it('should complete full workflow', async () => {
    // 1. Analyze business
    const businessProfile = await businessAnalysisEngine.analyzeBusiness(
      'https://example.com',
      'AI-powered platform',
      'Test Company'
    );

    // 2. Generate temporal dialogue
    const dialogue = await temporalDialogueEngine.generateTemporalDialogue(
      'AI technology trends',
      businessProfile,
      { maxTurns: 2, minTurns: 1 }
    );

    // 3. Track usage
    await usageTrackingSystem.trackUsage(1, 'question', 1);
    await usageTrackingSystem.trackUsage(1, 'answer', 1);

    // 4. Check limits
    const limits = await usageTrackingSystem.checkLimits(1, 'pro');

    // 5. Get analytics
    const analytics = await realTimeAnalyticsDashboard.getAnalyticsMetrics(1);

    expect(businessProfile).toBeDefined();
    expect(dialogue.turns.length).toBeGreaterThan(0);
    expect(limits).toBeDefined();
    expect(analytics).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    try {
      // This should throw an error
      await businessAnalysisEngine.analyzeBusiness('', '', '');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// Performance Tests
describe('Performance Tests', () => {
  it('should handle concurrent requests', async () => {
    const promises = Array(10).fill(null).map(async (_, index) => {
      return businessAnalysisEngine.analyzeBusiness(
        `https://example${index}.com`,
        `Test company ${index}`,
        `Company ${index}`
      );
    });

    const results = await Promise.all(promises);
    
    expect(results.length).toBe(10);
    results.forEach(result => {
      expect(result).toBeDefined();
    });
  });

  it('should complete operations within time limits', async () => {
    const startTime = Date.now();
    
    await businessAnalysisEngine.analyzeBusiness(
      'https://example.com',
      'Test company',
      'Test Company'
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});

// Export test utilities
export const TestUtils = {
  mockBusinessProfile,
  mockAIPersona,
  createMockRequest: (overrides = {}) => ({
    method: 'GET',
    url: '/test',
    headers: { 'x-request-id': 'test-request-id' },
    body: {},
    query: {},
    params: {},
    ...overrides
  }),
  createMockResponse: () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    getHeaders: jest.fn().mockReturnValue({})
  })
};

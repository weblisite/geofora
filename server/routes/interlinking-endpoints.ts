/**
 * Interlinking API Endpoints
 * Provides backend support for content interlinking features
 */

import express from 'express';
import { z } from 'zod';
import { requireClerkAuth } from '../clerk-auth';
import { storage } from '../storage';

const router = express.Router();

// ============================================================================
// INTERLINKING API ENDPOINTS
// ============================================================================

// Interlinking suggestion schema
const interlinkingSuggestionSchema = z.object({
  id: z.string(),
  sourceId: z.number(),
  targetId: z.number(),
  sourceType: z.enum(['question', 'answer', 'main-page']),
  targetType: z.enum(['question', 'answer', 'main-page']),
  relevanceScore: z.number(),
  anchorText: z.string(),
  context: z.string(),
  userIntentAlignment: z.number().optional(),
  seoImpact: z.number().optional(),
  preview: z.string().optional(),
});

// Get interlinking suggestions for content
router.get('/api/interlinking/suggestions', requireClerkAuth, async (req, res) => {
  try {
    const { contentId, contentType, limit = 10 } = req.query;
    
    if (!contentId || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'contentId and contentType are required'
      });
    }

    // Mock suggestions for now - in production, this would use AI to generate suggestions
    const suggestions = [
      {
        id: '1',
        sourceId: parseInt(contentId as string),
        targetId: 1,
        sourceType: contentType as string,
        targetType: 'question',
        relevanceScore: 0.95,
        anchorText: 'How to optimize SEO',
        context: 'Related to search engine optimization',
        userIntentAlignment: 0.9,
        seoImpact: 0.8,
        preview: 'Learn about SEO optimization techniques...',
      },
      {
        id: '2',
        sourceId: parseInt(contentId as string),
        targetId: 2,
        sourceType: contentType as string,
        targetType: 'answer',
        relevanceScore: 0.87,
        anchorText: 'Best practices for content marketing',
        context: 'Content marketing strategies',
        userIntentAlignment: 0.85,
        seoImpact: 0.75,
        preview: 'Discover effective content marketing strategies...',
      },
      {
        id: '3',
        sourceId: parseInt(contentId as string),
        targetId: 3,
        sourceType: contentType as string,
        targetType: 'main-page',
        relevanceScore: 0.82,
        anchorText: 'Digital marketing guide',
        context: 'Comprehensive digital marketing resource',
        userIntentAlignment: 0.8,
        seoImpact: 0.7,
        preview: 'Complete guide to digital marketing...',
      },
    ].slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching interlinking suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interlinking suggestions'
    });
  }
});

// Apply interlink
router.post('/api/interlinking/apply', requireClerkAuth, async (req, res) => {
  try {
    const { sourceId, targetId, anchorText, sourceType, targetType } = req.body;

    if (!sourceId || !targetId || !anchorText) {
      return res.status(400).json({
        success: false,
        error: 'sourceId, targetId, and anchorText are required'
      });
    }

    // In production, this would create the actual interlink in the database
    const interlink = {
      id: Date.now().toString(),
      sourceId,
      targetId,
      anchorText,
      sourceType: sourceType || 'question',
      targetType: targetType || 'question',
      createdAt: new Date(),
      createdBy: req.user?.id,
    };

    res.json({
      success: true,
      data: interlink
    });
  } catch (error) {
    console.error('Error applying interlink:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply interlink'
    });
  }
});

// Get interlinking analytics
router.get('/api/interlinking/analytics', requireClerkAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Mock analytics data
    const analytics = {
      totalInterlinks: 156,
      activeInterlinks: 142,
      brokenInterlinks: 14,
      topPerformingAnchors: [
        { anchorText: 'SEO optimization', clicks: 45, conversions: 12 },
        { anchorText: 'Content marketing', clicks: 38, conversions: 8 },
        { anchorText: 'Digital strategy', clicks: 32, conversions: 6 },
      ],
      interlinkPerformance: {
        forumToForum: { count: 89, avgRelevance: 0.87 },
        forumToMain: { count: 45, avgRelevance: 0.82 },
        mainToForum: { count: 22, avgRelevance: 0.79 },
      },
      seoImpact: {
        organicTrafficIncrease: 23.5,
        averageRankingImprovement: 2.3,
        clickThroughRateIncrease: 15.2,
      },
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching interlinking analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interlinking analytics'
    });
  }
});

// Get content for interlinking
router.get('/api/interlinking/content', requireClerkAuth, async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;

    let content = [];

    if (type === 'questions' || !type) {
      const questions = await storage.getAllQuestions(parseInt(limit as string));
      content = content.concat(questions.map(q => ({
        id: q.id,
        type: 'question',
        title: q.title,
        content: q.content,
        createdAt: q.createdAt,
      })));
    }

    if (type === 'answers' || !type) {
      const answers = await storage.getAllAnswers(parseInt(limit as string));
      content = content.concat(answers.map(a => ({
        id: a.id,
        type: 'answer',
        title: `Answer to question ${a.questionId}`,
        content: a.content,
        createdAt: a.createdAt,
      })));
    }

    if (type === 'main-pages' || !type) {
      const mainPages = await storage.getAllMainSitePages();
      content = content.concat(mainPages.map(p => ({
        id: p.id,
        type: 'main-page',
        title: p.title,
        content: p.content,
        createdAt: p.createdAt,
      })));
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content for interlinking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content for interlinking'
    });
  }
});

// Remove interlink
router.delete('/api/interlinking/:id', requireClerkAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // In production, this would remove the interlink from the database
    res.json({
      success: true,
      message: 'Interlink removed successfully'
    });
  } catch (error) {
    console.error('Error removing interlink:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove interlink'
    });
  }
});

export default router;

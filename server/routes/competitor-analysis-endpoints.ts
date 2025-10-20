import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireClerkAuth } from '../clerk-auth';

const router = express.Router();

// Get competitor analysis
router.get('/competitor-analysis', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analysis = await storage.getCompetitorAnalysis(userId, forumId as string, period as string);
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching competitor analysis:', error);
    res.status(500).json({ error: 'Failed to fetch competitor analysis' });
  }
});

// Get tracked competitors
router.get('/competitors', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const competitors = await storage.getTrackedCompetitors(userId, forumId as string);
    res.json(competitors);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    res.status(500).json({ error: 'Failed to fetch competitors' });
  }
});

// Add competitor
router.post('/competitors', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, name, domain, industry, description } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const competitor = await storage.addCompetitor(userId, {
      forumId: parseInt(forumId),
      name,
      domain,
      industry,
      description
    });
    res.json(competitor);
  } catch (error) {
    console.error('Error adding competitor:', error);
    res.status(500).json({ error: 'Failed to add competitor' });
  }
});

// Update competitor
router.put('/competitors/:id', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const updateData = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const competitor = await storage.updateCompetitor(userId, parseInt(id), updateData);
    res.json(competitor);
  } catch (error) {
    console.error('Error updating competitor:', error);
    res.status(500).json({ error: 'Failed to update competitor' });
  }
});

// Delete competitor
router.delete('/competitors/:id', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await storage.deleteCompetitor(userId, parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting competitor:', error);
    res.status(500).json({ error: 'Failed to delete competitor' });
  }
});

// Analyze competitors
router.post('/competitor-analysis/analyze', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, competitors, period } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analysis = await storage.analyzeCompetitors(userId, forumId, competitors, period);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing competitors:', error);
    res.status(500).json({ error: 'Failed to analyze competitors' });
  }
});

// Get competitor insights
router.get('/competitor-insights', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const insights = await storage.getCompetitorInsights(userId, forumId as string, period as string);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching competitor insights:', error);
    res.status(500).json({ error: 'Failed to fetch competitor insights' });
  }
});

// Get keyword gaps
router.get('/competitor-analysis/keyword-gaps', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period, limit } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gaps = await storage.getKeywordGaps(userId, forumId as string, period as string, parseInt(limit as string) || 50);
    res.json(gaps);
  } catch (error) {
    console.error('Error fetching keyword gaps:', error);
    res.status(500).json({ error: 'Failed to fetch keyword gaps' });
  }
});

// Get content gaps
router.get('/competitor-analysis/content-gaps', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period, limit } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gaps = await storage.getContentGaps(userId, forumId as string, period as string, parseInt(limit as string) || 50);
    res.json(gaps);
  } catch (error) {
    console.error('Error fetching content gaps:', error);
    res.status(500).json({ error: 'Failed to fetch content gaps' });
  }
});

// Export competitor analysis
router.post('/competitor-analysis/export', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, format } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const exportData = await storage.exportCompetitorAnalysis(userId, forumId, format);
    
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="competitor-analysis-${forumId}.${format}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting competitor analysis:', error);
    res.status(500).json({ error: 'Failed to export competitor analysis' });
  }
});

// Get competitor metrics
router.get('/competitors/:id/metrics', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const { period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const metrics = await storage.getCompetitorMetrics(userId, parseInt(id), period as string);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching competitor metrics:', error);
    res.status(500).json({ error: 'Failed to fetch competitor metrics' });
  }
});

// Track competitor keyword
router.post('/competitors/:id/keywords', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const { keyword, position, volume } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const keywordData = await storage.trackCompetitorKeyword(userId, parseInt(id), {
      keyword,
      position,
      volume
    });
    res.json(keywordData);
  } catch (error) {
    console.error('Error tracking competitor keyword:', error);
    res.status(500).json({ error: 'Failed to track competitor keyword' });
  }
});

export default router;

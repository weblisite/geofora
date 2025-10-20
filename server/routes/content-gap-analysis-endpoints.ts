import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireClerkAuth } from '../clerk-auth';

const router = express.Router();

// Get content gap analysis
router.get('/content-gaps/analysis', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analysis = await storage.getContentGapAnalysis(userId, forumId as string, period as string);
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching content gap analysis:', error);
    res.status(500).json({ error: 'Failed to fetch content gap analysis' });
  }
});

// Get content gaps
router.get('/content-gaps', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, priority, status, contentType, sortBy, sortOrder } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gaps = await storage.getContentGaps(userId, {
      forumId: forumId as string,
      priority: priority as string,
      status: status as string,
      contentType: contentType as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string
    });
    res.json(gaps);
  } catch (error) {
    console.error('Error fetching content gaps:', error);
    res.status(500).json({ error: 'Failed to fetch content gaps' });
  }
});

// Analyze content gaps
router.post('/content-gaps/analyze', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, industry, period } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analysis = await storage.analyzeContentGaps(userId, forumId, industry, period);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing content gaps:', error);
    res.status(500).json({ error: 'Failed to analyze content gaps' });
  }
});

// Update content gap status
router.patch('/content-gaps/:id/status', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const { status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gap = await storage.updateContentGapStatus(userId, parseInt(id), status);
    res.json(gap);
  } catch (error) {
    console.error('Error updating content gap status:', error);
    res.status(500).json({ error: 'Failed to update content gap status' });
  }
});

// Update content gap
router.put('/content-gaps/:id', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const updateData = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gap = await storage.updateContentGap(userId, parseInt(id), updateData);
    res.json(gap);
  } catch (error) {
    console.error('Error updating content gap:', error);
    res.status(500).json({ error: 'Failed to update content gap' });
  }
});

// Delete content gap
router.delete('/content-gaps/:id', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await storage.deleteContentGap(userId, parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting content gap:', error);
    res.status(500).json({ error: 'Failed to delete content gap' });
  }
});

// Export content gap analysis
router.post('/content-gaps/export', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, format } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const exportData = await storage.exportContentGapAnalysis(userId, forumId, format);
    
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="content-gap-analysis-${forumId}.${format}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting content gap analysis:', error);
    res.status(500).json({ error: 'Failed to export content gap analysis' });
  }
});

// Get content gap insights
router.get('/content-gaps/insights', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const insights = await storage.getContentGapInsights(userId, forumId as string, period as string);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching content gap insights:', error);
    res.status(500).json({ error: 'Failed to fetch content gap insights' });
  }
});

// Get content gap trends
router.get('/content-gaps/trends', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const trends = await storage.getContentGapTrends(userId, forumId as string, period as string);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching content gap trends:', error);
    res.status(500).json({ error: 'Failed to fetch content gap trends' });
  }
});

// Create content gap
router.post('/content-gaps', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const gapData = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gap = await storage.createContentGap(userId, gapData);
    res.json(gap);
  } catch (error) {
    console.error('Error creating content gap:', error);
    res.status(500).json({ error: 'Failed to create content gap' });
  }
});

// Get content gap by ID
router.get('/content-gaps/:id', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gap = await storage.getContentGapById(userId, parseInt(id));
    res.json(gap);
  } catch (error) {
    console.error('Error fetching content gap:', error);
    res.status(500).json({ error: 'Failed to fetch content gap' });
  }
});

export default router;

import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireClerkAuth } from '../clerk-auth';

const router = express.Router();

// Get SEO reports
router.get('/seo/reports', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, dateRange } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reports = await storage.getSeoReports(userId, forumId as string, dateRange as string);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching SEO reports:', error);
    res.status(500).json({ error: 'Failed to fetch SEO reports' });
  }
});

// Get latest SEO report
router.get('/seo/reports/latest', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const report = await storage.getLatestSeoReport(userId, forumId as string);
    res.json(report);
  } catch (error) {
    console.error('Error fetching latest SEO report:', error);
    res.status(500).json({ error: 'Failed to fetch latest SEO report' });
  }
});

// Generate SEO report
router.post('/seo/reports/generate', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, dateRange, template, format } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const report = await storage.generateSeoReport(userId, forumId, dateRange, template, format);
    res.json(report);
  } catch (error) {
    console.error('Error generating SEO report:', error);
    res.status(500).json({ error: 'Failed to generate SEO report' });
  }
});

// Export SEO report
router.post('/seo/reports/export', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { reportId, format } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const exportData = await storage.exportSeoReport(userId, reportId, format);
    
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="seo-report-${reportId}.${format}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting SEO report:', error);
    res.status(500).json({ error: 'Failed to export SEO report' });
  }
});

// Email SEO report
router.post('/seo/reports/email', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { reportId, recipients } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await storage.emailSeoReport(userId, reportId, recipients);
    res.json({ success: true });
  } catch (error) {
    console.error('Error emailing SEO report:', error);
    res.status(500).json({ error: 'Failed to email SEO report' });
  }
});

// Get report templates
router.get('/seo/report-templates', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const templates = await storage.getSeoReportTemplates(userId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching SEO report templates:', error);
    res.status(500).json({ error: 'Failed to fetch SEO report templates' });
  }
});

// Create report template
router.post('/seo/report-templates', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { name, description, sections, isDefault } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = await storage.createSeoReportTemplate(userId, {
      name,
      description,
      sections,
      isDefault
    });
    res.json(template);
  } catch (error) {
    console.error('Error creating SEO report template:', error);
    res.status(500).json({ error: 'Failed to create SEO report template' });
  }
});

// Get SEO metrics
router.get('/seo/metrics', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const metrics = await storage.getSeoMetrics(userId, forumId as string, period as string);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching SEO metrics:', error);
    res.status(500).json({ error: 'Failed to fetch SEO metrics' });
  }
});

// Get keyword rankings
router.get('/seo/keywords', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period, limit } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const keywords = await storage.getSeoKeywords(userId, forumId as string, period as string, parseInt(limit as string) || 50);
    res.json(keywords);
  } catch (error) {
    console.error('Error fetching SEO keywords:', error);
    res.status(500).json({ error: 'Failed to fetch SEO keywords' });
  }
});

// Get competitor analysis
router.get('/seo/competitors', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { forumId, period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const competitors = await storage.getSeoCompetitors(userId, forumId as string, period as string);
    res.json(competitors);
  } catch (error) {
    console.error('Error fetching SEO competitors:', error);
    res.status(500).json({ error: 'Failed to fetch SEO competitors' });
  }
});

export default router;

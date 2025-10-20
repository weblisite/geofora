import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireClerkAuth } from '../clerk-auth';

const router = express.Router();

// Analytics Overview
router.get('/analytics/overview', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const overview = await storage.getAnalyticsOverview(userId);
    res.json(overview);
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// Time Series Analytics
router.get('/analytics/timeseries', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { period = '7d', metric = 'views' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeseries = await storage.getAnalyticsTimeseries(userId, period as string, metric as string);
    res.json(timeseries);
  } catch (error) {
    console.error('Error fetching timeseries analytics:', error);
    res.status(500).json({ error: 'Failed to fetch timeseries analytics' });
  }
});

// Device Analytics
router.get('/analytics/devices', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { period = '30d' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const devices = await storage.getAnalyticsDevices(userId, period as string);
    res.json(devices);
  } catch (error) {
    console.error('Error fetching device analytics:', error);
    res.status(500).json({ error: 'Failed to fetch device analytics' });
  }
});

// Geography Analytics
router.get('/analytics/geography', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { period = '30d' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const geography = await storage.getAnalyticsGeography(userId, period as string);
    res.json(geography);
  } catch (error) {
    console.error('Error fetching geography analytics:', error);
    res.status(500).json({ error: 'Failed to fetch geography analytics' });
  }
});

// Traffic Sources Analytics
router.get('/analytics/sources', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { period = '30d' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sources = await storage.getAnalyticsSources(userId, period as string);
    res.json(sources);
  } catch (error) {
    console.error('Error fetching sources analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sources analytics' });
  }
});

// Content Performance Analytics
router.get('/analytics/content', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { period = '30d', limit = '10' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const content = await storage.getAnalyticsContent(userId, period as string, parseInt(limit as string));
    res.json(content);
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ error: 'Failed to fetch content analytics' });
  }
});

// Conversion Funnel Analytics
router.get('/analytics/funnel', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { period = '30d' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const funnel = await storage.getAnalyticsFunnel(userId, period as string);
    res.json(funnel);
  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    res.status(500).json({ error: 'Failed to fetch funnel analytics' });
  }
});

// Report Templates
router.get('/analytics/report-templates', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const templates = await storage.getAnalyticsReportTemplates(userId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({ error: 'Failed to fetch report templates' });
  }
});

// Generate Report Data
router.post('/analytics/report-data', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { templateId, dateRange, metrics } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reportData = await storage.generateAnalyticsReport(userId, templateId, dateRange, metrics);
    res.json(reportData);
  } catch (error) {
    console.error('Error generating report data:', error);
    res.status(500).json({ error: 'Failed to generate report data' });
  }
});

// Real-time Analytics
router.get('/analytics/realtime', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const realtime = await storage.getRealtimeAnalytics(userId);
    res.json(realtime);
  } catch (error) {
    console.error('Error fetching realtime analytics:', error);
    res.status(500).json({ error: 'Failed to fetch realtime analytics' });
  }
});

// Export Analytics Data
router.post('/analytics/export', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { format = 'csv', dateRange, metrics } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const exportData = await storage.exportAnalyticsData(userId, format, dateRange, metrics);
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-export.${format}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

export default router;

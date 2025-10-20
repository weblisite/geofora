import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireClerkAuth } from '../clerk-auth';

const router = express.Router();

// Connect Google Search Console
router.post('/gsc/connect', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { websiteUrl, accessToken } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In a real implementation, you would:
    // 1. Verify the access token with Google
    // 2. Get the list of properties from GSC API
    // 3. Store the connection details securely
    
    const connection = await storage.createGSCConnection(userId, {
      websiteUrl,
      accessToken: 'encrypted_token_here', // Should be encrypted
      connectedAt: new Date().toISOString(),
      status: 'active'
    });

    res.json(connection);
  } catch (error) {
    console.error('Error connecting Google Search Console:', error);
    res.status(500).json({ error: 'Failed to connect Google Search Console' });
  }
});

// Disconnect Google Search Console
router.delete('/gsc/disconnect', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await storage.disconnectGSC(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Search Console:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Search Console' });
  }
});

// Get GSC connection status
router.get('/gsc/status', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await storage.getGSCStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Error fetching GSC status:', error);
    res.status(500).json({ error: 'Failed to fetch GSC status' });
  }
});

// Get GSC properties
router.get('/gsc/properties', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const properties = await storage.getGSCProperties(userId);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching GSC properties:', error);
    res.status(500).json({ error: 'Failed to fetch GSC properties' });
  }
});

// Sync GSC data
router.post('/gsc/sync', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { propertyId, dateRange } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const syncResult = await storage.syncGSCData(userId, propertyId, dateRange);
    res.json(syncResult);
  } catch (error) {
    console.error('Error syncing GSC data:', error);
    res.status(500).json({ error: 'Failed to sync GSC data' });
  }
});

// Get search performance data
router.get('/gsc/performance', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { propertyId, dateRange, deviceType } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const performance = await storage.getGSCPerformance(userId, propertyId as string, dateRange as string, deviceType as string);
    res.json(performance);
  } catch (error) {
    console.error('Error fetching GSC performance:', error);
    res.status(500).json({ error: 'Failed to fetch GSC performance' });
  }
});

// Get top queries
router.get('/gsc/queries', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { propertyId, dateRange, limit } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const queries = await storage.getGSCQueries(userId, propertyId as string, dateRange as string, parseInt(limit as string) || 10);
    res.json(queries);
  } catch (error) {
    console.error('Error fetching GSC queries:', error);
    res.status(500).json({ error: 'Failed to fetch GSC queries' });
  }
});

// Get top pages
router.get('/gsc/pages', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { propertyId, dateRange, limit } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pages = await storage.getGSCPages(userId, propertyId as string, dateRange as string, parseInt(limit as string) || 10);
    res.json(pages);
  } catch (error) {
    console.error('Error fetching GSC pages:', error);
    res.status(500).json({ error: 'Failed to fetch GSC pages' });
  }
});

// Get GSC issues
router.get('/gsc/issues', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { propertyId, severity } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const issues = await storage.getGSCIssues(userId, propertyId as string, severity as string);
    res.json(issues);
  } catch (error) {
    console.error('Error fetching GSC issues:', error);
    res.status(500).json({ error: 'Failed to fetch GSC issues' });
  }
});

// Get GSC overview stats
router.get('/gsc/overview', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { propertyId, dateRange } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const overview = await storage.getGSCOverview(userId, propertyId as string, dateRange as string);
    res.json(overview);
  } catch (error) {
    console.error('Error fetching GSC overview:', error);
    res.status(500).json({ error: 'Failed to fetch GSC overview' });
  }
});

// Export GSC data
router.post('/gsc/export', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { propertyId, format, dateRange, dataType } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const exportData = await storage.exportGSCData(userId, propertyId, format, dateRange, dataType);
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="gsc-data-${propertyId}.${format}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting GSC data:', error);
    res.status(500).json({ error: 'Failed to export GSC data' });
  }
});

// Update GSC settings
router.put('/gsc/settings', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const settings = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updatedSettings = await storage.updateGSCSettings(userId, settings);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating GSC settings:', error);
    res.status(500).json({ error: 'Failed to update GSC settings' });
  }
});

// Get GSC settings
router.get('/gsc/settings', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const settings = await storage.getGSCSettings(userId);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching GSC settings:', error);
    res.status(500).json({ error: 'Failed to fetch GSC settings' });
  }
});

// Get GSC trends
router.get('/gsc/trends', requireClerkAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { propertyId, metric, period } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const trends = await storage.getGSCTrends(userId, propertyId as string, metric as string, period as string);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching GSC trends:', error);
    res.status(500).json({ error: 'Failed to fetch GSC trends' });
  }
});

export default router;

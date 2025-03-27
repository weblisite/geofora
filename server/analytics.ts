// Analytics functions and utility methods
// These functions provide analytics data for the dashboard

import { Request, Response } from "express";
import { storage } from "./storage";

// Get stats for the dashboard
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const period = req.params.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // In a real implementation, we would fetch this data from a database or analytics service
    // For the demo, we'll return sample data
    const stats = {
      questions: {
        total: 1247,
        trend: "+12.5%",
        trendPositive: true,
      },
      answers: {
        total: 5896,
        trend: "+8.2%",
        trendPositive: true,
      },
      traffic: {
        total: 28453,
        trend: "+15.7%",
        trendPositive: true,
      },
      conversions: {
        total: 342,
        trend: "+5.3%",
        trendPositive: true,
      },
      leads: {
        total: 785,
        trend: "+23.1%",
        trendPositive: true,
      },
      formConversions: {
        total: 8.7,
        trend: "+2.3%",
        trendPositive: true,
      },
      searchRankings: {
        average: 14.8,
        trend: "-3.2",
        trendPositive: true,
      },
      clickThroughRate: {
        percentage: 4.2,
        trend: "+0.5%",
        trendPositive: true,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
}

// Get traffic data
export async function getTrafficData(req: Request, res: Response) {
  try {
    const period = req.params.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const trafficData = {
      totalVisits: 28453,
      uniqueVisitors: 18215,
      pageViews: 74218,
      avgTimeOnSite: "3m 24s",
      bounceRate: 42.6,
      trafficSources: [
        { name: "Search", value: 12587 },
        { name: "Direct", value: 5423 },
        { name: "Referral", value: 4782 },
        { name: "Social", value: 3421 },
        { name: "Email", value: 1985 },
        { name: "Other", value: 255 },
      ],
      trafficByPage: [
        { page: "/forum/best-seo-practices-2024", views: 1432, change: 23 },
        { page: "/forum/google-algorithm-update", views: 1203, change: 15 },
        { page: "/forum/keyword-research-tools", views: 987, change: 5 },
        { page: "/forum/backlink-strategies", views: 864, change: -2 },
        { page: "/forum/content-optimization-tips", views: 752, change: 8 },
        { page: "/forum/local-seo-guide", views: 643, change: 11 },
        { page: "/forum/mobile-optimization", views: 531, change: 0 },
        { page: "/forum/site-speed-optimization", views: 487, change: -5 },
      ],
      referrers: [
        { source: "Google", visits: 11245, conversion: 3.2 },
        { source: "example.com", visits: 1853, conversion: 6.7 },
        { source: "Facebook", visits: 1542, conversion: 2.1 },
        { source: "Twitter", visits: 982, conversion: 1.8 },
        { source: "LinkedIn", visits: 754, conversion: 5.3 },
      ],
      crossSiteTraffic: [
        { date: "Day 1", forumToWebsite: 245, websiteToForum: 187 },
        { date: "Day 2", forumToWebsite: 267, websiteToForum: 198 },
        { date: "Day 3", forumToWebsite: 289, websiteToForum: 210 },
        { date: "Day 4", forumToWebsite: 312, websiteToForum: 223 },
        { date: "Day 5", forumToWebsite: 336, websiteToForum: 236 },
        { date: "Day 6", forumToWebsite: 356, websiteToForum: 248 },
        { date: "Day 7", forumToWebsite: 378, websiteToForum: 256 },
      ]
    };

    res.json(trafficData);
  } catch (error) {
    console.error("Error getting traffic data:", error);
    res.status(500).json({ message: "Failed to fetch traffic data" });
  }
}

// Get daily traffic data
export async function getDailyTrafficData(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Generate sample daily traffic data
    const dailyTrafficData = [];
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 30;
    const baseVisits = 800;
    const baseUniqueVisitors = 500;
    const basePageViews = 2000;

    for (let i = 0; i < days; i++) {
      const dayNumber = days - i;
      const date = new Date();
      date.setDate(date.getDate() - dayNumber);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      // Add some randomness and general upward trend
      const trendFactor = 1 + (days - dayNumber) * 0.01;
      const randomFactor = 0.8 + Math.random() * 0.4;

      dailyTrafficData.push({
        name: dateStr,
        visits: Math.round(baseVisits * trendFactor * randomFactor),
        uniqueVisitors: Math.round(baseUniqueVisitors * trendFactor * randomFactor),
        pageViews: Math.round(basePageViews * trendFactor * randomFactor),
      });
    }

    res.json(dailyTrafficData);
  } catch (error) {
    console.error("Error getting daily traffic data:", error);
    res.status(500).json({ message: "Failed to fetch daily traffic data" });
  }
}

// Get top content data
export async function getTopContent(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const topContentData = [
      {
        id: 1,
        title: "What's the most effective way to optimize content for BERT algorithm?",
        views: 2345,
        answers: 18,
        conversions: 87,
        ranking: "#3 for 'BERT optimization'",
        position: 3,
        change: 2,
      },
      {
        id: 2,
        title: "How does Google's helpful content update affect ranking in 2024?",
        views: 1987,
        answers: 23,
        conversions: 64,
        ranking: "#5 for 'helpful content update'",
        position: 5,
        change: 1,
      },
      {
        id: 3,
        title: "Best practices for optimizing image SEO for e-commerce",
        views: 1756,
        answers: 15,
        conversions: 52,
        ranking: "#7 for 'e-commerce image SEO'",
        position: 7,
        change: -1,
      },
      {
        id: 4,
        title: "Does site speed really impact search rankings?",
        views: 1654,
        answers: 27,
        conversions: 43,
        ranking: "#2 for 'site speed ranking impact'",
        position: 2,
        change: 3,
      },
      {
        id: 5,
        title: "How to create topic clusters that rank well",
        views: 1432,
        answers: 19,
        conversions: 38,
        ranking: "#4 for 'topic cluster SEO'",
        position: 4,
        change: 0,
      },
      {
        id: 6,
        title: "AI content and SEO: Is it detectable by Google?",
        views: 1387,
        answers: 34,
        conversions: 41,
        ranking: "#1 for 'AI content detection SEO'",
        position: 1,
        change: 5,
      },
      {
        id: 7,
        title: "How to optimize for voice search in 2024",
        views: 1265,
        answers: 14,
        conversions: 29,
        ranking: "#8 for 'voice search optimization'",
        position: 8,
        change: 2,
      },
      {
        id: 8,
        title: "Local SEO tactics that actually work",
        views: 1198,
        answers: 21,
        conversions: 36,
        ranking: "#5 for 'effective local SEO tactics'",
        position: 5,
        change: -2,
      },
    ];

    res.json(topContentData);
  } catch (error) {
    console.error("Error getting top content:", error);
    res.status(500).json({ message: "Failed to fetch top content" });
  }
}

// Get SEO rankings data
export async function getSeoRankings(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const seoRankingsData = {
      topTenCount: 42,
      movingKeywordsCount: 24,
      rankings: [
        {
          id: 1,
          keyword: "BERT optimization",
          position: 3,
          previousPosition: 5,
          change: 2,
          url: "forum/best-seo-practices-2024/what-is-the-most-effective-way-to-optimize-content-for-bert-algorithm",
          searchVolume: 4200,
          difficulty: 76,
        },
        {
          id: 2,
          keyword: "helpful content update",
          position: 5,
          previousPosition: 6,
          change: 1,
          url: "forum/google-algorithm-update/how-does-googles-helpful-content-update-affect-ranking-in-2024",
          searchVolume: 3800,
          difficulty: 68,
        },
        {
          id: 3,
          keyword: "e-commerce image SEO",
          position: 7,
          previousPosition: 6,
          change: -1,
          url: "forum/content-optimization-tips/best-practices-for-optimizing-image-seo-for-e-commerce",
          searchVolume: 2900,
          difficulty: 58,
        },
        {
          id: 4,
          keyword: "site speed ranking impact",
          position: 2,
          previousPosition: 5,
          change: 3,
          url: "forum/site-speed-optimization/does-site-speed-really-impact-search-rankings",
          searchVolume: 3400,
          difficulty: 61,
        },
        {
          id: 5,
          keyword: "topic cluster SEO",
          position: 4,
          previousPosition: 4,
          change: 0,
          url: "forum/content-optimization-tips/how-to-create-topic-clusters-that-rank-well",
          searchVolume: 2500,
          difficulty: 54,
        },
        {
          id: 6,
          keyword: "AI content detection SEO",
          position: 1,
          previousPosition: 6,
          change: 5,
          url: "forum/content-optimization-tips/ai-content-and-seo-is-it-detectable-by-google",
          searchVolume: 5200,
          difficulty: 82,
        },
        {
          id: 7,
          keyword: "voice search optimization",
          position: 8,
          previousPosition: 10,
          change: 2,
          url: "forum/mobile-optimization/how-to-optimize-for-voice-search-in-2024",
          searchVolume: 2800,
          difficulty: 60,
        },
        {
          id: 8,
          keyword: "effective local SEO tactics",
          position: 5,
          previousPosition: 3,
          change: -2,
          url: "forum/local-seo-guide/local-seo-tactics-that-actually-work",
          searchVolume: 3100,
          difficulty: 63,
        },
      ],
      positionDistribution: [
        { range: "Positions 1-3", count: 2 },
        { range: "Positions 4-10", count: 6 },
        { range: "Positions 11-20", count: 13 },
        { range: "Positions 21-50", count: 21 },
        { range: "Positions 50+", count: 12 },
      ],
      topKeywords: ["AI content detection SEO", "site speed ranking impact", "BERT optimization", "topic cluster SEO", "helpful content update"],
      historicalRankings: [
        { date: "Jan", "AI content detection SEO": 6, "site speed ranking impact": 9, "BERT optimization": 8, "topic cluster SEO": 7, "helpful content update": 11 },
        { date: "Feb", "AI content detection SEO": 5, "site speed ranking impact": 7, "BERT optimization": 7, "topic cluster SEO": 6, "helpful content update": 9 },
        { date: "Mar", "AI content detection SEO": 4, "site speed ranking impact": 5, "BERT optimization": 6, "topic cluster SEO": 5, "helpful content update": 8 },
        { date: "Apr", "AI content detection SEO": 3, "site speed ranking impact": 4, "BERT optimization": 5, "topic cluster SEO": 5, "helpful content update": 7 },
        { date: "May", "AI content detection SEO": 2, "site speed ranking impact": 3, "BERT optimization": 4, "topic cluster SEO": 4, "helpful content update": 6 },
        { date: "Jun", "AI content detection SEO": 1, "site speed ranking impact": 2, "BERT optimization": 3, "topic cluster SEO": 4, "helpful content update": 5 },
      ]
    };

    res.json(seoRankingsData);
  } catch (error) {
    console.error("Error getting SEO rankings:", error);
    res.status(500).json({ message: "Failed to fetch SEO rankings" });
  }
}

// Get conversion funnel data
export async function getConversionFunnel(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const conversionFunnelData = [
      { name: "Page Views", value: 28453, percentage: 100 },
      { name: "Read Content", value: 17843, percentage: 62.7 },
      { name: "Click CTA", value: 5623, percentage: 19.8 },
      { name: "Form Views", value: 3487, percentage: 12.3 },
      { name: "Form Submissions", value: 785, percentage: 2.8 },
    ];

    res.json(conversionFunnelData);
  } catch (error) {
    console.error("Error getting conversion funnel:", error);
    res.status(500).json({ message: "Failed to fetch conversion funnel" });
  }
}

// Get referral traffic data
export async function getReferralTraffic(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const referralTrafficData = [
      { source: "Google", visits: 12587, conversions: 423, conversionRate: 0.034, change: 15 },
      { source: "Main Website", visits: 4328, conversions: 218, conversionRate: 0.05, change: 24 },
      { source: "Facebook", visits: 1853, conversions: 87, conversionRate: 0.047, change: 3 },
      { source: "Twitter", visits: 982, conversions: 43, conversionRate: 0.044, change: -2 },
      { source: "LinkedIn", visits: 754, conversions: 61, conversionRate: 0.081, change: 18 },
      { source: "Reddit", visits: 542, conversions: 32, conversionRate: 0.059, change: 7 },
      { source: "YouTube", visits: 328, conversions: 21, conversionRate: 0.064, change: 11 },
      { source: "Email", visits: 245, conversions: 28, conversionRate: 0.114, change: 9 },
    ];

    res.json(referralTrafficData);
  } catch (error) {
    console.error("Error getting referral traffic:", error);
    res.status(500).json({ message: "Failed to fetch referral traffic" });
  }
}

// Get device distribution data
export async function getDeviceDistribution(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const deviceDistributionData = [
      { name: "Desktop", value: 11235 },
      { name: "Mobile", value: 14675 },
      { name: "Tablet", value: 2543 },
    ];

    res.json(deviceDistributionData);
  } catch (error) {
    console.error("Error getting device distribution:", error);
    res.status(500).json({ message: "Failed to fetch device distribution" });
  }
}

// Get geographic distribution data
export async function getGeographicData(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const geographicData = [
      { country: "United States", visits: 12435, percentage: 0.437 },
      { country: "United Kingdom", visits: 3542, percentage: 0.124 },
      { country: "India", visits: 2843, percentage: 0.100 },
      { country: "Germany", visits: 1875, percentage: 0.066 },
      { country: "Canada", visits: 1543, percentage: 0.054 },
      { country: "Australia", visits: 1245, percentage: 0.044 },
      { country: "France", visits: 987, percentage: 0.035 },
      { country: "Brazil", visits: 854, percentage: 0.030 },
      { country: "Spain", visits: 643, percentage: 0.023 },
      { country: "Other", visits: 2486, percentage: 0.087 },
    ];

    res.json(geographicData);
  } catch (error) {
    console.error("Error getting geographic data:", error);
    res.status(500).json({ message: "Failed to fetch geographic data" });
  }
}

// Get lead capture statistics
export async function getLeadCaptureStats(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const leadCaptureData = {
      totalLeads: 785,
      totalFormViews: 3487,
      conversionRate: 22.5,
      forumToWebsiteCTR: 34.8,
      gatedContentDownloads: 456,
      formStats: [
        { formName: "SEO Ebook Download", views: 1245, submissions: 342, conversionRate: 0.275 },
        { formName: "Weekly SEO Tips", views: 876, submissions: 198, conversionRate: 0.226 },
        { formName: "SEO Audit Offer", views: 654, submissions: 123, conversionRate: 0.188 },
        { formName: "Webinar Registration", views: 432, submissions: 87, conversionRate: 0.201 },
        { formName: "Case Study Access", views: 280, submissions: 35, conversionRate: 0.125 },
      ],
      leadsTrend: [
        { date: "Week 1", submissions: 135, conversionRate: 18.5 },
        { date: "Week 2", submissions: 153, conversionRate: 19.8 },
        { date: "Week 3", submissions: 168, conversionRate: 21.3 },
        { date: "Week 4", submissions: 187, conversionRate: 23.2 },
        { date: "Week 5", submissions: 142, conversionRate: 20.7 },
      ],
      forumToWebsiteFunnel: [
        { name: "Forum Visitors", value: 28453, percentage: 100 },
        { name: "Click Website Link", value: 9876, percentage: 34.7 },
        { name: "Visit Site Landing Page", value: 7654, percentage: 26.9 },
        { name: "View Product/Service", value: 3245, percentage: 11.4 },
        { name: "Conversion/Purchase", value: 785, percentage: 2.8 },
      ]
    };

    res.json(leadCaptureData);
  } catch (error) {
    console.error("Error getting lead capture stats:", error);
    res.status(500).json({ message: "Failed to fetch lead capture stats" });
  }
}

// Get AI activity data
export async function getAiActivity(req: Request, res: Response) {
  try {
    const period = req.query.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

    // Sample data for the demo
    const aiActivityData = [
      { 
        id: 1, 
        type: "answer", 
        personaType: "expert", 
        personaName: "Dr. SEO Expert", 
        action: "Answered question about backlink strategies", 
        subject: "How to build high-quality backlinks in 2024?", 
        timestamp: "2024-03-27T10:23:45Z" 
      },
      { 
        id: 2, 
        type: "question", 
        personaType: "intermediate", 
        personaName: "SEO Practitioner", 
        action: "Generated question about core web vitals", 
        subject: "How do core web vitals affect e-commerce conversion rates?", 
        timestamp: "2024-03-27T09:15:30Z" 
      },
      { 
        id: 3, 
        type: "moderation", 
        personaType: "moderator", 
        personaName: "Forum Moderator", 
        action: "Flagged spam content", 
        subject: "Removed promotional link in discussion thread", 
        timestamp: "2024-03-27T08:45:12Z" 
      },
      { 
        id: 4, 
        type: "response", 
        personaType: "beginner", 
        personaName: "SEO Beginner", 
        action: "Responded to thread about meta descriptions", 
        subject: "How long should meta descriptions be in 2024?", 
        timestamp: "2024-03-27T07:30:18Z" 
      },
      { 
        id: 5, 
        type: "answer", 
        personaType: "expert", 
        personaName: "Dr. SEO Expert", 
        action: "Answered question about schema markup", 
        subject: "Best practices for implementing schema markup", 
        timestamp: "2024-03-26T22:10:45Z" 
      },
    ];

    res.json(aiActivityData);
  } catch (error) {
    console.error("Error getting AI activity:", error);
    res.status(500).json({ message: "Failed to fetch AI activity" });
  }
}

// Get user engagement metrics
export async function getUserEngagementMetrics(req: Request, res: Response) {
  try {
    const forumId = parseInt(req.params.forumId);
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }
    
    const metrics = await storage.getUserEngagementMetricsByForum(forumId, startDate, endDate);
    res.json(metrics);
  } catch (error) {
    console.error("Error getting user engagement metrics:", error);
    res.status(500).json({ message: "Failed to fetch user engagement metrics" });
  }
}

// Get average session duration
export async function getAverageSessionDuration(req: Request, res: Response) {
  try {
    const forumId = parseInt(req.params.forumId);
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }
    
    const avgDuration = await storage.getDailyAverageSessionDuration(forumId, days);
    res.json({ 
      forumId, 
      days, 
      averageSessionDuration: avgDuration,
      formattedDuration: formatDuration(avgDuration)
    });
  } catch (error) {
    console.error("Error getting average session duration:", error);
    res.status(500).json({ message: "Failed to fetch average session duration" });
  }
}

// Get return visitor rate trend
export async function getReturnVisitorTrend(req: Request, res: Response) {
  try {
    const forumId = parseInt(req.params.forumId);
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }
    
    const trend = await storage.getReturnVisitorRateTrend(forumId, days);
    res.json(trend);
  } catch (error) {
    console.error("Error getting return visitor trend:", error);
    res.status(500).json({ message: "Failed to fetch return visitor trend" });
  }
}

// Get content performance metrics
export async function getContentPerformanceMetrics(req: Request, res: Response) {
  try {
    const forumId = parseInt(req.params.forumId);
    const contentType = req.query.contentType as string;
    
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }
    
    const metrics = await storage.getContentPerformanceMetricsByForum(forumId, contentType);
    res.json(metrics);
  } catch (error) {
    console.error("Error getting content performance metrics:", error);
    res.status(500).json({ message: "Failed to fetch content performance metrics" });
  }
}

// Get top performing content
export async function getTopPerformingContent(req: Request, res: Response) {
  try {
    const forumId = parseInt(req.params.forumId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }
    
    const topContent = await storage.getTopPerformingContent(forumId, limit);
    res.json(topContent);
  } catch (error) {
    console.error("Error getting top performing content:", error);
    res.status(500).json({ message: "Failed to fetch top performing content" });
  }
}

// Get content engagement trend
export async function getContentEngagementTrend(req: Request, res: Response) {
  try {
    const forumId = parseInt(req.params.forumId);
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }
    
    const trend = await storage.getContentEngagementTrend(forumId, days);
    res.json(trend);
  } catch (error) {
    console.error("Error getting content engagement trend:", error);
    res.status(500).json({ message: "Failed to fetch content engagement trend" });
  }
}

// Get analytics events
export async function getAnalyticsEvents(req: Request, res: Response) {
  try {
    const forumId = parseInt(req.params.forumId);
    const eventType = req.query.eventType as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }
    
    const events = await storage.getAnalyticsEventsByForum(forumId, eventType, startDate, endDate);
    res.json(events);
  } catch (error) {
    console.error("Error getting analytics events:", error);
    res.status(500).json({ message: "Failed to fetch analytics events" });
  }
}

// Get event counts by type
export async function getEventCountsByType(req: Request, res: Response) {
  try {
    const forumId = parseInt(req.params.forumId);
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }
    
    const counts = await storage.getEventCountsByType(forumId, days);
    res.json(counts);
  } catch (error) {
    console.error("Error getting event counts by type:", error);
    res.status(500).json({ message: "Failed to fetch event counts" });
  }
}

// Helper function to format duration in seconds to a human-readable string
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}
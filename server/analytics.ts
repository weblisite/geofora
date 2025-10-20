// Analytics functions and utility methods
// These functions provide analytics data for the dashboard

import { Request, Response } from "express";
import { storage } from "./storage";

// Get stats for the dashboard
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const period = req.params.period || "30d";
    let forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;
    
    // If no forumId provided, try to get user's first forum
    if (!forumId && req.auth?.userId) {
      const user = await storage.getUserByClerkId(req.auth.userId);
      if (user) {
        const userForums = await storage.getForumsByUser(user.id);
        if (userForums.length > 0) {
          forumId = userForums[0].id;
        }
      }
    }
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required or no forums found" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }
    
    // Get previous period for trend calculation
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    
    if (period === "7d") {
      prevStartDate.setDate(prevStartDate.getDate() - 7);
    } else if (period === "30d") {
      prevStartDate.setDate(prevStartDate.getDate() - 30);
    } else if (period === "90d") {
      prevStartDate.setDate(prevStartDate.getDate() - 90);
    } else if (period === "1y") {
      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
    } else {
      prevStartDate.setDate(prevStartDate.getDate() - 30);
    }
    
    // Get question count
    const questions = await storage.countQuestionsByForum(forumId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    const prevQuestions = await storage.countQuestionsByForum(forumId, {
      startDate: prevStartDate.toISOString(),
      endDate: prevEndDate.toISOString()
    });
    
    // Get answer count
    const answers = await storage.countAnswersByForum(forumId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    const prevAnswers = await storage.countAnswersByForum(forumId, {
      startDate: prevStartDate.toISOString(),
      endDate: prevEndDate.toISOString()
    });
    
    // Get traffic data
    const trafficMetrics = await storage.getUserEngagementMetricsByForum(forumId, startDate.toISOString(), endDate.toISOString());
    const prevTrafficMetrics = await storage.getUserEngagementMetricsByForum(forumId, prevStartDate.toISOString(), prevEndDate.toISOString());
    
    const totalTraffic = trafficMetrics.reduce((sum, metric) => sum + (metric.pageViews || 0), 0);
    const prevTotalTraffic = prevTrafficMetrics.reduce((sum, metric) => sum + (metric.pageViews || 0), 0);
    
    // Get conversion data (lead submissions)
    const forms = await storage.getLeadCaptureFormsByForum(forumId);
    const formIds = forms.map(form => form.id);
    
    let submissions = 0;
    let prevSubmissions = 0;
    
    if (formIds.length > 0) {
      const submissionData = await storage.getLeadSubmissionsByFormIds(formIds, startDate.toISOString(), endDate.toISOString());
      submissions = submissionData.length;
      
      const prevSubmissionData = await storage.getLeadSubmissionsByFormIds(formIds, prevStartDate.toISOString(), prevEndDate.toISOString());
      prevSubmissions = prevSubmissionData.length;
    }
    
    // Calculate trends
    const calculateTrend = (current: number, previous: number): { trend: string, trendPositive: boolean } => {
      if (previous === 0) return { trend: "+100%", trendPositive: true };
      
      const percentChange = ((current - previous) / previous) * 100;
      const trend = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
      return {
        trend,
        trendPositive: percentChange >= 0
      };
    };
    
    const questionTrend = calculateTrend(questions, prevQuestions);
    const answerTrend = calculateTrend(answers, prevAnswers);
    const trafficTrend = calculateTrend(totalTraffic, prevTotalTraffic);
    const conversionTrend = calculateTrend(submissions, prevSubmissions);
    
    const stats = {
      questions: {
        total: questions,
        trend: questionTrend.trend,
        trendPositive: questionTrend.trendPositive,
      },
      answers: {
        total: answers,
        trend: answerTrend.trend,
        trendPositive: answerTrend.trendPositive,
      },
      traffic: {
        total: totalTraffic,
        trend: trafficTrend.trend,
        trendPositive: trafficTrend.trendPositive,
      },
      conversions: {
        total: submissions,
        trend: conversionTrend.trend,
        trendPositive: conversionTrend.trendPositive,
      }
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
    let forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;
    
    // If no forumId provided, try to get user's first forum
    if (!forumId && req.auth?.userId) {
      const user = await storage.getUserByClerkId(req.auth.userId);
      if (user) {
        const userForums = await storage.getForumsByUser(user.id);
        if (userForums.length > 0) {
          forumId = userForums[0].id;
        }
      }
    }
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required or no forums found" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }
    
    // Get real traffic data from database 
    const trafficStats = await storage.getTrafficStatsByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Get average session duration
    const avgDuration = await storage.getDailyAverageSessionDuration(forumId, 
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Get referral data
    const referrals = await storage.getReferralsByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Get traffic by page
    const pageTraffic = await storage.getPageTrafficByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Get cross-site traffic if available
    const crossSiteStats = await storage.getCrossSiteTrafficByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Calculate totals
    const totalVisits = trafficStats.reduce((sum, stat) => sum + (stat.visits || 0), 0);
    const uniqueVisitors = trafficStats.reduce((sum, stat) => sum + (stat.uniqueVisitors || 0), 0);
    const pageViews = trafficStats.reduce((sum, stat) => sum + (stat.pageViews || 0), 0);
    
    // Calculate bounce rate
    const bounceSessions = trafficStats.reduce((sum, stat) => sum + (stat.bounceSessions || 0), 0);
    const bounceRate = totalVisits > 0 ? (bounceSessions / totalVisits) * 100 : 0;
    
    // Group referrals by source
    const referrerMap = new Map();
    referrals.forEach(ref => {
      const source = ref.source || "Unknown";
      if (!referrerMap.has(source)) {
        referrerMap.set(source, { visits: 0, conversions: 0 });
      }
      const current = referrerMap.get(source);
      referrerMap.set(source, {
        visits: current.visits + (ref.visits || 0),
        conversions: current.conversions + (ref.conversions || 0)
      });
    });
    
    // Format referrer data for response
    const referrerData = Array.from(referrerMap.entries()).map(([source, data]) => ({
      source,
      visits: data.visits,
      conversion: data.visits > 0 ? (data.conversions / data.visits) * 100 : 0
    })).sort((a, b) => b.visits - a.visits).slice(0, 5);
    
    // Group traffic by source
    const sourceMap = new Map();
    sourceMap.set("Search", 0);
    sourceMap.set("Direct", 0);
    sourceMap.set("Referral", 0);
    sourceMap.set("Social", 0);
    sourceMap.set("Email", 0);
    sourceMap.set("Other", 0);
    
    trafficStats.forEach(stat => {
      const source = stat.trafficSource || "Other";
      if (sourceMap.has(source)) {
        sourceMap.set(source, sourceMap.get(source) + (stat.visits || 0));
      } else {
        sourceMap.set("Other", sourceMap.get("Other") + (stat.visits || 0));
      }
    });
    
    // Format traffic sources for response
    const trafficSources = Array.from(sourceMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
    
    // Format traffic by page
    const trafficByPage = pageTraffic
      .sort((a, b) => (b.currentViews || 0) - (a.currentViews || 0))
      .slice(0, 8)
      .map(page => ({
        page: page.path,
        views: page.currentViews || 0,
        change: page.previousViews ? ((page.currentViews || 0) - page.previousViews) : 0
      }));
    
    // Format cross-site traffic
    const crossSiteTraffic = crossSiteStats.map((stat, index) => ({
      date: `Day ${index + 1}`,
      forumToWebsite: stat.forumToWebsite || 0,
      websiteToForum: stat.websiteToForum || 0
    }));
    
    // Compile complete traffic data
    const trafficData = {
      totalVisits,
      uniqueVisitors,
      pageViews,
      avgTimeOnSite: formatDuration(avgDuration),
      bounceRate: parseFloat(bounceRate.toFixed(1)),
      trafficSources,
      trafficByPage,
      referrers: referrerData,
      crossSiteTraffic: crossSiteTraffic.length > 0 ? crossSiteTraffic : []
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
    let forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;
    
    // If no forumId provided, try to get user's first forum
    if (!forumId && req.auth?.userId) {
      const user = await storage.getUserByClerkId(req.auth.userId);
      if (user) {
        const userForums = await storage.getForumsByUser(user.id);
        if (userForums.length > 0) {
          forumId = userForums[0].id;
        }
      }
    }
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required or no forums found" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 30;
    startDate.setDate(endDate.getDate() - days);
    
    // Get real daily traffic data from the database
    const trafficData = await storage.getDailyTrafficByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Group metrics by day and format for chart display
    const dailyTrafficMap = new Map();
    
    // Pre-populate all days in the range with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      dailyTrafficMap.set(dateStr, {
        name: dateStr,
        visits: 0,
        uniqueVisitors: 0,
        pageViews: 0,
      });
    }
    
    // Populate with actual data where available
    trafficData.forEach(entry => {
      const date = new Date(entry.date);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      if (dailyTrafficMap.has(dateStr)) {
        const current = dailyTrafficMap.get(dateStr);
        dailyTrafficMap.set(dateStr, {
          name: dateStr,
          visits: current.visits + (entry.visits || 0),
          uniqueVisitors: current.uniqueVisitors + (entry.uniqueVisitors || 0),
          pageViews: current.pageViews + (entry.pageViews || 0),
        });
      }
    });
    
    // Convert map to array and sort by date
    const dailyTrafficData = Array.from(dailyTrafficMap.values())
      .sort((a, b) => {
        // Sort by date (month and day)
        const dateA = new Date(`2024 ${a.name}`);
        const dateB = new Date(`2024 ${b.name}`);
        return dateA.getTime() - dateB.getTime();
      });
    
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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    const days = period === "7d" ? 7 : 
                period === "30d" ? 30 : 
                period === "90d" ? 90 : 
                period === "6m" ? 180 : 
                period === "1y" ? 365 : 30;
    
    startDate.setDate(startDate.getDate() - days);
    
    // Get real data from the database
    let topContent;
    
    if (forumId) {
      // Get forum-specific content
      topContent = await storage.getTopPerformingContent(forumId, limit);
    } else {
      // Get content across all forums
      topContent = await storage.getTopPerformingContentAcrossForums(limit);
    }
    
    if (!topContent || topContent.length === 0) {
      // Fallback to querying questions data if no performance metrics exist
      const questions = forumId 
        ? await storage.getQuestionsByForumWithMetrics(forumId, limit) 
        : await storage.getQuestionsWithMetrics(limit);
      
      // Transform questions data into expected format
      topContent = questions.map(q => {
        // Count related SEO positions if available
        const rankingInfo = q.seoPositions && q.seoPositions.length > 0
          ? {
              ranking: `#${q.seoPositions[0].position} for '${q.seoPositions[0].keyword}'`,
              position: q.seoPositions[0].position,
              change: (q.seoPositions.length > 1) 
                ? q.seoPositions[0].position - q.seoPositions[1].position 
                : 0
            }
          : {
              ranking: "Not ranked",
              position: 0,
              change: 0
            };
          
        return {
          id: q.id,
          title: q.title,
          views: q.viewCount || 0,
          answers: q.answerCount || 0,
          conversions: q.leadConversions || 0,
          ...rankingInfo
        };
      });
    }

    res.json(topContent);
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
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }
    
    // Get all keywords and their positions for the forum
    const allKeywords = await storage.getSeoKeywordsByForum(forumId);
    const keywordIds = allKeywords.map(keyword => keyword.id);
    
    // Get historical positions for each keyword
    const positionHistoryMap = new Map();
    
    for (const keywordId of keywordIds) {
      const positions = await storage.getSeoPositionsByKeywordId(keywordId, startDate.toISOString(), endDate.toISOString());
      if (positions && positions.length > 0) {
        positionHistoryMap.set(keywordId, positions);
      }
    }
    
    // Process the keywords and their positions
    const rankings = allKeywords.map(keyword => {
      const positions = positionHistoryMap.get(keyword.id) || [];
      // Sort positions by date, newest first
      positions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const currentPosition = positions.length > 0 ? positions[0].position : null;
      const previousPosition = positions.length > 1 ? positions[1].position : null;
      const change = (currentPosition && previousPosition) ? previousPosition - currentPosition : 0;
      
      return {
        id: keyword.id,
        keyword: keyword.keyword,
        position: currentPosition || 0,
        previousPosition: previousPosition || 0,
        change,
        url: keyword.url || "",
        searchVolume: keyword.searchVolume || 0,
        difficulty: keyword.difficulty || 0,
      };
    })
    .filter(keyword => keyword.position > 0) // Only include keywords that have position data
    .sort((a, b) => a.position - b.position); // Sort by position (best ranking first)
    
    // Count keywords in top 10
    const topTenCount = rankings.filter(keyword => keyword.position <= 10).length;
    
    // Count keywords that have moved (changed position)
    const movingKeywordsCount = rankings.filter(keyword => keyword.change !== 0).length;
    
    // Calculate position distribution
    const getPositionRange = (position: number) => {
      if (position <= 3) return "Positions 1-3";
      if (position <= 10) return "Positions 4-10";
      if (position <= 20) return "Positions 11-20";
      if (position <= 50) return "Positions 21-50";
      return "Positions 50+";
    };
    
    const positionCounts = new Map();
    positionCounts.set("Positions 1-3", 0);
    positionCounts.set("Positions 4-10", 0);
    positionCounts.set("Positions 11-20", 0);
    positionCounts.set("Positions 21-50", 0);
    positionCounts.set("Positions 50+", 0);
    
    rankings.forEach(keyword => {
      const range = getPositionRange(keyword.position);
      positionCounts.set(range, positionCounts.get(range) + 1);
    });
    
    const positionDistribution = Array.from(positionCounts.entries()).map(([range, count]) => ({
      range,
      count,
    }));
    
    // Get top 5 keywords (by position)
    const topKeywords = rankings.slice(0, 5).map(keyword => keyword.keyword);
    
    // Generate historical trend data
    // Get months for the selected period
    const months = [];
    let currentMonth = new Date(startDate);
    while (currentMonth <= endDate) {
      months.push(currentMonth.toLocaleDateString('en-US', { month: 'short' }));
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    // Create historical data for top 5 keywords
    const historicalRankings = [];
    
    // Create entry for each month
    months.forEach(month => {
      const entry: Record<string, any> = { date: month };
      
      // Add position for each top keyword in that month
      topKeywords.forEach(keywordName => {
        const keyword = rankings.find(k => k.keyword === keywordName);
        if (keyword) {
          const positions = positionHistoryMap.get(keyword.id) || [];
          
          // Find position from that month
          const monthDate = new Date(`${month} 1, ${new Date().getFullYear()}`);
          const monthPositions = positions.filter(p => {
            const posDate = new Date(p.date);
            return posDate.getMonth() === monthDate.getMonth();
          });
          
          // Use the most recent position from that month, or fallback
          entry[keywordName] = monthPositions.length > 0 
            ? monthPositions[0].position 
            : keyword.position;
        } else {
          entry[keywordName] = 0;
        }
      });
      
      historicalRankings.push(entry);
    });
    
    // Compile SEO rankings data
    const seoRankingsData = {
      topTenCount,
      movingKeywordsCount,
      rankings: rankings.slice(0, 8), // Limit to top 8 keywords for UI display
      positionDistribution,
      topKeywords,
      historicalRankings
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
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }
    
    // Get real funnel metrics from database
    const pageViewsData = await storage.getPageViewsByForum(forumId, startDate.toISOString(), endDate.toISOString());
    const contentReadData = await storage.getContentReadByForum(forumId, startDate.toISOString(), endDate.toISOString());
    const ctaClickData = await storage.getCtaClicksByForum(forumId, startDate.toISOString(), endDate.toISOString());
    const formViewData = await storage.getFormViewsByForum(forumId, startDate.toISOString(), endDate.toISOString());
    const formSubmitData = await storage.getFormSubmissionsByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Calculate totals
    const pageViews = pageViewsData.reduce((sum, entry) => sum + entry.count, 0);
    const contentRead = contentReadData.reduce((sum, entry) => sum + entry.count, 0);
    const ctaClicks = ctaClickData.reduce((sum, entry) => sum + entry.count, 0);
    const formViews = formViewData.reduce((sum, entry) => sum + entry.count, 0);
    const formSubmissions = formSubmitData.reduce((sum, entry) => sum + entry.count, 0);
    
    // Calculate percentages
    const pageViewsPercentage = 100;
    const contentReadPercentage = pageViews > 0 ? (contentRead / pageViews) * 100 : 0;
    const ctaClicksPercentage = pageViews > 0 ? (ctaClicks / pageViews) * 100 : 0;
    const formViewsPercentage = pageViews > 0 ? (formViews / pageViews) * 100 : 0;
    const formSubmissionsPercentage = pageViews > 0 ? (formSubmissions / pageViews) * 100 : 0;
    
    // Format data for response
    const conversionFunnelData = [
      { name: "Page Views", value: pageViews, percentage: pageViewsPercentage },
      { name: "Read Content", value: contentRead, percentage: parseFloat(contentReadPercentage.toFixed(1)) },
      { name: "Click CTA", value: ctaClicks, percentage: parseFloat(ctaClicksPercentage.toFixed(1)) },
      { name: "Form Views", value: formViews, percentage: parseFloat(formViewsPercentage.toFixed(1)) },
      { name: "Form Submissions", value: formSubmissions, percentage: parseFloat(formSubmissionsPercentage.toFixed(1)) },
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
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }
    
    // Get referral traffic data from database
    const referralData = await storage.getReferralTrafficByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Get conversion data
    const conversionData = await storage.getReferralConversionsByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Get previous period data for calculating change percentage
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    const periodDays = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    
    const previousReferralData = await storage.getReferralTrafficByForum(
      forumId, 
      previousStartDate.toISOString(), 
      previousEndDate.toISOString()
    );
    
    // Process and format the data
    const processedData = [];
    
    // Group referral data by source
    const sourceMap = new Map();
    
    referralData.forEach(data => {
      const source = data.source || "Direct";
      
      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          source,
          visits: 0,
          conversions: 0,
          conversionRate: 0,
          change: 0,
          previousVisits: 0
        });
      }
      
      const sourceData = sourceMap.get(source);
      sourceData.visits += data.count;
    });
    
    // Add conversion data
    conversionData.forEach(data => {
      const source = data.source || "Direct";
      
      if (sourceMap.has(source)) {
        const sourceData = sourceMap.get(source);
        sourceData.conversions += data.count;
        sourceData.conversionRate = sourceData.visits > 0 ? sourceData.conversions / sourceData.visits : 0;
      }
    });
    
    // Calculate change compared to previous period
    previousReferralData.forEach(data => {
      const source = data.source || "Direct";
      
      if (sourceMap.has(source)) {
        const sourceData = sourceMap.get(source);
        sourceData.previousVisits += data.count;
        
        // Calculate percentage change
        if (sourceData.previousVisits > 0) {
          sourceData.change = ((sourceData.visits - sourceData.previousVisits) / sourceData.previousVisits) * 100;
        }
      }
    });
    
    // Convert map to array and format data
    sourceMap.forEach(sourceData => {
      processedData.push({
        source: sourceData.source,
        visits: sourceData.visits,
        conversions: sourceData.conversions,
        conversionRate: parseFloat(sourceData.conversionRate.toFixed(3)),
        change: Math.round(sourceData.change)
      });
    });
    
    // Sort by visits (highest first)
    processedData.sort((a, b) => b.visits - a.visits);
    
    res.json(processedData);
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
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }
    
    // Get device usage data from database
    const deviceData = await storage.getDeviceUsageByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Group data by device type
    const deviceCounts = new Map();
    deviceCounts.set("Desktop", 0);
    deviceCounts.set("Mobile", 0);
    deviceCounts.set("Tablet", 0);
    
    deviceData.forEach(data => {
      const deviceType = data.deviceType || "Unknown";
      let category;
      
      // Categorize devices
      if (deviceType.toLowerCase().includes("mobile") || 
          deviceType.toLowerCase().includes("phone") || 
          deviceType.toLowerCase().includes("android") && !deviceType.toLowerCase().includes("tablet")) {
        category = "Mobile";
      } else if (deviceType.toLowerCase().includes("tablet") || 
                deviceType.toLowerCase().includes("ipad")) {
        category = "Tablet";
      } else {
        category = "Desktop";
      }
      
      // Add to counts
      deviceCounts.set(category, (deviceCounts.get(category) || 0) + data.count);
    });
    
    // Format data for response
    const deviceDistributionData = Array.from(deviceCounts.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
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
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }
    
    // Get geographic data from database
    const geoData = await storage.getGeoLocationDataByForum(forumId, startDate.toISOString(), endDate.toISOString());
    
    // Group data by country
    const countryData = new Map();
    let totalVisits = 0;
    
    geoData.forEach(data => {
      const country = data.country || "Unknown";
      const existingCount = countryData.get(country) || 0;
      countryData.set(country, existingCount + data.count);
      totalVisits += data.count;
    });
    
    // Process data and calculate percentages
    let processedData = Array.from(countryData.entries())
      .map(([country, visits]) => ({
        country,
        visits,
        percentage: totalVisits > 0 ? Number((visits / totalVisits).toFixed(3)) : 0
      }))
      .sort((a, b) => b.visits - a.visits);
    
    // Limit to top 9 countries + "Other"
    if (processedData.length > 10) {
      const topCountries = processedData.slice(0, 9);
      const otherCountries = processedData.slice(9);
      
      const otherVisits = otherCountries.reduce((sum, item) => sum + item.visits, 0);
      const otherPercentage = totalVisits > 0 ? Number((otherVisits / totalVisits).toFixed(3)) : 0;
      
      processedData = [
        ...topCountries,
        { country: "Other", visits: otherVisits, percentage: otherPercentage }
      ];
    }
    
    res.json(processedData);
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
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get all forms created by the user
    const allUserForms = await storage.getLeadCaptureFormsByUser(userId);
    
    // Filter by forum if specified
    const forms = forumId 
      ? allUserForms.filter(form => form.forumId === forumId)
      : allUserForms;
    
    // Get all form submissions across all user forms
    const formIds = forms.map(form => form.id);
    const submissions = await storage.getLeadSubmissionsByFormIds(formIds);
    
    // Count form views
    const formViews = await storage.getFormViewsByFormIds(formIds);
    const totalFormViews = formViews.reduce((sum, view) => sum + view.count, 0);
    
    // Get gated content downloads
    const gatedContent = await storage.getGatedContentsByUserId(userId);
    const gatedContentIds = gatedContent.map(content => content.id);
    const contentDownloads = await storage.getContentDownloadsByContentIds(gatedContentIds);
    const totalGatedContentDownloads = contentDownloads.reduce((sum, download) => sum + download.count, 0);
    
    // Calculate total leads
    const totalLeads = submissions.length;
    
    // Calculate conversion rate
    const conversionRate = totalFormViews > 0 
      ? (totalLeads / totalFormViews) * 100 
      : 0;
    
    // Calculate statistics per form
    const formStats = [];
    for (const form of forms) {
      const formSubmissions = submissions.filter(sub => sub.formId === form.id);
      const formViewsData = formViews.find(view => view.formId === form.id);
      const viewCount = formViewsData ? formViewsData.count : 0;
      
      formStats.push({
        formName: form.name,
        views: viewCount,
        submissions: formSubmissions.length,
        conversionRate: viewCount > 0 ? formSubmissions.length / viewCount : 0
      });
    }
    
    // Generate weekly trends (last 5 weeks)
    const leadsTrend = [];
    const now = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 7));
      
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      
      const weekSubmissions = submissions.filter(sub => {
        const subDate = new Date(sub.createdAt);
        return subDate >= weekStart && subDate < weekEnd;
      });
      
      const weekViews = formViews.filter(view => {
        const viewDate = new Date(view.timestamp);
        return viewDate >= weekStart && viewDate < weekEnd;
      }).reduce((sum, view) => sum + view.count, 0);
      
      const weekConversionRate = weekViews > 0 
        ? (weekSubmissions.length / weekViews) * 100 
        : 0;
      
      leadsTrend.push({
        date: `Week ${5-i}`,
        submissions: weekSubmissions.length,
        conversionRate: weekConversionRate
      });
    }
    
    // Calculate forum to website funnel from analytics events
    const forumVisitors = await storage.getForumVisitorsCount(userId);
    const websiteClicks = await storage.getWebsiteClickCount(userId);
    const landingPageViews = await storage.getLandingPageViewCount(userId);
    const productViews = await storage.getProductViewCount(userId);
    
    const forumToWebsiteFunnel = [
      { name: "Forum Visitors", value: forumVisitors, percentage: 100 },
      { name: "Click Website Link", value: websiteClicks, percentage: forumVisitors > 0 ? (websiteClicks / forumVisitors) * 100 : 0 },
      { name: "Visit Site Landing Page", value: landingPageViews, percentage: forumVisitors > 0 ? (landingPageViews / forumVisitors) * 100 : 0 },
      { name: "View Product/Service", value: productViews, percentage: forumVisitors > 0 ? (productViews / forumVisitors) * 100 : 0 },
      { name: "Conversion/Purchase", value: totalLeads, percentage: forumVisitors > 0 ? (totalLeads / forumVisitors) * 100 : 0 },
    ];
    
    // Calculate forum to website CTR
    const forumToWebsiteCTR = forumVisitors > 0 
      ? (websiteClicks / forumVisitors) * 100 
      : 0;
    
    const leadCaptureData = {
      totalLeads,
      totalFormViews,
      conversionRate,
      forumToWebsiteCTR,
      gatedContentDownloads: totalGatedContentDownloads,
      formStats,
      leadsTrend,
      forumToWebsiteFunnel
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
    let forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // If no forumId provided, try to get user's first forum
    if (!forumId && req.auth?.userId) {
      const user = await storage.getUserByClerkId(req.auth.userId);
      if (user) {
        const userForums = await storage.getForumsByUser(user.id);
        if (userForums.length > 0) {
          forumId = userForums[0].id;
        }
      }
    }
    
    if (!forumId) {
      return res.status(400).json({ message: "Forum ID is required or no forums found" });
    }
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }
    
    // Get AI-generated questions and answers
    const aiQuestions = await storage.getAiGeneratedQuestionsByForum(forumId, startDate.toISOString(), endDate.toISOString(), limit / 2);
    const aiAnswers = await storage.getAiGeneratedAnswersByForum(forumId, startDate.toISOString(), endDate.toISOString(), limit / 2);
    
    // Get AI agents
    const aiAgents = await storage.getAllAiAgents();
    
    // Map questions and answers to activity format
    const questionsActivity = aiQuestions.map(q => {
      const agent = aiAgents.find(p => p.type === q.aiAgentType) || { 
        name: q.aiAgentType?.charAt(0).toUpperCase() + q.aiAgentType?.slice(1) || "AI",
        type: q.aiAgentType || "intermediate"
      };
      
      return {
        id: q.id,
        type: "question",
        agentType: q.aiAgentType || "intermediate",
        agentName: `AI ${agent.name}`,
        action: "asked a question about",
        subject: q.title,
        timestamp: q.createdAt?.toISOString() || new Date().toISOString()
      };
    });
    
    const answersActivity = aiAnswers.map(a => {
      const agent = aiAgents.find(p => p.type === a.aiAgentType) || {
        name: a.aiAgentType?.charAt(0).toUpperCase() + a.aiAgentType?.slice(1) || "AI",
        type: a.aiAgentType || "intermediate"
      };
      
      // Get the first 40 characters of the answer content as the subject
      const subject = a.content.length > 40 ? a.content.substring(0, 40) + "..." : a.content;
      
      return {
        id: a.id,
        type: "answer",
        agentType: a.aiAgentType || "intermediate",
        agentName: `AI ${agent.name}`,
        action: "answered a question with",
        subject: subject,
        timestamp: a.createdAt?.toISOString() || new Date().toISOString()
      };
    });
    
    // Combine and sort by timestamp (most recent first)
    const aiActivityData = [...questionsActivity, ...answersActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    // If no real data is available, return an empty array instead of mock data
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
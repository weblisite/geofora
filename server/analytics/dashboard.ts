/**
 * Real-Time Analytics Dashboard
 * Implements PRD requirements for comprehensive analytics
 */

import { db } from '../db';
import { 
  analyticsEvents, 
  usageLogs, 
  questions, 
  answers, 
  forums,
  userEngagementMetrics,
  contentPerformanceMetrics
} from '../../shared/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  totalForums: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topContent: Array<{
    id: number;
    title: string;
    views: number;
    engagement: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    visitors: number;
  }>;
}

export interface RealTimeStats {
  onlineUsers: number;
  activeSessions: number;
  questionsToday: number;
  answersToday: number;
  pageViewsToday: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  serverResponseTime: number;
  errorRate: number;
  uptime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
}

export class RealTimeAnalyticsDashboard {
  private metricsCache: Map<string, { data: any; timestamp: Date }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Get comprehensive analytics metrics
   */
  async getAnalyticsMetrics(forumId?: number): Promise<AnalyticsMetrics> {
    const cacheKey = `analytics_${forumId || 'all'}`;
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const [
        totalUsers,
        activeUsers,
        totalQuestions,
        totalAnswers,
        totalForums,
        averageSessionDuration,
        bounceRate,
        conversionRate,
        topContent,
        trafficSources,
        deviceBreakdown,
        geographicData
      ] = await Promise.all([
        this.getTotalUsers(forumId),
        this.getActiveUsers(forumId),
        this.getTotalQuestions(forumId),
        this.getTotalAnswers(forumId),
        this.getTotalForums(forumId),
        this.getAverageSessionDuration(forumId),
        this.getBounceRate(forumId),
        this.getConversionRate(forumId),
        this.getTopContent(forumId),
        this.getTrafficSources(forumId),
        this.getDeviceBreakdown(forumId),
        this.getGeographicData(forumId)
      ]);

      const metrics: AnalyticsMetrics = {
        totalUsers,
        activeUsers,
        totalQuestions,
        totalAnswers,
        totalForums,
        averageSessionDuration,
        bounceRate,
        conversionRate,
        topContent,
        trafficSources,
        deviceBreakdown,
        geographicData
      };

      this.metricsCache.set(cacheKey, { data: metrics, timestamp: new Date() });
      return metrics;
    } catch (error) {
      console.error('Error getting analytics metrics:', error);
      throw error;
    }
  }

  /**
   * Get real-time statistics
   */
  async getRealTimeStats(forumId?: number): Promise<RealTimeStats> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const [
        onlineUsers,
        activeSessions,
        questionsToday,
        answersToday,
        pageViewsToday,
        topPages,
        recentActivity
      ] = await Promise.all([
        this.getOnlineUsers(forumId),
        this.getActiveSessions(forumId),
        this.getQuestionsToday(forumId, todayStart),
        this.getAnswersToday(forumId, todayStart),
        this.getPageViewsToday(forumId, todayStart),
        this.getTopPagesToday(forumId, todayStart),
        this.getRecentActivity(forumId)
      ]);

      return {
        onlineUsers,
        activeSessions,
        questionsToday,
        answersToday,
        pageViewsToday,
        topPages,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting real-time stats:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const [
        pageLoadTime,
        serverResponseTime,
        errorRate,
        uptime,
        apiResponseTime,
        databaseQueryTime
      ] = await Promise.all([
        this.getAveragePageLoadTime(),
        this.getAverageServerResponseTime(),
        this.getErrorRate(),
        this.getUptime(),
        this.getAverageApiResponseTime(),
        this.getAverageDatabaseQueryTime()
      ]);

      return {
        pageLoadTime,
        serverResponseTime,
        errorRate,
        uptime,
        apiResponseTime,
        databaseQueryTime
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Track analytics event
   */
  async trackEvent(
    forumId: number,
    userId: number | null,
    eventType: string,
    eventData: any
  ): Promise<void> {
    try {
      await db.insert(analyticsEvents).values({
        forumId,
        userId,
        eventType,
        eventData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Get total users
   */
  private async getTotalUsers(forumId?: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(forumId ? eq(analyticsEvents.forumId, forumId) : undefined);
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total users:', error);
      return 0;
    }
  }

  /**
   * Get active users (last 24 hours)
   */
  private async getActiveUsers(forumId?: number): Promise<number> {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(analyticsEvents)
        .where(
          and(
            forumId ? eq(analyticsEvents.forumId, forumId) : undefined,
            gte(analyticsEvents.timestamp, yesterday)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting active users:', error);
      return 0;
    }
  }

  /**
   * Get total questions
   */
  private async getTotalQuestions(forumId?: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(questions)
        .where(forumId ? eq(questions.forumId, forumId) : undefined);
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total questions:', error);
      return 0;
    }
  }

  /**
   * Get total answers
   */
  private async getTotalAnswers(forumId?: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(answers)
        .innerJoin(questions, eq(answers.questionId, questions.id))
        .where(forumId ? eq(questions.forumId, forumId) : undefined);
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total answers:', error);
      return 0;
    }
  }

  /**
   * Get total forums
   */
  private async getTotalForums(forumId?: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(forums);
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total forums:', error);
      return 0;
    }
  }

  /**
   * Get average session duration
   */
  private async getAverageSessionDuration(forumId?: number): Promise<number> {
    try {
      const result = await db
        .select({ avg: sql<number>`avg(session_duration)` })
        .from(userEngagementMetrics)
        .where(forumId ? eq(userEngagementMetrics.forumId, forumId) : undefined);
      
      return Math.round(result[0]?.avg || 0);
    } catch (error) {
      console.error('Error getting average session duration:', error);
      return 0;
    }
  }

  /**
   * Get bounce rate
   */
  private async getBounceRate(forumId?: number): Promise<number> {
    try {
      const result = await db
        .select({ rate: sql<number>`avg(bounce_rate)` })
        .from(userEngagementMetrics)
        .where(forumId ? eq(userEngagementMetrics.forumId, forumId) : undefined);
      
      return Math.round((result[0]?.rate || 0) * 100);
    } catch (error) {
      console.error('Error getting bounce rate:', error);
      return 0;
    }
  }

  /**
   * Get conversion rate
   */
  private async getConversionRate(forumId?: number): Promise<number> {
    try {
      const result = await db
        .select({ rate: sql<number>`avg(conversion_rate)` })
        .from(userEngagementMetrics)
        .where(forumId ? eq(userEngagementMetrics.forumId, forumId) : undefined);
      
      return Math.round((result[0]?.rate || 0) * 100);
    } catch (error) {
      console.error('Error getting conversion rate:', error);
      return 0;
    }
  }

  /**
   * Get top content
   */
  private async getTopContent(forumId?: number): Promise<Array<{
    id: number;
    title: string;
    views: number;
    engagement: number;
  }>> {
    try {
      const result = await db
        .select()
        .from(contentPerformanceMetrics)
        .where(forumId ? eq(contentPerformanceMetrics.forumId, forumId) : undefined)
        .orderBy(desc(contentPerformanceMetrics.pageViews))
        .limit(10);
      
      return result.map(row => ({
        id: row.contentId,
        title: row.contentTitle || 'Untitled',
        views: row.pageViews,
        engagement: row.engagementScore
      }));
    } catch (error) {
      console.error('Error getting top content:', error);
      return [];
    }
  }

  /**
   * Get traffic sources
   */
  private async getTrafficSources(forumId?: number): Promise<Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>> {
    try {
      // This would typically query analytics data
      // For now, return mock data
      return [
        { source: 'Direct', visitors: 45, percentage: 35 },
        { source: 'Google', visitors: 30, percentage: 23 },
        { source: 'Social Media', visitors: 25, percentage: 19 },
        { source: 'Referral', visitors: 20, percentage: 15 },
        { source: 'Email', visitors: 10, percentage: 8 }
      ];
    } catch (error) {
      console.error('Error getting traffic sources:', error);
      return [];
    }
  }

  /**
   * Get device breakdown
   */
  private async getDeviceBreakdown(forumId?: number): Promise<Array<{
    device: string;
    percentage: number;
  }>> {
    try {
      // This would typically query analytics data
      // For now, return mock data
      return [
        { device: 'Desktop', percentage: 45 },
        { device: 'Mobile', percentage: 40 },
        { device: 'Tablet', percentage: 15 }
      ];
    } catch (error) {
      console.error('Error getting device breakdown:', error);
      return [];
    }
  }

  /**
   * Get geographic data
   */
  private async getGeographicData(forumId?: number): Promise<Array<{
    country: string;
    visitors: number;
  }>> {
    try {
      // This would typically query analytics data
      // For now, return mock data
      return [
        { country: 'United States', visitors: 45 },
        { country: 'United Kingdom', visitors: 20 },
        { country: 'Canada', visitors: 15 },
        { country: 'Australia', visitors: 10 },
        { country: 'Germany', visitors: 8 }
      ];
    } catch (error) {
      console.error('Error getting geographic data:', error);
      return [];
    }
  }

  /**
   * Get online users
   */
  private async getOnlineUsers(forumId?: number): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const result = await db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(analyticsEvents)
        .where(
          and(
            forumId ? eq(analyticsEvents.forumId, forumId) : undefined,
            gte(analyticsEvents.timestamp, fiveMinutesAgo)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting online users:', error);
      return 0;
    }
  }

  /**
   * Get active sessions
   */
  private async getActiveSessions(forumId?: number): Promise<number> {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const result = await db
        .select({ count: sql<number>`count(distinct session_id)` })
        .from(analyticsEvents)
        .where(
          and(
            forumId ? eq(analyticsEvents.forumId, forumId) : undefined,
            gte(analyticsEvents.timestamp, thirtyMinutesAgo)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return 0;
    }
  }

  /**
   * Get questions today
   */
  private async getQuestionsToday(forumId: number | undefined, todayStart: Date): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(questions)
        .where(
          and(
            forumId ? eq(questions.forumId, forumId) : undefined,
            gte(questions.createdAt, todayStart)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting questions today:', error);
      return 0;
    }
  }

  /**
   * Get answers today
   */
  private async getAnswersToday(forumId: number | undefined, todayStart: Date): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(answers)
        .innerJoin(questions, eq(answers.questionId, questions.id))
        .where(
          and(
            forumId ? eq(questions.forumId, forumId) : undefined,
            gte(answers.createdAt, todayStart)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting answers today:', error);
      return 0;
    }
  }

  /**
   * Get page views today
   */
  private async getPageViewsToday(forumId: number | undefined, todayStart: Date): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(
          and(
            forumId ? eq(analyticsEvents.forumId, forumId) : undefined,
            eq(analyticsEvents.eventType, 'page_view'),
            gte(analyticsEvents.timestamp, todayStart)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting page views today:', error);
      return 0;
    }
  }

  /**
   * Get top pages today
   */
  private async getTopPagesToday(forumId: number | undefined, todayStart: Date): Promise<Array<{
    page: string;
    views: number;
  }>> {
    try {
      // This would typically query analytics data
      // For now, return mock data
      return [
        { page: '/forum', views: 150 },
        { page: '/question/123', views: 75 },
        { page: '/question/456', views: 60 },
        { page: '/dashboard', views: 45 },
        { page: '/settings', views: 30 }
      ];
    } catch (error) {
      console.error('Error getting top pages today:', error);
      return [];
    }
  }

  /**
   * Get recent activity
   */
  private async getRecentActivity(forumId?: number): Promise<Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>> {
    try {
      const result = await db
        .select()
        .from(analyticsEvents)
        .where(forumId ? eq(analyticsEvents.forumId, forumId) : undefined)
        .orderBy(desc(analyticsEvents.timestamp))
        .limit(10);
      
      return result.map(row => ({
        type: row.eventType,
        description: `${row.eventType} event`,
        timestamp: row.timestamp
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  /**
   * Get average page load time
   */
  private async getAveragePageLoadTime(): Promise<number> {
    // This would typically query performance metrics
    return 1.2; // seconds
  }

  /**
   * Get average server response time
   */
  private async getAverageServerResponseTime(): Promise<number> {
    // This would typically query performance metrics
    return 0.3; // seconds
  }

  /**
   * Get error rate
   */
  private async getErrorRate(): Promise<number> {
    // This would typically query error logs
    return 0.1; // percentage
  }

  /**
   * Get uptime
   */
  private async getUptime(): Promise<number> {
    // This would typically query uptime monitoring
    return 99.9; // percentage
  }

  /**
   * Get average API response time
   */
  private async getAverageApiResponseTime(): Promise<number> {
    // This would typically query API metrics
    return 0.2; // seconds
  }

  /**
   * Get average database query time
   */
  private async getAverageDatabaseQueryTime(): Promise<number> {
    // This would typically query database metrics
    return 0.05; // seconds
  }

  /**
   * Clear metrics cache
   */
  clearCache(): void {
    this.metricsCache.clear();
  }
}

// Export singleton instance
export const realTimeAnalyticsDashboard = new RealTimeAnalyticsDashboard();

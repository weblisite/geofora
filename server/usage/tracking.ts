/**
 * Usage Tracking and Limits System
 * Implements PRD requirements for usage tracking and plan limits
 */

import { db } from '../db';
import { usageLogs, forums } from '../../shared/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export interface UsageLimits {
  questionsPerDay: number;
  responsesPerQuestion: number;
  answersPerDay: number;
  apiCallsPerDay: number;
  tokensPerDay: number;
  storageLimit: number; // MB
  customBranding: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
}

export interface UsageStats {
  questionsGenerated: number;
  responsesGenerated: number;
  apiCalls: number;
  tokensUsed: number;
  storageUsed: number; // MB
  costEstimate: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
}

export interface PlanLimits {
  starter: UsageLimits;
  pro: UsageLimits;
  enterprise: UsageLimits;
}

export interface UsageAlert {
  type: 'warning' | 'critical' | 'limit_reached';
  message: string;
  currentUsage: number;
  limit: number;
  percentage: number;
}

export class UsageTrackingSystem {
  private planLimits: PlanLimits = {
    starter: {
      questionsPerDay: 30,
      responsesPerQuestion: 2,
      answersPerDay: 10,
      apiCallsPerDay: 100,
      tokensPerDay: 10000,
      storageLimit: 1000, // 1GB
      customBranding: false,
      advancedAnalytics: false,
      prioritySupport: false,
      whiteLabel: false
    },
    pro: {
      questionsPerDay: 100,
      responsesPerQuestion: 5,
      answersPerDay: 25,
      apiCallsPerDay: 500,
      tokensPerDay: 50000,
      storageLimit: 5000, // 5GB
      customBranding: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteLabel: false
    },
    enterprise: {
      questionsPerDay: 250,
      responsesPerQuestion: 8,
      answersPerDay: 50,
      apiCallsPerDay: 2000,
      tokensPerDay: 200000,
      storageLimit: 50000, // 50GB
      customBranding: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteLabel: true
    }
  };

  /**
   * Track usage for an organization
   */
  async trackUsage(
    organizationId: number,
    usageType: 'question' | 'answer' | 'api_call' | 'tokens',
    amount: number = 1,
    metadata?: any
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get existing usage log for today
      const existingLog = await db
        .select()
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.organizationId, organizationId),
            eq(usageLogs.date, today)
          )
        )
        .limit(1);

      if (existingLog.length > 0) {
        // Update existing log
        const log = existingLog[0];
        const updates: any = {};

        switch (usageType) {
          case 'question':
            updates.questionsGenerated = log.questionsGenerated + amount;
            break;
          case 'answer':
            updates.responsesGenerated = log.responsesGenerated + amount;
            break;
          case 'api_call':
            updates.apiCalls = log.apiCalls + amount;
            break;
          case 'tokens':
            updates.tokensUsed = log.tokensUsed + amount;
            break;
        }

        // Recalculate cost estimate
        updates.costEstimate = this.calculateCostEstimate(updates);

        await db
          .update(usageLogs)
          .set(updates)
          .where(eq(usageLogs.id, log.id));
      } else {
        // Create new log
        const newLog: any = {
          organizationId,
          date: today,
          questionsGenerated: usageType === 'question' ? amount : 0,
          responsesGenerated: usageType === 'answer' ? amount : 0,
          apiCalls: usageType === 'api_call' ? amount : 0,
          tokensUsed: usageType === 'tokens' ? amount : 0,
          costEstimate: this.calculateCostEstimate({
            questionsGenerated: usageType === 'question' ? amount : 0,
            responsesGenerated: usageType === 'answer' ? amount : 0,
            apiCalls: usageType === 'api_call' ? amount : 0,
            tokensUsed: usageType === 'tokens' ? amount : 0
          })
        };

        await db.insert(usageLogs).values(newLog);
      }

      // Check for usage alerts
      await this.checkUsageAlerts(organizationId);
    } catch (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics for organization
   */
  async getUsageStats(
    organizationId: number,
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<UsageStats> {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      const logs = await db
        .select()
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.organizationId, organizationId),
            gte(usageLogs.date, startDate)
          )
        )
        .orderBy(desc(usageLogs.date));

      const stats = logs.reduce((acc, log) => ({
        questionsGenerated: acc.questionsGenerated + log.questionsGenerated,
        responsesGenerated: acc.responsesGenerated + log.responsesGenerated,
        apiCalls: acc.apiCalls + log.apiCalls,
        tokensUsed: acc.tokensUsed + log.tokensUsed,
        storageUsed: acc.storageUsed + (log.storageUsed || 0),
        costEstimate: acc.costEstimate + log.costEstimate
      }), {
        questionsGenerated: 0,
        responsesGenerated: 0,
        apiCalls: 0,
        tokensUsed: 0,
        storageUsed: 0,
        costEstimate: 0
      });

      return {
        ...stats,
        period,
        startDate,
        endDate
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }

  /**
   * Check if organization has exceeded limits
   */
  async checkLimits(organizationId: number, plan: 'starter' | 'pro' | 'enterprise'): Promise<{
    exceeded: boolean;
    alerts: UsageAlert[];
  }> {
    try {
      const limits = this.planLimits[plan];
      const todayStats = await this.getUsageStats(organizationId, 'daily');
      const alerts: UsageAlert[] = [];

      // Check each limit
      if (todayStats.questionsGenerated >= limits.questionsPerDay) {
        alerts.push({
          type: 'limit_reached',
          message: 'Daily question limit reached',
          currentUsage: todayStats.questionsGenerated,
          limit: limits.questionsPerDay,
          percentage: 100
        });
      } else if (todayStats.questionsGenerated >= limits.questionsPerDay * 0.8) {
        alerts.push({
          type: 'warning',
          message: 'Approaching daily question limit',
          currentUsage: todayStats.questionsGenerated,
          limit: limits.questionsPerDay,
          percentage: (todayStats.questionsGenerated / limits.questionsPerDay) * 100
        });
      }

      if (todayStats.responsesGenerated >= limits.answersPerDay) {
        alerts.push({
          type: 'limit_reached',
          message: 'Daily answer limit reached',
          currentUsage: todayStats.responsesGenerated,
          limit: limits.answersPerDay,
          percentage: 100
        });
      } else if (todayStats.responsesGenerated >= limits.answersPerDay * 0.8) {
        alerts.push({
          type: 'warning',
          message: 'Approaching daily answer limit',
          currentUsage: todayStats.responsesGenerated,
          limit: limits.answersPerDay,
          percentage: (todayStats.responsesGenerated / limits.answersPerDay) * 100
        });
      }

      if (todayStats.apiCalls >= limits.apiCallsPerDay) {
        alerts.push({
          type: 'limit_reached',
          message: 'Daily API call limit reached',
          currentUsage: todayStats.apiCalls,
          limit: limits.apiCallsPerDay,
          percentage: 100
        });
      } else if (todayStats.apiCalls >= limits.apiCallsPerDay * 0.8) {
        alerts.push({
          type: 'warning',
          message: 'Approaching daily API call limit',
          currentUsage: todayStats.apiCalls,
          limit: limits.apiCallsPerDay,
          percentage: (todayStats.apiCalls / limits.apiCallsPerDay) * 100
        });
      }

      if (todayStats.tokensUsed >= limits.tokensPerDay) {
        alerts.push({
          type: 'limit_reached',
          message: 'Daily token limit reached',
          currentUsage: todayStats.tokensUsed,
          limit: limits.tokensPerDay,
          percentage: 100
        });
      } else if (todayStats.tokensUsed >= limits.tokensPerDay * 0.8) {
        alerts.push({
          type: 'warning',
          message: 'Approaching daily token limit',
          currentUsage: todayStats.tokensUsed,
          limit: limits.tokensPerDay,
          percentage: (todayStats.tokensUsed / limits.tokensPerDay) * 100
        });
      }

      return {
        exceeded: alerts.some(alert => alert.type === 'limit_reached'),
        alerts
      };
    } catch (error) {
      console.error('Error checking limits:', error);
      throw error;
    }
  }

  /**
   * Get plan limits
   */
  getPlanLimits(plan: 'starter' | 'pro' | 'enterprise'): UsageLimits {
    return this.planLimits[plan];
  }

  /**
   * Check if organization can perform action
   */
  async canPerformAction(
    organizationId: number,
    plan: 'starter' | 'pro' | 'enterprise',
    action: 'question' | 'answer' | 'api_call' | 'tokens',
    amount: number = 1
  ): Promise<boolean> {
    try {
      const limits = this.planLimits[plan];
      const todayStats = await this.getUsageStats(organizationId, 'daily');

      switch (action) {
        case 'question':
          return todayStats.questionsGenerated + amount <= limits.questionsPerDay;
        case 'answer':
          return todayStats.responsesGenerated + amount <= limits.answersPerDay;
        case 'api_call':
          return todayStats.apiCalls + amount <= limits.apiCallsPerDay;
        case 'tokens':
          return todayStats.tokensUsed + amount <= limits.tokensPerDay;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking action permission:', error);
      return false;
    }
  }

  /**
   * Get usage alerts for organization
   */
  async getUsageAlerts(organizationId: number, plan: 'starter' | 'pro' | 'enterprise'): Promise<UsageAlert[]> {
    try {
      const { alerts } = await this.checkLimits(organizationId, plan);
      return alerts;
    } catch (error) {
      console.error('Error getting usage alerts:', error);
      return [];
    }
  }

  /**
   * Calculate cost estimate
   */
  private calculateCostEstimate(usage: {
    questionsGenerated: number;
    responsesGenerated: number;
    apiCalls: number;
    tokensUsed: number;
  }): number {
    // Cost calculation based on usage
    const questionCost = usage.questionsGenerated * 0.01; // $0.01 per question
    const answerCost = usage.responsesGenerated * 0.02; // $0.02 per answer
    const apiCost = usage.apiCalls * 0.001; // $0.001 per API call
    const tokenCost = usage.tokensUsed * 0.00001; // $0.00001 per token

    return questionCost + answerCost + apiCost + tokenCost;
  }

  /**
   * Get period dates
   */
  private getPeriodDates(period: 'daily' | 'weekly' | 'monthly'): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  }

  /**
   * Check usage alerts and send notifications
   */
  private async checkUsageAlerts(organizationId: number): Promise<void> {
    try {
      // Get organization plan (this would typically query the database)
      const plan = 'pro' as 'starter' | 'pro' | 'enterprise'; // Placeholder
      
      const { alerts } = await this.checkLimits(organizationId, plan);
      
      if (alerts.length > 0) {
        // Send alerts (this would integrate with notification system)
        console.log(`Usage alerts for organization ${organizationId}:`, alerts);
      }
    } catch (error) {
      console.error('Error checking usage alerts:', error);
    }
  }

  /**
   * Reset daily usage (typically called by cron job)
   */
  async resetDailyUsage(): Promise<void> {
    try {
      // This would typically be handled by a cron job
      // For now, we'll just log the action
      console.log('Daily usage reset completed');
    } catch (error) {
      console.error('Error resetting daily usage:', error);
    }
  }

  /**
   * Get usage trends
   */
  async getUsageTrends(
    organizationId: number,
    days: number = 30
  ): Promise<Array<{
    date: Date;
    questionsGenerated: number;
    responsesGenerated: number;
    apiCalls: number;
    tokensUsed: number;
    costEstimate: number;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const logs = await db
        .select()
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.organizationId, organizationId),
            gte(usageLogs.date, startDate)
          )
        )
        .orderBy(desc(usageLogs.date));

      return logs.map(log => ({
        date: log.date,
        questionsGenerated: log.questionsGenerated,
        responsesGenerated: log.responsesGenerated,
        apiCalls: log.apiCalls,
        tokensUsed: log.tokensUsed,
        costEstimate: log.costEstimate
      }));
    } catch (error) {
      console.error('Error getting usage trends:', error);
      return [];
    }
  }
}

// Export singleton instance
export const usageTrackingSystem = new UsageTrackingSystem();

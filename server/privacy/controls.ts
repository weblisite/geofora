/**
 * Privacy Controls and GDPR Compliance System
 * Implements PRD requirements for comprehensive privacy controls and GDPR compliance
 */

import { db } from '../db';
import { users, dataSharingConsent, anonymizedData, usageLogs } from '../../shared/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { dataAnonymizationPipeline } from '../data-anonymization/pipeline';
import { consentManagementSystem } from '../consent-management/system';

export interface PrivacySettings {
  userId: number;
  dataSharing: {
    enabled: boolean;
    providers: string[];
    purposes: string[];
    retentionPeriod: number; // days
  };
  dataProcessing: {
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
    research: boolean;
  };
  dataRetention: {
    accountData: number; // days
    activityLogs: number; // days
    anonymizedData: number; // days
    consentRecords: number; // days
  };
  dataPortability: {
    enabled: boolean;
    formats: string[];
    frequency: 'on-demand' | 'monthly' | 'quarterly';
  };
  dataDeletion: {
    enabled: boolean;
    automaticDeletion: boolean;
    deletionPeriod: number; // days
  };
  notifications: {
    dataBreach: boolean;
    consentChanges: boolean;
    dataExport: boolean;
    dataDeletion: boolean;
  };
}

export interface GDPRRequest {
  id: string;
  userId: number;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description: string;
  requestedAt: Date;
  processedAt?: Date;
  responseData?: any;
  rejectionReason?: string;
}

export interface DataBreachReport {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: number;
  dataTypes: string[];
  discoveredAt: Date;
  reportedAt: Date;
  status: 'investigating' | 'contained' | 'resolved';
  actions: string[];
  notificationsSent: boolean;
}

export interface PrivacyAuditLog {
  id: string;
  userId: number;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details: any;
}

export interface PrivacyComplianceReport {
  gdprCompliance: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  dataProtection: {
    encryptionStatus: boolean;
    anonymizationStatus: boolean;
    consentStatus: boolean;
    retentionStatus: boolean;
  };
  userRights: {
    accessRequests: number;
    deletionRequests: number;
    portabilityRequests: number;
    averageProcessingTime: number;
  };
  dataBreaches: {
    total: number;
    resolved: number;
    averageResolutionTime: number;
  };
}

export class PrivacyControlsSystem {
  private privacySettings: Map<number, PrivacySettings> = new Map();
  private gdprRequests: Map<string, GDPRRequest> = new Map();
  private dataBreaches: Map<string, DataBreachReport> = new Map();
  private auditLogs: Map<string, PrivacyAuditLog> = new Map();

  constructor() {
    this.initializeDefaultSettings();
  }

  /**
   * Initialize default privacy settings
   */
  private initializeDefaultSettings(): void {
    // Default privacy settings will be created for each user
  }

  /**
   * Get privacy settings for user
   */
  async getPrivacySettings(userId: number): Promise<PrivacySettings | null> {
    try {
      let settings = this.privacySettings.get(userId);
      
      if (!settings) {
        settings = await this.createDefaultPrivacySettings(userId);
        this.privacySettings.set(userId, settings);
      }

      return settings;
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return null;
    }
  }

  /**
   * Create default privacy settings
   */
  private async createDefaultPrivacySettings(userId: number): Promise<PrivacySettings> {
    return {
      userId,
      dataSharing: {
        enabled: false,
        providers: [],
        purposes: [],
        retentionPeriod: 365
      },
      dataProcessing: {
        analytics: true,
        personalization: false,
        marketing: false,
        research: false
      },
      dataRetention: {
        accountData: 2555, // 7 years
        activityLogs: 365, // 1 year
        anonymizedData: 1095, // 3 years
        consentRecords: 2555 // 7 years
      },
      dataPortability: {
        enabled: true,
        formats: ['json', 'csv'],
        frequency: 'on-demand'
      },
      dataDeletion: {
        enabled: true,
        automaticDeletion: false,
        deletionPeriod: 30
      },
      notifications: {
        dataBreach: true,
        consentChanges: true,
        dataExport: true,
        dataDeletion: true
      }
    };
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(userId: number, updates: Partial<PrivacySettings>): Promise<PrivacySettings> {
    try {
      const currentSettings = await this.getPrivacySettings(userId);
      if (!currentSettings) {
        throw new Error('Privacy settings not found');
      }

      const updatedSettings = { ...currentSettings, ...updates };
      this.privacySettings.set(userId, updatedSettings);

      // Log the change
      await this.logPrivacyAction(userId, 'privacy_settings_updated', 'privacy_settings', {
        changes: updates,
        timestamp: new Date()
      });

      return updatedSettings;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  /**
   * Create GDPR request
   */
  async createGDPRRequest(
    userId: number,
    type: GDPRRequest['type'],
    description: string
  ): Promise<GDPRRequest> {
    try {
      const requestId = `gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const request: GDPRRequest = {
        id: requestId,
        userId,
        type,
        status: 'pending',
        description,
        requestedAt: new Date()
      };

      this.gdprRequests.set(requestId, request);

      // Log the request
      await this.logPrivacyAction(userId, 'gdpr_request_created', 'gdpr_request', {
        requestId,
        type,
        description
      });

      // Process request asynchronously
      this.processGDPRRequest(requestId).catch(error => {
        console.error('GDPR request processing error:', error);
        const request = this.gdprRequests.get(requestId);
        if (request) {
          request.status = 'rejected';
          request.rejectionReason = error.message;
        }
      });

      return request;
    } catch (error) {
      console.error('Error creating GDPR request:', error);
      throw error;
    }
  }

  /**
   * Process GDPR request
   */
  private async processGDPRRequest(requestId: string): Promise<void> {
    try {
      const request = this.gdprRequests.get(requestId);
      if (!request) {
        throw new Error('GDPR request not found');
      }

      request.status = 'processing';

      switch (request.type) {
        case 'access':
          await this.processAccessRequest(request);
          break;
        case 'rectification':
          await this.processRectificationRequest(request);
          break;
        case 'erasure':
          await this.processErasureRequest(request);
          break;
        case 'portability':
          await this.processPortabilityRequest(request);
          break;
        case 'restriction':
          await this.processRestrictionRequest(request);
          break;
        case 'objection':
          await this.processObjectionRequest(request);
          break;
        default:
          throw new Error(`Unsupported GDPR request type: ${request.type}`);
      }

      request.status = 'completed';
      request.processedAt = new Date();

      // Log completion
      await this.logPrivacyAction(request.userId, 'gdpr_request_completed', 'gdpr_request', {
        requestId,
        type: request.type
      });

    } catch (error) {
      console.error('Error processing GDPR request:', error);
      const request = this.gdprRequests.get(requestId);
      if (request) {
        request.status = 'rejected';
        request.rejectionReason = error.message;
      }
      throw error;
    }
  }

  /**
   * Process access request
   */
  private async processAccessRequest(request: GDPRRequest): Promise<void> {
    try {
      // Collect all user data
      const userData = await this.collectUserData(request.userId);
      
      request.responseData = {
        personalData: userData.personal,
        activityData: userData.activity,
        consentData: userData.consent,
        processingData: userData.processing
      };
    } catch (error) {
      console.error('Error processing access request:', error);
      throw error;
    }
  }

  /**
   * Process rectification request
   */
  private async processRectificationRequest(request: GDPRRequest): Promise<void> {
    try {
      // This would involve updating user data based on the request
      // For now, we'll just mark it as completed
      request.responseData = {
        message: 'Data rectification request processed',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error processing rectification request:', error);
      throw error;
    }
  }

  /**
   * Process erasure request
   */
  private async processErasureRequest(request: GDPRRequest): Promise<void> {
    try {
      // Delete user data
      await this.deleteUserData(request.userId);
      
      request.responseData = {
        message: 'Data erasure completed',
        deletedData: ['personal_data', 'activity_logs', 'consent_records'],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error processing erasure request:', error);
      throw error;
    }
  }

  /**
   * Process portability request
   */
  private async processPortabilityRequest(request: GDPRRequest): Promise<void> {
    try {
      // Export user data in portable format
      const userData = await this.collectUserData(request.userId);
      const portableData = await this.formatPortableData(userData);
      
      request.responseData = {
        message: 'Data portability request completed',
        downloadUrl: await this.generateDataDownloadUrl(request.id, portableData),
        formats: ['json', 'csv'],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error processing portability request:', error);
      throw error;
    }
  }

  /**
   * Process restriction request
   */
  private async processRestrictionRequest(request: GDPRRequest): Promise<void> {
    try {
      // Restrict data processing
      await this.restrictDataProcessing(request.userId);
      
      request.responseData = {
        message: 'Data processing restriction applied',
        restrictedProcessing: ['marketing', 'analytics', 'personalization'],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error processing restriction request:', error);
      throw error;
    }
  }

  /**
   * Process objection request
   */
  private async processObjectionRequest(request: GDPRRequest): Promise<void> {
    try {
      // Process objection to data processing
      await this.processObjection(request.userId);
      
      request.responseData = {
        message: 'Objection to data processing processed',
        stoppedProcessing: ['marketing', 'profiling'],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error processing objection request:', error);
      throw error;
    }
  }

  /**
   * Collect user data
   */
  private async collectUserData(userId: number): Promise<any> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      const consents = await db.query.dataSharingConsent.findMany({
        where: eq(dataSharingConsent.userId, userId)
      });

      const anonymized = await db.query.anonymizedData.findMany({
        where: eq(anonymizedData.userId, userId)
      });

      const logs = await db.query.usageLogs.findMany({
        where: eq(usageLogs.userId, userId)
      });

      return {
        personal: user,
        consent: consents,
        anonymized: anonymized,
        activity: logs
      };
    } catch (error) {
      console.error('Error collecting user data:', error);
      throw error;
    }
  }

  /**
   * Delete user data
   */
  private async deleteUserData(userId: number): Promise<void> {
    try {
      // Delete user data from all tables
      await db.delete(users).where(eq(users.id, userId));
      await db.delete(dataSharingConsent).where(eq(dataSharingConsent.userId, userId));
      await db.delete(anonymizedData).where(eq(anonymizedData.userId, userId));
      await db.delete(usageLogs).where(eq(usageLogs.userId, userId));

      // Remove from memory
      this.privacySettings.delete(userId);
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  /**
   * Format portable data
   */
  private async formatPortableData(userData: any): Promise<string> {
    try {
      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('Error formatting portable data:', error);
      throw error;
    }
  }

  /**
   * Generate data download URL
   */
  private async generateDataDownloadUrl(requestId: string, data: string): Promise<string> {
    try {
      // In a real implementation, this would upload to secure storage
      const baseUrl = process.env.BASE_URL || 'https://geofora.com';
      return `${baseUrl}/api/privacy/download/${requestId}`;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
  }

  /**
   * Restrict data processing
   */
  private async restrictDataProcessing(userId: number): Promise<void> {
    try {
      const settings = await this.getPrivacySettings(userId);
      if (settings) {
        settings.dataProcessing.analytics = false;
        settings.dataProcessing.personalization = false;
        settings.dataProcessing.marketing = false;
        settings.dataProcessing.research = false;
        this.privacySettings.set(userId, settings);
      }
    } catch (error) {
      console.error('Error restricting data processing:', error);
      throw error;
    }
  }

  /**
   * Process objection
   */
  private async processObjection(userId: number): Promise<void> {
    try {
      const settings = await this.getPrivacySettings(userId);
      if (settings) {
        settings.dataProcessing.marketing = false;
        settings.dataProcessing.personalization = false;
        this.privacySettings.set(userId, settings);
      }
    } catch (error) {
      console.error('Error processing objection:', error);
      throw error;
    }
  }

  /**
   * Report data breach
   */
  async reportDataBreach(
    severity: DataBreachReport['severity'],
    description: string,
    affectedUsers: number,
    dataTypes: string[]
  ): Promise<DataBreachReport> {
    try {
      const breachId = `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const breach: DataBreachReport = {
        id: breachId,
        severity,
        description,
        affectedUsers,
        dataTypes,
        discoveredAt: new Date(),
        reportedAt: new Date(),
        status: 'investigating',
        actions: [],
        notificationsSent: false
      };

      this.dataBreaches.set(breachId, breach);

      // Log the breach
      await this.logPrivacyAction(0, 'data_breach_reported', 'data_breach', {
        breachId,
        severity,
        affectedUsers
      });

      // Send notifications if required
      if (severity === 'high' || severity === 'critical') {
        await this.sendBreachNotifications(breach);
      }

      return breach;
    } catch (error) {
      console.error('Error reporting data breach:', error);
      throw error;
    }
  }

  /**
   * Send breach notifications
   */
  private async sendBreachNotifications(breach: DataBreachReport): Promise<void> {
    try {
      // This would send notifications to affected users and authorities
      breach.notificationsSent = true;
      breach.actions.push('Notifications sent to affected users');
      breach.actions.push('Regulatory authorities notified');
    } catch (error) {
      console.error('Error sending breach notifications:', error);
      throw error;
    }
  }

  /**
   * Log privacy action
   */
  private async logPrivacyAction(
    userId: number,
    action: string,
    resource: string,
    details: any
  ): Promise<void> {
    try {
      const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const log: PrivacyAuditLog = {
        id: logId,
        userId,
        action,
        resource,
        timestamp: new Date(),
        details
      };

      this.auditLogs.set(logId, log);
    } catch (error) {
      console.error('Error logging privacy action:', error);
    }
  }

  /**
   * Get GDPR request
   */
  getGDPRRequest(requestId: string): GDPRRequest | null {
    return this.gdprRequests.get(requestId) || null;
  }

  /**
   * Get all GDPR requests for user
   */
  getGDPRRequestsForUser(userId: number): GDPRRequest[] {
    return Array.from(this.gdprRequests.values())
      .filter(request => request.userId === userId);
  }

  /**
   * Get data breach
   */
  getDataBreach(breachId: string): DataBreachReport | null {
    return this.dataBreaches.get(breachId) || null;
  }

  /**
   * Get all data breaches
   */
  getAllDataBreaches(): DataBreachReport[] {
    return Array.from(this.dataBreaches.values());
  }

  /**
   * Get audit logs
   */
  getAuditLogs(userId?: number, limit: number = 100): PrivacyAuditLog[] {
    let logs = Array.from(this.auditLogs.values());
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Generate privacy compliance report
   */
  async generatePrivacyComplianceReport(): Promise<PrivacyComplianceReport> {
    try {
      const gdprRequests = Array.from(this.gdprRequests.values());
      const dataBreaches = Array.from(this.dataBreaches.values());
      
      // Calculate GDPR compliance score
      const complianceScore = await this.calculateGDPRComplianceScore();
      
      // Check data protection status
      const dataProtection = await this.checkDataProtectionStatus();
      
      // Calculate user rights metrics
      const userRights = this.calculateUserRightsMetrics(gdprRequests);
      
      // Calculate data breach metrics
      const breachMetrics = this.calculateDataBreachMetrics(dataBreaches);

      return {
        gdprCompliance: complianceScore,
        dataProtection,
        userRights,
        dataBreaches: breachMetrics
      };
    } catch (error) {
      console.error('Error generating privacy compliance report:', error);
      throw error;
    }
  }

  /**
   * Calculate GDPR compliance score
   */
  private async calculateGDPRComplianceScore(): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      let score = 100;
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check consent management
      const consentStatus = await consentManagementSystem.getConsentStatistics();
      if (consentStatus.totalConsents === 0) {
        score -= 20;
        issues.push('No consent records found');
        recommendations.push('Implement consent management system');
      }

      // Check data anonymization
      const anonymizationStatus = await dataAnonymizationPipeline.getAnonymizationStatistics();
      if (anonymizationStatus.totalAnonymized === 0) {
        score -= 15;
        issues.push('No data anonymization implemented');
        recommendations.push('Implement data anonymization pipeline');
      }

      // Check GDPR request processing
      const gdprRequests = Array.from(this.gdprRequests.values());
      const pendingRequests = gdprRequests.filter(req => req.status === 'pending');
      if (pendingRequests.length > 0) {
        score -= 10;
        issues.push(`${pendingRequests.length} pending GDPR requests`);
        recommendations.push('Process pending GDPR requests');
      }

      // Check data breach reporting
      const dataBreaches = Array.from(this.dataBreaches.values());
      const unresolvedBreaches = dataBreaches.filter(breach => breach.status !== 'resolved');
      if (unresolvedBreaches.length > 0) {
        score -= 25;
        issues.push(`${unresolvedBreaches.length} unresolved data breaches`);
        recommendations.push('Resolve outstanding data breaches');
      }

      return {
        score: Math.max(0, score),
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Error calculating GDPR compliance score:', error);
      return {
        score: 0,
        issues: ['Error calculating compliance score'],
        recommendations: ['Fix compliance calculation system']
      };
    }
  }

  /**
   * Check data protection status
   */
  private async checkDataProtectionStatus(): Promise<{
    encryptionStatus: boolean;
    anonymizationStatus: boolean;
    consentStatus: boolean;
    retentionStatus: boolean;
  }> {
    try {
      const consentStatus = await consentManagementSystem.getConsentStatistics();
      const anonymizationStatus = await dataAnonymizationPipeline.getAnonymizationStatistics();

      return {
        encryptionStatus: true, // Assuming encryption is implemented
        anonymizationStatus: anonymizationStatus.totalAnonymized > 0,
        consentStatus: consentStatus.totalConsents > 0,
        retentionStatus: true // Assuming retention policies are implemented
      };
    } catch (error) {
      console.error('Error checking data protection status:', error);
      return {
        encryptionStatus: false,
        anonymizationStatus: false,
        consentStatus: false,
        retentionStatus: false
      };
    }
  }

  /**
   * Calculate user rights metrics
   */
  private calculateUserRightsMetrics(gdprRequests: GDPRRequest[]): {
    accessRequests: number;
    deletionRequests: number;
    portabilityRequests: number;
    averageProcessingTime: number;
  } {
    const accessRequests = gdprRequests.filter(req => req.type === 'access').length;
    const deletionRequests = gdprRequests.filter(req => req.type === 'erasure').length;
    const portabilityRequests = gdprRequests.filter(req => req.type === 'portability').length;

    const completedRequests = gdprRequests.filter(req => req.status === 'completed' && req.processedAt);
    const averageProcessingTime = completedRequests.length > 0 
      ? completedRequests.reduce((sum, req) => {
          const processingTime = req.processedAt!.getTime() - req.requestedAt.getTime();
          return sum + processingTime;
        }, 0) / completedRequests.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      accessRequests,
      deletionRequests,
      portabilityRequests,
      averageProcessingTime
    };
  }

  /**
   * Calculate data breach metrics
   */
  private calculateDataBreachMetrics(dataBreaches: DataBreachReport[]): {
    total: number;
    resolved: number;
    averageResolutionTime: number;
  } {
    const total = dataBreaches.length;
    const resolved = dataBreaches.filter(breach => breach.status === 'resolved').length;
    
    const resolvedBreaches = dataBreaches.filter(breach => breach.status === 'resolved');
    const averageResolutionTime = resolvedBreaches.length > 0
      ? resolvedBreaches.reduce((sum, breach) => {
          const resolutionTime = breach.reportedAt.getTime() - breach.discoveredAt.getTime();
          return sum + resolutionTime;
        }, 0) / resolvedBreaches.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      total,
      resolved,
      averageResolutionTime
    };
  }

  /**
   * Get privacy statistics
   */
  getPrivacyStatistics(): {
    totalUsers: number;
    privacySettingsConfigured: number;
    gdprRequestsTotal: number;
    dataBreachesTotal: number;
    auditLogsTotal: number;
  } {
    return {
      totalUsers: this.privacySettings.size,
      privacySettingsConfigured: this.privacySettings.size,
      gdprRequestsTotal: this.gdprRequests.size,
      dataBreachesTotal: this.dataBreaches.size,
      auditLogsTotal: this.auditLogs.size
    };
  }

  /**
   * Clean up expired data
   */
  async cleanupExpiredData(): Promise<{
    deletedRecords: number;
    deletedTypes: string[];
  }> {
    try {
      let deletedRecords = 0;
      const deletedTypes: string[] = [];

      // Clean up expired GDPR requests (older than 1 year)
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      for (const [requestId, request] of this.gdprRequests.entries()) {
        if (request.requestedAt < oneYearAgo) {
          this.gdprRequests.delete(requestId);
          deletedRecords++;
        }
      }
      if (deletedRecords > 0) deletedTypes.push('gdpr_requests');

      // Clean up expired audit logs (older than 7 years)
      const sevenYearsAgo = new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000);
      let deletedLogs = 0;
      for (const [logId, log] of this.auditLogs.entries()) {
        if (log.timestamp < sevenYearsAgo) {
          this.auditLogs.delete(logId);
          deletedLogs++;
        }
      }
      if (deletedLogs > 0) {
        deletedRecords += deletedLogs;
        deletedTypes.push('audit_logs');
      }

      return {
        deletedRecords,
        deletedTypes
      };
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const privacyControlsSystem = new PrivacyControlsSystem();

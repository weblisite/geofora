/**
 * Data Anonymization Pipeline
 * Implements PRD requirements for anonymizing data before sharing with AI providers
 */

import { db } from '../db';
import { anonymizedData, dataSharingConsent } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface AnonymizationConfig {
  removePersonalInfo: boolean;
  removeBusinessSpecifics: boolean;
  removeTimestamps: boolean;
  removeUserIds: boolean;
  removeUrls: boolean;
  maskKeywords: string[];
  preserveStructure: boolean;
}

export interface AnonymizedContent {
  originalContent: string;
  anonymizedContent: string;
  anonymizationLevel: 'basic' | 'standard' | 'strict';
  removedElements: string[];
  preservedElements: string[];
}

export class DataAnonymizationPipeline {
  private defaultConfig: AnonymizationConfig = {
    removePersonalInfo: true,
    removeBusinessSpecifics: true,
    removeTimestamps: true,
    removeUserIds: true,
    removeUrls: true,
    maskKeywords: [],
    preserveStructure: true
  };

  /**
   * Anonymize content based on organization's consent settings
   */
  async anonymizeContent(
    content: string,
    organizationId: number,
    dataType: 'question' | 'answer' | 'conversation',
    providerId: number
  ): Promise<AnonymizedContent> {
    // Get consent settings for this organization and provider
    const consent = await this.getConsentSettings(organizationId, providerId);
    
    if (!consent || !consent.hasConsent) {
      throw new Error('No consent for data sharing with this provider');
    }

    // Determine anonymization level based on consent
    const config = this.getAnonymizationConfig(consent.dataScope);
    
    // Apply anonymization
    const result = await this.applyAnonymization(content, config);
    
    // Store anonymized data
    await this.storeAnonymizedData({
      organizationId,
      threadId: 0, // Will be set by caller
      postId: 0,   // Will be set by caller
      anonymizedContent: result.anonymizedContent,
      dataType,
      aiProvider: await this.getProviderName(providerId),
      aiModel: 'unknown', // Will be set by caller
      consentVersion: consent.consentVersion
    });

    return result;
  }

  /**
   * Get consent settings for organization and provider
   */
  private async getConsentSettings(organizationId: number, providerId: number) {
    const result = await db
      .select()
      .from(dataSharingConsent)
      .where(
        and(
          eq(dataSharingConsent.organizationId, organizationId),
          eq(dataSharingConsent.providerId, providerId)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get anonymization configuration based on consent data scope
   */
  private getAnonymizationConfig(dataScope: any): AnonymizationConfig {
    if (!dataScope) {
      return this.defaultConfig;
    }

    return {
      removePersonalInfo: dataScope.removePersonalInfo ?? true,
      removeBusinessSpecifics: dataScope.removeBusinessSpecifics ?? true,
      removeTimestamps: dataScope.removeTimestamps ?? true,
      removeUserIds: dataScope.removeUserIds ?? true,
      removeUrls: dataScope.removeUrls ?? true,
      maskKeywords: dataScope.maskKeywords ?? [],
      preserveStructure: dataScope.preserveStructure ?? true
    };
  }

  /**
   * Apply anonymization to content
   */
  private async applyAnonymization(
    content: string,
    config: AnonymizationConfig
  ): Promise<AnonymizedContent> {
    let anonymizedContent = content;
    const removedElements: string[] = [];
    const preservedElements: string[] = [];

    // Remove personal information
    if (config.removePersonalInfo) {
      const personalInfoPatterns = [
        /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Names
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
        /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
        /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
      ];

      personalInfoPatterns.forEach(pattern => {
        const matches = anonymizedContent.match(pattern);
        if (matches) {
          removedElements.push(...matches);
          anonymizedContent = anonymizedContent.replace(pattern, '[REDACTED]');
        }
      });
    }

    // Remove business-specific information
    if (config.removeBusinessSpecifics) {
      const businessPatterns = [
        /\b[A-Z][a-z]+ (Inc|LLC|Corp|Company|Ltd)\.?\b/g, // Company names
        /\$\d+(?:,\d{3})*(?:\.\d{2})?\b/g, // Money amounts
        /\b\d{4,}\b/g, // Large numbers (could be IDs, codes)
      ];

      businessPatterns.forEach(pattern => {
        const matches = anonymizedContent.match(pattern);
        if (matches) {
          removedElements.push(...matches);
          anonymizedContent = anonymizedContent.replace(pattern, '[BUSINESS_INFO]');
        }
      });
    }

    // Remove timestamps
    if (config.removeTimestamps) {
      const timestampPatterns = [
        /\b\d{4}-\d{2}-\d{2}\b/g, // Dates
        /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\b/g, // Times
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/g, // Date strings
      ];

      timestampPatterns.forEach(pattern => {
        const matches = anonymizedContent.match(pattern);
        if (matches) {
          removedElements.push(...matches);
          anonymizedContent = anonymizedContent.replace(pattern, '[TIMESTAMP]');
        }
      });
    }

    // Remove URLs
    if (config.removeUrls) {
      const urlPattern = /https?:\/\/[^\s]+/g;
      const matches = anonymizedContent.match(urlPattern);
      if (matches) {
        removedElements.push(...matches);
        anonymizedContent = anonymizedContent.replace(urlPattern, '[URL]');
      }
    }

    // Mask specific keywords
    if (config.maskKeywords.length > 0) {
      config.maskKeywords.forEach(keyword => {
        const pattern = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = anonymizedContent.match(pattern);
        if (matches) {
          removedElements.push(...matches);
          anonymizedContent = anonymizedContent.replace(pattern, '[KEYWORD]');
        }
      });
    }

    // Determine anonymization level
    const anonymizationLevel = this.determineAnonymizationLevel(config);

    return {
      originalContent: content,
      anonymizedContent,
      anonymizationLevel,
      removedElements,
      preservedElements: ['content_structure', 'topic_context', 'technical_terms']
    };
  }

  /**
   * Determine anonymization level based on configuration
   */
  private determineAnonymizationLevel(config: AnonymizationConfig): 'basic' | 'standard' | 'strict' {
    const strictCount = Object.values(config).filter(Boolean).length;
    
    if (strictCount >= 6) return 'strict';
    if (strictCount >= 4) return 'standard';
    return 'basic';
  }

  /**
   * Store anonymized data in database
   */
  private async storeAnonymizedData(data: {
    organizationId: number;
    threadId: number;
    postId: number;
    anonymizedContent: string;
    dataType: string;
    aiProvider: string;
    aiModel: string;
    consentVersion: string;
  }) {
    await db.insert(anonymizedData).values({
      organizationId: data.organizationId,
      threadId: data.threadId,
      postId: data.postId,
      anonymizedContent: data.anonymizedContent,
      dataType: data.dataType,
      aiProvider: data.aiProvider,
      aiModel: data.aiModel,
      consentVersion: data.consentVersion,
      exported: false
    });
  }

  /**
   * Get provider name by ID
   */
  private async getProviderName(providerId: number): Promise<string> {
    // This would query the aiProviders table
    // For now, return a placeholder
    return `provider_${providerId}`;
  }

  /**
   * Export anonymized data for AI provider training
   */
  async exportAnonymizedData(
    organizationId: number,
    providerId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    const consent = await this.getConsentSettings(organizationId, providerId);
    
    if (!consent || !consent.hasConsent) {
      throw new Error('No consent for data export');
    }

    let query = db
      .select()
      .from(anonymizedData)
      .where(
        and(
          eq(anonymizedData.organizationId, organizationId),
          eq(anonymizedData.exported, false)
        )
      );

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(anonymizedData.organizationId, organizationId),
          eq(anonymizedData.exported, false)
          // Add date range filter here
        )
      );
    }

    const data = await query;
    
    // Mark as exported
    for (const record of data) {
      await db
        .update(anonymizedData)
        .set({ 
          exported: true, 
          exportedAt: new Date() 
        })
        .where(eq(anonymizedData.id, record.id));
    }

    return data;
  }

  /**
   * Get anonymization statistics for organization
   */
  async getAnonymizationStats(organizationId: number): Promise<{
    totalRecords: number;
    exportedRecords: number;
    pendingRecords: number;
    providersWithConsent: number;
  }> {
    const totalRecords = await db
      .select({ count: anonymizedData.id })
      .from(anonymizedData)
      .where(eq(anonymizedData.organizationId, organizationId));

    const exportedRecords = await db
      .select({ count: anonymizedData.id })
      .from(anonymizedData)
      .where(
        and(
          eq(anonymizedData.organizationId, organizationId),
          eq(anonymizedData.exported, true)
        )
      );

    const providersWithConsent = await db
      .select({ count: dataSharingConsent.id })
      .from(dataSharingConsent)
      .where(
        and(
          eq(dataSharingConsent.organizationId, organizationId),
          eq(dataSharingConsent.hasConsent, true)
        )
      );

    return {
      totalRecords: totalRecords.length,
      exportedRecords: exportedRecords.length,
      pendingRecords: totalRecords.length - exportedRecords.length,
      providersWithConsent: providersWithConsent.length
    };
  }

  /**
   * Revoke consent and delete anonymized data
   */
  async revokeConsent(organizationId: number, providerId: number): Promise<void> {
    // Update consent
    await db
      .update(dataSharingConsent)
      .set({ 
        hasConsent: false,
        consentDate: new Date()
      })
      .where(
        and(
          eq(dataSharingConsent.organizationId, organizationId),
          eq(dataSharingConsent.providerId, providerId)
        )
      );

    // Delete non-exported anonymized data
    await db
      .delete(anonymizedData)
      .where(
        and(
          eq(anonymizedData.organizationId, organizationId),
          eq(anonymizedData.exported, false)
        )
      );
  }
}

// Export singleton instance
export const dataAnonymizationPipeline = new DataAnonymizationPipeline();

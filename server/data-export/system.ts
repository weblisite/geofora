/**
 * Data Export System for AI Providers
 * Implements PRD requirements for exporting anonymized datasets to AI providers
 */

import { db } from '../db';
import { questions, answers, forums, anonymizedData, dataSharingConsent } from '../../shared/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { dataAnonymizationPipeline } from '../data-anonymization/pipeline';
import { consentManagementSystem } from '../consent-management/system';

export interface ExportConfig {
  provider: string;
  format: 'json' | 'csv' | 'jsonl' | 'txt';
  includeMetadata: boolean;
  anonymizationLevel: 'basic' | 'standard' | 'strict';
  dateRange?: {
    start: Date;
    end: Date;
  };
  contentTypes: ('questions' | 'answers' | 'forums')[];
  maxRecords?: number;
  includeConsent: boolean;
}

export interface ExportResult {
  id: string;
  provider: string;
  format: string;
  recordCount: number;
  fileSize: number;
  downloadUrl: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ExportMetadata {
  totalRecords: number;
  anonymizedRecords: number;
  consentRecords: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  contentTypes: string[];
  anonymizationLevel: string;
  provider: string;
  exportId: string;
}

export interface DataExportStats {
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  totalRecordsExported: number;
  providerDistribution: Record<string, number>;
  formatDistribution: Record<string, number>;
  averageExportSize: number;
}

export class DataExportSystem {
  private exportQueue: Map<string, ExportResult> = new Map();
  private exportStats: DataExportStats = {
    totalExports: 0,
    successfulExports: 0,
    failedExports: 0,
    totalRecordsExported: 0,
    providerDistribution: {},
    formatDistribution: {},
    averageExportSize: 0
  };

  /**
   * Create data export for AI provider
   */
  async createExport(config: ExportConfig): Promise<ExportResult> {
    try {
      // Validate consent for the provider
      if (config.includeConsent) {
        const hasConsent = await consentManagementSystem.hasConsentForProvider(config.provider);
        if (!hasConsent) {
          throw new Error(`No consent found for provider: ${config.provider}`);
        }
      }

      const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const exportResult: ExportResult = {
        id: exportId,
        provider: config.provider,
        format: config.format,
        recordCount: 0,
        fileSize: 0,
        downloadUrl: '',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending'
      };

      this.exportQueue.set(exportId, exportResult);
      this.exportStats.totalExports++;

      // Process export asynchronously
      this.processExport(exportId, config).catch(error => {
        console.error('Export processing error:', error);
        const exportResult = this.exportQueue.get(exportId);
        if (exportResult) {
          exportResult.status = 'failed';
          exportResult.error = error.message;
          this.exportStats.failedExports++;
        }
      });

      return exportResult;
    } catch (error) {
      console.error('Error creating export:', error);
      throw error;
    }
  }

  /**
   * Process export asynchronously
   */
  private async processExport(exportId: string, config: ExportConfig): Promise<void> {
    try {
      const exportResult = this.exportQueue.get(exportId);
      if (!exportResult) {
        throw new Error('Export not found');
      }

      exportResult.status = 'processing';

      // Collect data based on configuration
      const data = await this.collectExportData(config);
      
      // Anonymize data if required
      const anonymizedData = await this.anonymizeExportData(data, config);
      
      // Format data according to export format
      const formattedData = await this.formatExportData(anonymizedData, config);
      
      // Generate download URL
      const downloadUrl = await this.generateDownloadUrl(exportId, formattedData);
      
      // Update export result
      exportResult.recordCount = anonymizedData.length;
      exportResult.fileSize = Buffer.byteLength(formattedData, 'utf8');
      exportResult.downloadUrl = downloadUrl;
      exportResult.status = 'completed';
      
      // Update stats
      this.exportStats.successfulExports++;
      this.exportStats.totalRecordsExported += anonymizedData.length;
      this.exportStats.providerDistribution[config.provider] = 
        (this.exportStats.providerDistribution[config.provider] || 0) + 1;
      this.exportStats.formatDistribution[config.format] = 
        (this.exportStats.formatDistribution[config.format] || 0) + 1;
      
      // Calculate average export size
      const totalSize = Object.values(this.exportQueue)
        .filter(exp => exp.status === 'completed')
        .reduce((sum, exp) => sum + exp.fileSize, 0);
      this.exportStats.averageExportSize = totalSize / this.exportStats.successfulExports;

    } catch (error) {
      console.error('Error processing export:', error);
      const exportResult = this.exportQueue.get(exportId);
      if (exportResult) {
        exportResult.status = 'failed';
        exportResult.error = error.message;
        this.exportStats.failedExports++;
      }
      throw error;
    }
  }

  /**
   * Collect data for export
   */
  private async collectExportData(config: ExportConfig): Promise<any[]> {
    const data: any[] = [];

    try {
      // Collect questions
      if (config.contentTypes.includes('questions')) {
        const questionsQuery = db.query.questions.findMany({
          where: config.dateRange ? and(
            gte(questions.createdAt, config.dateRange.start),
            gte(questions.createdAt, config.dateRange.end)
          ) : undefined,
          limit: config.maxRecords,
          orderBy: desc(questions.createdAt)
        });
        
        const questions = await questionsQuery;
        data.push(...questions.map(q => ({ type: 'question', data: q })));
      }

      // Collect answers
      if (config.contentTypes.includes('answers')) {
        const answersQuery = db.query.answers.findMany({
          where: config.dateRange ? and(
            gte(answers.createdAt, config.dateRange.start),
            gte(answers.createdAt, config.dateRange.end)
          ) : undefined,
          limit: config.maxRecords,
          orderBy: desc(answers.createdAt)
        });
        
        const answers = await answersQuery;
        data.push(...answers.map(a => ({ type: 'answer', data: a })));
      }

      // Collect forums
      if (config.contentTypes.includes('forums')) {
        const forumsQuery = db.query.forums.findMany({
          where: config.dateRange ? and(
            gte(forums.createdAt, config.dateRange.start),
            gte(forums.createdAt, config.dateRange.end)
          ) : undefined,
          limit: config.maxRecords,
          orderBy: desc(forums.createdAt)
        });
        
        const forums = await forumsQuery;
        data.push(...forums.map(f => ({ type: 'forum', data: f })));
      }

      return data;
    } catch (error) {
      console.error('Error collecting export data:', error);
      throw error;
    }
  }

  /**
   * Anonymize export data
   */
  private async anonymizeExportData(data: any[], config: ExportConfig): Promise<any[]> {
    try {
      const anonymizedData: any[] = [];

      for (const item of data) {
        const anonymizedItem = await dataAnonymizationPipeline.anonymizeContent(
          item.data,
          config.anonymizationLevel
        );

        anonymizedData.push({
          type: item.type,
          id: anonymizedItem.id,
          content: anonymizedItem.content,
          metadata: config.includeMetadata ? {
            createdAt: anonymizedItem.createdAt,
            updatedAt: anonymizedItem.updatedAt,
            anonymizationLevel: config.anonymizationLevel,
            provider: config.provider
          } : undefined
        });
      }

      return anonymizedData;
    } catch (error) {
      console.error('Error anonymizing export data:', error);
      throw error;
    }
  }

  /**
   * Format export data
   */
  private async formatExportData(data: any[], config: ExportConfig): Promise<string> {
    try {
      switch (config.format) {
        case 'json':
          return JSON.stringify(data, null, 2);
        
        case 'jsonl':
          return data.map(item => JSON.stringify(item)).join('\n');
        
        case 'csv':
          return this.convertToCSV(data);
        
        case 'txt':
          return data.map(item => 
            `${item.type.toUpperCase()}: ${item.content}`
          ).join('\n\n');
        
        default:
          throw new Error(`Unsupported format: ${config.format}`);
      }
    } catch (error) {
      console.error('Error formatting export data:', error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = ['type', 'id', 'content', 'createdAt', 'updatedAt'];
    const csvRows = [headers.join(',')];

    for (const item of data) {
      const row = [
        item.type,
        item.id,
        `"${item.content.replace(/"/g, '""')}"`,
        item.metadata?.createdAt || '',
        item.metadata?.updatedAt || ''
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Generate download URL
   */
  private async generateDownloadUrl(exportId: string, data: string): Promise<string> {
    try {
      // In a real implementation, this would upload to cloud storage
      // For now, we'll simulate a download URL
      const baseUrl = process.env.BASE_URL || 'https://geofora.com';
      return `${baseUrl}/api/exports/download/${exportId}`;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
  }

  /**
   * Get export status
   */
  getExportStatus(exportId: string): ExportResult | null {
    return this.exportQueue.get(exportId) || null;
  }

  /**
   * Get all exports
   */
  getAllExports(): ExportResult[] {
    return Array.from(this.exportQueue.values());
  }

  /**
   * Get exports by provider
   */
  getExportsByProvider(provider: string): ExportResult[] {
    return Array.from(this.exportQueue.values())
      .filter(exportItem => exportItem.provider === provider);
  }

  /**
   * Delete export
   */
  deleteExport(exportId: string): boolean {
    return this.exportQueue.delete(exportId);
  }

  /**
   * Get export statistics
   */
  getExportStatistics(): DataExportStats {
    return { ...this.exportStats };
  }

  /**
   * Get export metadata
   */
  async getExportMetadata(exportId: string): Promise<ExportMetadata | null> {
    const exportResult = this.exportQueue.get(exportId);
    if (!exportResult) return null;

    try {
      // This would typically be stored with the export
      // For now, we'll generate it dynamically
      const totalRecords = await this.getTotalRecordCount();
      const anonymizedRecords = await this.getAnonymizedRecordCount();
      const consentRecords = await this.getConsentRecordCount();

      return {
        totalRecords,
        anonymizedRecords,
        consentRecords,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          end: new Date()
        },
        contentTypes: ['questions', 'answers', 'forums'],
        anonymizationLevel: 'standard',
        provider: exportResult.provider,
        exportId
      };
    } catch (error) {
      console.error('Error getting export metadata:', error);
      return null;
    }
  }

  /**
   * Get total record count
   */
  private async getTotalRecordCount(): Promise<number> {
    try {
      const [questions, answers, forums] = await Promise.all([
        db.query.questions.findMany(),
        db.query.answers.findMany(),
        db.query.forums.findMany()
      ]);

      return questions.length + answers.length + forums.length;
    } catch (error) {
      console.error('Error getting total record count:', error);
      return 0;
    }
  }

  /**
   * Get anonymized record count
   */
  private async getAnonymizedRecordCount(): Promise<number> {
    try {
      const anonymized = await db.query.anonymizedData.findMany();
      return anonymized.length;
    } catch (error) {
      console.error('Error getting anonymized record count:', error);
      return 0;
    }
  }

  /**
   * Get consent record count
   */
  private async getConsentRecordCount(): Promise<number> {
    try {
      const consents = await db.query.dataSharingConsent.findMany();
      return consents.length;
    } catch (error) {
      console.error('Error getting consent record count:', error);
      return 0;
    }
  }

  /**
   * Validate export configuration
   */
  validateExportConfig(config: ExportConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.provider) {
      errors.push('Provider is required');
    }

    if (!config.format || !['json', 'csv', 'jsonl', 'txt'].includes(config.format)) {
      errors.push('Valid format is required');
    }

    if (!config.contentTypes || config.contentTypes.length === 0) {
      errors.push('At least one content type is required');
    }

    if (config.maxRecords && config.maxRecords < 1) {
      errors.push('Max records must be greater than 0');
    }

    if (config.dateRange && config.dateRange.start >= config.dateRange.end) {
      errors.push('Start date must be before end date');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): Array<{ format: string; description: string; mimeType: string }> {
    return [
      { format: 'json', description: 'JSON format', mimeType: 'application/json' },
      { format: 'csv', description: 'CSV format', mimeType: 'text/csv' },
      { format: 'jsonl', description: 'JSON Lines format', mimeType: 'application/x-jsonlines' },
      { format: 'txt', description: 'Plain text format', mimeType: 'text/plain' }
    ];
  }

  /**
   * Get supported providers
   */
  getSupportedProviders(): Array<{ provider: string; description: string; supportedFormats: string[] }> {
    return [
      { 
        provider: 'openai', 
        description: 'OpenAI', 
        supportedFormats: ['json', 'jsonl', 'txt'] 
      },
      { 
        provider: 'anthropic', 
        description: 'Anthropic', 
        supportedFormats: ['json', 'txt'] 
      },
      { 
        provider: 'deepseek', 
        description: 'DeepSeek', 
        supportedFormats: ['json', 'jsonl', 'txt'] 
      },
      { 
        provider: 'google', 
        description: 'Google DeepMind', 
        supportedFormats: ['json', 'csv', 'txt'] 
      },
      { 
        provider: 'meta', 
        description: 'Meta AI', 
        supportedFormats: ['json', 'jsonl', 'txt'] 
      },
      { 
        provider: 'xai', 
        description: 'XAI', 
        supportedFormats: ['json', 'txt'] 
      }
    ];
  }

  /**
   * Clean up expired exports
   */
  cleanupExpiredExports(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [exportId, exportResult] of this.exportQueue.entries()) {
      if (exportResult.expiresAt < now) {
        this.exportQueue.delete(exportId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get export history
   */
  getExportHistory(limit: number = 50): ExportResult[] {
    return Array.from(this.exportQueue.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get export trends
   */
  getExportTrends(days: number = 30): {
    dailyExports: Array<{ date: string; count: number; size: number }>;
    providerTrends: Record<string, number>;
    formatTrends: Record<string, number>;
  } {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const recentExports = Array.from(this.exportQueue.values())
      .filter(exp => exp.createdAt >= startDate);

    const dailyExports: Array<{ date: string; count: number; size: number }> = [];
    const providerTrends: Record<string, number> = {};
    const formatTrends: Record<string, number> = {};

    // Group by day
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayExports = recentExports.filter(exp => 
        exp.createdAt.toDateString() === date.toDateString()
      );
      
      dailyExports.push({
        date: date.toISOString().split('T')[0],
        count: dayExports.length,
        size: dayExports.reduce((sum, exp) => sum + exp.fileSize, 0)
      });
    }

    // Calculate trends
    recentExports.forEach(exp => {
      providerTrends[exp.provider] = (providerTrends[exp.provider] || 0) + 1;
      formatTrends[exp.format] = (formatTrends[exp.format] || 0) + 1;
    });

    return {
      dailyExports,
      providerTrends,
      formatTrends
    };
  }
}

// Export singleton instance
export const dataExportSystem = new DataExportSystem();

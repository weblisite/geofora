/**
 * Consent Management System
 * Handles data sharing consent as per PRD requirements
 */

import { db } from '../db';
import { dataSharingConsent, aiProviders } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface ConsentRequest {
  organizationId: number;
  providerId: number;
  dataScope: DataScope;
  consentVersion: string;
}

export interface DataScope {
  removePersonalInfo: boolean;
  removeBusinessSpecifics: boolean;
  removeTimestamps: boolean;
  removeUserIds: boolean;
  removeUrls: boolean;
  maskKeywords: string[];
  preserveStructure: boolean;
  allowedDataTypes: string[];
  retentionPeriod: number; // days
}

export interface ConsentResponse {
  id: number;
  organizationId: number;
  providerId: number;
  hasConsent: boolean;
  consentDate: Date | null;
  consentVersion: string;
  dataScope: DataScope;
  createdAt: Date;
}

export class ConsentManagementSystem {
  private readonly CONSENT_VERSION = '1.0.0';

  /**
   * Grant consent for data sharing with AI provider
   */
  async grantConsent(request: ConsentRequest): Promise<ConsentResponse> {
    // Validate provider exists
    const provider = await this.getProvider(request.providerId);
    if (!provider) {
      throw new Error('AI provider not found');
    }

    // Check if consent already exists
    const existingConsent = await this.getConsent(request.organizationId, request.providerId);
    
    if (existingConsent) {
      // Update existing consent
      await db
        .update(dataSharingConsent)
        .set({
          hasConsent: true,
          consentDate: new Date(),
          consentVersion: request.consentVersion,
          dataScope: request.dataScope
        })
        .where(eq(dataSharingConsent.id, existingConsent.id));
    } else {
      // Create new consent
      await db.insert(dataSharingConsent).values({
        organizationId: request.organizationId,
        providerId: request.providerId,
        hasConsent: true,
        consentDate: new Date(),
        consentVersion: request.consentVersion,
        dataScope: request.dataScope
      });
    }

    return await this.getConsent(request.organizationId, request.providerId) as ConsentResponse;
  }

  /**
   * Revoke consent for data sharing
   */
  async revokeConsent(organizationId: number, providerId: number): Promise<void> {
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
  }

  /**
   * Get consent status for organization and provider
   */
  async getConsent(organizationId: number, providerId: number): Promise<ConsentResponse | null> {
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

    if (result.length === 0) {
      return null;
    }

    const consent = result[0];
    return {
      id: consent.id,
      organizationId: consent.organizationId,
      providerId: consent.providerId,
      hasConsent: consent.hasConsent,
      consentDate: consent.consentDate,
      consentVersion: consent.consentVersion,
      dataScope: consent.dataScope as DataScope,
      createdAt: consent.createdAt
    };
  }

  /**
   * Get all consents for an organization
   */
  async getOrganizationConsents(organizationId: number): Promise<ConsentResponse[]> {
    const results = await db
      .select()
      .from(dataSharingConsent)
      .where(eq(dataSharingConsent.organizationId, organizationId));

    return results.map(consent => ({
      id: consent.id,
      organizationId: consent.organizationId,
      providerId: consent.providerId,
      hasConsent: consent.hasConsent,
      consentDate: consent.consentDate,
      consentVersion: consent.consentVersion,
      dataScope: consent.dataScope as DataScope,
      createdAt: consent.createdAt
    }));
  }

  /**
   * Get all providers with consent for an organization
   */
  async getProvidersWithConsent(organizationId: number): Promise<number[]> {
    const results = await db
      .select({ providerId: dataSharingConsent.providerId })
      .from(dataSharingConsent)
      .where(
        and(
          eq(dataSharingConsent.organizationId, organizationId),
          eq(dataSharingConsent.hasConsent, true)
        )
      );

    return results.map(r => r.providerId);
  }

  /**
   * Check if organization has consent for specific provider
   */
  async hasConsent(organizationId: number, providerId: number): Promise<boolean> {
    const consent = await this.getConsent(organizationId, providerId);
    return consent?.hasConsent || false;
  }

  /**
   * Get default data scope for plan
   */
  getDefaultDataScope(plan: 'starter' | 'pro' | 'enterprise'): DataScope {
    const baseScope: DataScope = {
      removePersonalInfo: true,
      removeBusinessSpecifics: true,
      removeTimestamps: true,
      removeUserIds: true,
      removeUrls: true,
      maskKeywords: [],
      preserveStructure: true,
      allowedDataTypes: ['question', 'answer'],
      retentionPeriod: 365 // 1 year
    };

    switch (plan) {
      case 'starter':
        return {
          ...baseScope,
          allowedDataTypes: ['question'],
          retentionPeriod: 180 // 6 months
        };
      case 'pro':
        return {
          ...baseScope,
          allowedDataTypes: ['question', 'answer'],
          retentionPeriod: 365 // 1 year
        };
      case 'enterprise':
        return {
          ...baseScope,
          allowedDataTypes: ['question', 'answer', 'conversation'],
          retentionPeriod: 730, // 2 years
          preserveStructure: true,
          removeBusinessSpecifics: false // Enterprise can keep more business context
        };
      default:
        return baseScope;
    }
  }

  /**
   * Create consent request for plan
   */
  async createConsentRequest(
    organizationId: number,
    providerId: number,
    plan: 'starter' | 'pro' | 'enterprise'
  ): Promise<ConsentRequest> {
    const dataScope = this.getDefaultDataScope(plan);
    
    return {
      organizationId,
      providerId,
      dataScope,
      consentVersion: this.CONSENT_VERSION
    };
  }

  /**
   * Get consent statistics for organization
   */
  async getConsentStats(organizationId: number): Promise<{
    totalProviders: number;
    consentedProviders: number;
    consentRate: number;
    lastConsentDate: Date | null;
  }> {
    const allConsents = await this.getOrganizationConsents(organizationId);
    const consentedProviders = allConsents.filter(c => c.hasConsent);
    
    // Get total available providers
    const totalProviders = await db
      .select({ count: aiProviders.id })
      .from(aiProviders)
      .where(eq(aiProviders.isActive, true));

    const lastConsentDate = consentedProviders
      .map(c => c.consentDate)
      .filter(date => date !== null)
      .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;

    return {
      totalProviders: totalProviders.length,
      consentedProviders: consentedProviders.length,
      consentRate: totalProviders.length > 0 ? (consentedProviders.length / totalProviders.length) * 100 : 0,
      lastConsentDate
    };
  }

  /**
   * Validate consent is still valid
   */
  async validateConsent(organizationId: number, providerId: number): Promise<boolean> {
    const consent = await this.getConsent(organizationId, providerId);
    
    if (!consent || !consent.hasConsent) {
      return false;
    }

    // Check if consent version is current
    if (consent.consentVersion !== this.CONSENT_VERSION) {
      return false;
    }

    // Check if consent is within retention period
    if (consent.consentDate) {
      const retentionPeriod = consent.dataScope.retentionPeriod;
      const expirationDate = new Date(consent.consentDate.getTime() + (retentionPeriod * 24 * 60 * 60 * 1000));
      
      if (new Date() > expirationDate) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get provider by ID
   */
  private async getProvider(providerId: number) {
    const result = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.id, providerId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Export consent data for compliance
   */
  async exportConsentData(organizationId: number): Promise<any> {
    const consents = await this.getOrganizationConsents(organizationId);
    const stats = await this.getConsentStats(organizationId);

    return {
      organizationId,
      exportDate: new Date(),
      consents: consents.map(consent => ({
        providerId: consent.providerId,
        hasConsent: consent.hasConsent,
        consentDate: consent.consentDate,
        consentVersion: consent.consentVersion,
        dataScope: consent.dataScope
      })),
      statistics: stats
    };
  }
}

// Export singleton instance
export const consentManagementSystem = new ConsentManagementSystem();

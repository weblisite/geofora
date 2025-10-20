/**
 * Setup Fee Implementation
 * Implements PRD requirements for $1,000 one-time setup fee
 */

import { db } from '../db';
import { setupFees, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export interface SetupFeeConfig {
  amount: number; // $1,000 in cents
  currency: string;
  description: string;
  isActive: boolean;
}

export interface SetupFeeRecord {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  stripeSessionId?: string;
  polarOrderId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetupFeePaymentRequest {
  userId: number;
  planId: string;
  paymentMethod: 'stripe' | 'polar';
  returnUrl?: string;
  cancelUrl?: string;
}

export interface SetupFeePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  sessionId?: string;
  orderId?: string;
  error?: string;
}

// Setup fee configuration
const SETUP_FEE_CONFIG: SetupFeeConfig = {
  amount: 100000, // $1,000 in cents
  currency: 'usd',
  description: 'GEOFORA Platform Setup Fee',
  isActive: true
};

// Validation schemas
const setupFeePaymentSchema = z.object({
  userId: z.number().positive(),
  planId: z.string().min(1),
  paymentMethod: z.enum(['stripe', 'polar']),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

const setupFeeWebhookSchema = z.object({
  eventType: z.string(),
  paymentIntentId: z.string().optional(),
  sessionId: z.string().optional(),
  orderId: z.string().optional(),
  status: z.enum(['succeeded', 'failed', 'canceled', 'refunded']),
  amount: z.number().optional(),
  currency: z.string().optional()
});

export class SetupFeeService {
  private config: SetupFeeConfig;

  constructor(config: SetupFeeConfig = SETUP_FEE_CONFIG) {
    this.config = config;
  }

  /**
   * Check if user has paid setup fee
   */
  async hasPaidSetupFee(userId: number): Promise<boolean> {
    try {
      const setupFee = await db.query.setupFees.findFirst({
        where: and(
          eq(setupFees.userId, userId),
          eq(setupFees.status, 'paid')
        )
      });

      return !!setupFee;
    } catch (error) {
      console.error('Error checking setup fee status:', error);
      return false;
    }
  }

  /**
   * Get setup fee status for user
   */
  async getSetupFeeStatus(userId: number): Promise<SetupFeeRecord | null> {
    try {
      const setupFee = await db.query.setupFees.findFirst({
        where: eq(setupFees.userId, userId),
        orderBy: (table, { desc }) => [desc(table.createdAt)]
      });

      return setupFee || null;
    } catch (error) {
      console.error('Error getting setup fee status:', error);
      return null;
    }
  }

  /**
   * Create setup fee payment request
   */
  async createSetupFeePayment(request: SetupFeePaymentRequest): Promise<SetupFeePaymentResponse> {
    try {
      // Validate request
      const validatedRequest = setupFeePaymentSchema.parse(request);

      // Check if user already has a paid setup fee
      const hasPaid = await this.hasPaidSetupFee(validatedRequest.userId);
      if (hasPaid) {
        return {
          success: false,
          error: 'Setup fee already paid'
        };
      }

      // Create setup fee record
      const setupFeeRecord = await db.insert(setupFees).values({
        userId: validatedRequest.userId,
        amount: this.config.amount,
        currency: this.config.currency,
        status: 'pending'
      }).returning();

      // Create payment session based on payment method
      if (validatedRequest.paymentMethod === 'stripe') {
        return await this.createStripePaymentSession(setupFeeRecord[0], validatedRequest);
      } else if (validatedRequest.paymentMethod === 'polar') {
        return await this.createPolarPaymentSession(setupFeeRecord[0], validatedRequest);
      }

      return {
        success: false,
        error: 'Invalid payment method'
      };
    } catch (error) {
      console.error('Error creating setup fee payment:', error);
      return {
        success: false,
        error: 'Failed to create setup fee payment'
      };
    }
  }

  /**
   * Create Stripe payment session
   */
  private async createStripePaymentSession(
    setupFeeRecord: SetupFeeRecord,
    request: SetupFeePaymentRequest
  ): Promise<SetupFeePaymentResponse> {
    try {
      // This would integrate with Stripe
      // For now, return a mock response
      const sessionId = `stripe_session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Update setup fee record with session ID
      await db.update(setupFees)
        .set({ stripeSessionId: sessionId })
        .where(eq(setupFees.id, setupFeeRecord.id));

      return {
        success: true,
        paymentUrl: `https://checkout.stripe.com/pay/${sessionId}`,
        sessionId
      };
    } catch (error) {
      console.error('Error creating Stripe payment session:', error);
      return {
        success: false,
        error: 'Failed to create Stripe payment session'
      };
    }
  }

  /**
   * Create Polar payment session
   */
  private async createPolarPaymentSession(
    setupFeeRecord: SetupFeeRecord,
    request: SetupFeePaymentRequest
  ): Promise<SetupFeePaymentResponse> {
    try {
      // This would integrate with Polar.sh
      // For now, return a mock response
      const orderId = `polar_order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Update setup fee record with order ID
      await db.update(setupFees)
        .set({ polarOrderId: orderId })
        .where(eq(setupFees.id, setupFeeRecord.id));

      return {
        success: true,
        paymentUrl: `https://polar.sh/checkout/${orderId}`,
        orderId
      };
    } catch (error) {
      console.error('Error creating Polar payment session:', error);
      return {
        success: false,
        error: 'Failed to create Polar payment session'
      };
    }
  }

  /**
   * Handle payment webhook
   */
  async handlePaymentWebhook(webhookData: any): Promise<void> {
    try {
      const validatedData = setupFeeWebhookSchema.parse(webhookData);

      let setupFeeRecord: SetupFeeRecord | null = null;

      // Find setup fee record by payment method
      if (validatedData.paymentIntentId) {
        setupFeeRecord = await db.query.setupFees.findFirst({
          where: eq(setupFees.paymentIntentId, validatedData.paymentIntentId)
        });
      } else if (validatedData.sessionId) {
        setupFeeRecord = await db.query.setupFees.findFirst({
          where: eq(setupFees.stripeSessionId, validatedData.sessionId)
        });
      } else if (validatedData.orderId) {
        setupFeeRecord = await db.query.setupFees.findFirst({
          where: eq(setupFees.polarOrderId, validatedData.orderId)
        });
      }

      if (!setupFeeRecord) {
        console.error('Setup fee record not found for webhook:', webhookData);
        return;
      }

      // Update setup fee status based on webhook event
      const updateData: Partial<SetupFeeRecord> = {
        updatedAt: new Date()
      };

      switch (validatedData.status) {
        case 'succeeded':
          updateData.status = 'paid';
          updateData.paidAt = new Date();
          break;
        case 'failed':
        case 'canceled':
          updateData.status = 'failed';
          break;
        case 'refunded':
          updateData.status = 'refunded';
          break;
      }

      await db.update(setupFees)
        .set(updateData)
        .where(eq(setupFees.id, setupFeeRecord.id));

      // If payment succeeded, activate user's plan
      if (validatedData.status === 'succeeded') {
        await this.activateUserPlan(setupFeeRecord.userId);
      }

    } catch (error) {
      console.error('Error handling payment webhook:', error);
    }
  }

  /**
   * Activate user's plan after setup fee payment
   */
  private async activateUserPlan(userId: number): Promise<void> {
    try {
      // This would integrate with your plan activation logic
      // For now, just log the activation
      console.log(`Activating plan for user ${userId} after setup fee payment`);
      
      // You might want to:
      // 1. Update user's subscription status
      // 2. Send welcome email
      // 3. Grant access to premium features
      // 4. Update billing records
    } catch (error) {
      console.error('Error activating user plan:', error);
    }
  }

  /**
   * Refund setup fee
   */
  async refundSetupFee(setupFeeId: number, reason?: string): Promise<boolean> {
    try {
      const setupFee = await db.query.setupFees.findFirst({
        where: eq(setupFees.id, setupFeeId)
      });

      if (!setupFee || setupFee.status !== 'paid') {
        return false;
      }

      // Update status to refunded
      await db.update(setupFees)
        .set({ 
          status: 'refunded',
          updatedAt: new Date()
        })
        .where(eq(setupFees.id, setupFeeId));

      // This would integrate with payment provider refund API
      console.log(`Refunding setup fee ${setupFeeId} for reason: ${reason || 'No reason provided'}`);

      return true;
    } catch (error) {
      console.error('Error refunding setup fee:', error);
      return false;
    }
  }

  /**
   * Get setup fee statistics
   */
  async getSetupFeeStats(): Promise<{
    totalSetupFees: number;
    paidSetupFees: number;
    pendingSetupFees: number;
    failedSetupFees: number;
    refundedSetupFees: number;
    totalRevenue: number;
  }> {
    try {
      const setupFees = await db.query.setupFees.findMany();

      const stats = setupFees.reduce((acc, fee) => {
        acc.totalSetupFees++;
        
        switch (fee.status) {
          case 'paid':
            acc.paidSetupFees++;
            acc.totalRevenue += fee.amount;
            break;
          case 'pending':
            acc.pendingSetupFees++;
            break;
          case 'failed':
            acc.failedSetupFees++;
            break;
          case 'refunded':
            acc.refundedSetupFees++;
            acc.totalRevenue -= fee.amount;
            break;
        }

        return acc;
      }, {
        totalSetupFees: 0,
        paidSetupFees: 0,
        pendingSetupFees: 0,
        failedSetupFees: 0,
        refundedSetupFees: 0,
        totalRevenue: 0
      });

      return stats;
    } catch (error) {
      console.error('Error getting setup fee stats:', error);
      return {
        totalSetupFees: 0,
        paidSetupFees: 0,
        pendingSetupFees: 0,
        failedSetupFees: 0,
        refundedSetupFees: 0,
        totalRevenue: 0
      };
    }
  }

  /**
   * Get setup fee configuration
   */
  getSetupFeeConfig(): SetupFeeConfig {
    return { ...this.config };
  }

  /**
   * Update setup fee configuration
   */
  updateSetupFeeConfig(newConfig: Partial<SetupFeeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if setup fee is required for plan
   */
  isSetupFeeRequired(planId: string): boolean {
    // Setup fee is required for all plans according to PRD
    return this.config.isActive;
  }

  /**
   * Get setup fee amount for display
   */
  getSetupFeeAmount(): number {
    return this.config.amount;
  }

  /**
   * Get setup fee amount in dollars
   */
  getSetupFeeAmountInDollars(): number {
    return this.config.amount / 100;
  }
}

// Export singleton instance
export const setupFeeService = new SetupFeeService();

// Export types and schemas
export { SetupFeeConfig, SetupFeeRecord, SetupFeePaymentRequest, SetupFeePaymentResponse };
export { setupFeePaymentSchema, setupFeeWebhookSchema };

/**
 * Security Hardening System
 * Comprehensive security measures for GEOFORA platform
 */

import { deploymentConfig } from '../config/deployment';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface SecurityConfig {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
  };
  sessionSecurity: {
    maxAge: number; // minutes
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
  inputValidation: {
    maxLength: number;
    allowedChars: string;
    sanitizeHtml: boolean;
    validateEmail: boolean;
    validateUrl: boolean;
  };
  headers: {
    hsts: boolean;
    xssProtection: boolean;
    contentTypeOptions: boolean;
    frameOptions: boolean;
    referrerPolicy: boolean;
  };
  logging: {
    logFailedAttempts: boolean;
    logSuspiciousActivity: boolean;
    logDataAccess: boolean;
    retentionDays: number;
  };
}

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'password_change' | 'data_access' | 'suspicious_activity' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: any;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  failedLoginAttempts: number;
  suspiciousActivities: number;
  rateLimitViolations: number;
  averageResponseTime: number;
  securityScore: number;
}

export interface PasswordStrength {
  score: number; // 0-100
  feedback: string[];
  meetsPolicy: boolean;
}

export class SecurityHardeningSystem {
  private securityConfig: SecurityConfig;
  private securityEvents: Map<string, SecurityEvent> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private suspiciousIPs: Set<string> = new Set();

  constructor() {
    this.securityConfig = this.initializeSecurityConfig();
  }

  /**
   * Initialize security configuration
   */
  private initializeSecurityConfig(): SecurityConfig {
    const config = deploymentConfig.getConfig();
    
    return {
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // 90 days
      },
      sessionSecurity: {
        maxAge: 30, // 30 minutes
        secure: config.environment === 'production',
        httpOnly: true,
        sameSite: 'strict',
      },
      rateLimiting: {
        windowMs: config.security.rateLimit.windowMs,
        maxRequests: config.security.rateLimit.maxRequests,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      },
      encryption: {
        algorithm: config.security.encryption.algorithm,
        keyLength: 32,
        ivLength: 16,
      },
      inputValidation: {
        maxLength: 10000,
        allowedChars: 'a-zA-Z0-9\\s\\-_.,!?@#$%^&*()+=[]{}|;:"<>/',
        sanitizeHtml: true,
        validateEmail: true,
        validateUrl: true,
      },
      headers: {
        hsts: true,
        xssProtection: true,
        contentTypeOptions: true,
        frameOptions: true,
        referrerPolicy: true,
      },
      logging: {
        logFailedAttempts: true,
        logSuspiciousActivity: true,
        logDataAccess: true,
        retentionDays: 90,
      },
    };
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): PasswordStrength {
    const policy = this.securityConfig.passwordPolicy;
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= policy.minLength) {
      score += 20;
    } else {
      feedback.push(`Password must be at least ${policy.minLength} characters long`);
    }

    // Uppercase check
    if (policy.requireUppercase && /[A-Z]/.test(password)) {
      score += 20;
    } else if (policy.requireUppercase) {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (policy.requireLowercase && /[a-z]/.test(password)) {
      score += 20;
    } else if (policy.requireLowercase) {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Numbers check
    if (policy.requireNumbers && /\d/.test(password)) {
      score += 20;
    } else if (policy.requireNumbers) {
      feedback.push('Password must contain at least one number');
    }

    // Special characters check
    if (policy.requireSpecialChars && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 20;
    } else if (policy.requireSpecialChars) {
      feedback.push('Password must contain at least one special character');
    }

    // Additional complexity
    if (password.length > 16) score += 10;
    if (password.length > 20) score += 10;

    const meetsPolicy = score >= 100 && feedback.length === 0;

    return {
      score: Math.min(100, score),
      feedback,
      meetsPolicy,
    };
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: string): string {
    const config = this.securityConfig.encryption;
    const key = deploymentConfig.getConfig().security.encryption.key;
    const iv = crypto.randomBytes(config.ivLength);
    
    const cipher = crypto.createCipher(config.algorithm, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData: string): string {
    const config = this.securityConfig.encryption;
    const key = deploymentConfig.getConfig().security.encryption.key;
    
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipher(config.algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Validate input
   */
  validateInput(input: string, type: 'text' | 'email' | 'url' | 'html'): {
    valid: boolean;
    sanitized: string;
    errors: string[];
  } {
    const config = this.securityConfig.inputValidation;
    const errors: string[] = [];
    let sanitized = input;

    // Length check
    if (input.length > config.maxLength) {
      errors.push(`Input exceeds maximum length of ${config.maxLength} characters`);
      sanitized = input.substring(0, config.maxLength);
    }

    // Character validation
    const allowedCharsRegex = new RegExp(`^[${config.allowedChars}]+$`);
    if (!allowedCharsRegex.test(input)) {
      errors.push('Input contains invalid characters');
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        if (config.validateEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input)) {
            errors.push('Invalid email format');
          }
        }
        break;

      case 'url':
        if (config.validateUrl) {
          try {
            new URL(input);
          } catch {
            errors.push('Invalid URL format');
          }
        }
        break;

      case 'html':
        if (config.sanitizeHtml) {
          // Basic HTML sanitization - in production, use a proper library
          sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors,
    };
  }

  /**
   * Generate secure token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify CSRF token
   */
  verifyCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    ipAddress: string,
    userAgent: string,
    details: any,
    userId?: number
  ): void {
    const eventId = `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event: SecurityEvent = {
      id: eventId,
      type,
      severity,
      userId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      details,
      resolved: false,
    };

    this.securityEvents.set(eventId, event);

    // Track failed attempts
    if (type === 'login_attempt' && severity === 'high') {
      this.trackFailedAttempt(ipAddress);
    }

    // Mark suspicious IPs
    if (severity === 'critical') {
      this.suspiciousIPs.add(ipAddress);
    }
  }

  /**
   * Track failed attempt
   */
  private trackFailedAttempt(ipAddress: string): void {
    const existing = this.failedAttempts.get(ipAddress);
    
    if (existing) {
      existing.count++;
      existing.lastAttempt = new Date();
    } else {
      this.failedAttempts.set(ipAddress, {
        count: 1,
        lastAttempt: new Date(),
      });
    }
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ipAddress: string): boolean {
    const failedAttempt = this.failedAttempts.get(ipAddress);
    
    if (!failedAttempt) return false;
    
    // Block if more than 5 failed attempts in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (failedAttempt.count >= 5 && failedAttempt.lastAttempt > oneHourAgo) {
      return true;
    }
    
    // Block if IP is marked as suspicious
    if (this.suspiciousIPs.has(ipAddress)) {
      return true;
    }
    
    return false;
  }

  /**
   * Get security headers
   */
  getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const config = this.securityConfig.headers;

    if (config.hsts) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    }

    if (config.xssProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (config.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    if (config.frameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }

    if (config.referrerPolicy) {
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }

    headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';";

    return headers;
  }

  /**
   * Get security events
   */
  getSecurityEvents(
    type?: SecurityEvent['type'],
    severity?: SecurityEvent['severity'],
    limit: number = 100
  ): SecurityEvent[] {
    let events = Array.from(this.securityEvents.values());

    if (type) {
      events = events.filter(event => event.type === type);
    }

    if (severity) {
      events = events.filter(event => event.severity === severity);
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Resolve security event
   */
  resolveSecurityEvent(eventId: string): boolean {
    const event = this.securityEvents.get(eventId);
    if (event) {
      event.resolved = true;
      event.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): SecurityMetrics {
    const events = Array.from(this.securityEvents.values());
    
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    
    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });

    const failedLoginAttempts = events.filter(
      event => event.type === 'login_attempt' && event.severity === 'high'
    ).length;

    const suspiciousActivities = events.filter(
      event => event.type === 'suspicious_activity'
    ).length;

    const rateLimitViolations = events.filter(
      event => event.type === 'rate_limit_exceeded'
    ).length;

    // Calculate security score
    const securityScore = this.calculateSecurityScore(events);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      failedLoginAttempts,
      suspiciousActivities,
      rateLimitViolations,
      averageResponseTime: 0, // This would be calculated from actual metrics
      securityScore,
    };
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(events: SecurityEvent[]): number {
    if (events.length === 0) return 100;

    const criticalEvents = events.filter(event => event.severity === 'critical').length;
    const highEvents = events.filter(event => event.severity === 'high').length;
    const mediumEvents = events.filter(event => event.severity === 'medium').length;
    const lowEvents = events.filter(event => event.severity === 'low').length;

    // Weighted scoring
    const score = Math.max(0, 100 - (criticalEvents * 20) - (highEvents * 10) - (mediumEvents * 5) - (lowEvents * 1));
    
    return score;
  }

  /**
   * Get failed attempts for IP
   */
  getFailedAttempts(ipAddress: string): { count: number; lastAttempt: Date } | null {
    return this.failedAttempts.get(ipAddress) || null;
  }

  /**
   * Clear failed attempts for IP
   */
  clearFailedAttempts(ipAddress: string): boolean {
    return this.failedAttempts.delete(ipAddress);
  }

  /**
   * Get suspicious IPs
   */
  getSuspiciousIPs(): string[] {
    return Array.from(this.suspiciousIPs);
  }

  /**
   * Remove suspicious IP
   */
  removeSuspiciousIP(ipAddress: string): boolean {
    return this.suspiciousIPs.delete(ipAddress);
  }

  /**
   * Update security configuration
   */
  updateSecurityConfig(updates: Partial<SecurityConfig>): void {
    this.securityConfig = { ...this.securityConfig, ...updates };
  }

  /**
   * Get security configuration
   */
  getSecurityConfig(): SecurityConfig {
    return this.securityConfig;
  }

  /**
   * Clean up old security events
   */
  cleanupOldEvents(): number {
    const config = this.securityConfig.logging;
    const cutoffDate = new Date(Date.now() - config.retentionDays * 24 * 60 * 60 * 1000);
    
    let cleanedCount = 0;
    
    for (const [eventId, event] of this.securityEvents.entries()) {
      if (event.timestamp < cutoffDate) {
        this.securityEvents.delete(eventId);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    summary: SecurityMetrics;
    recentEvents: SecurityEvent[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  } {
    const summary = this.getSecurityMetrics();
    const recentEvents = this.getSecurityEvents(undefined, undefined, 50);
    const recommendations: string[] = [];
    
    // Generate recommendations based on metrics
    if (summary.failedLoginAttempts > 10) {
      recommendations.push('Consider implementing account lockout after multiple failed attempts');
    }
    
    if (summary.suspiciousActivities > 5) {
      recommendations.push('Review and investigate suspicious activities');
    }
    
    if (summary.securityScore < 70) {
      recommendations.push('Security score is below acceptable threshold - review security measures');
    }
    
    if (summary.rateLimitViolations > 20) {
      recommendations.push('High rate limit violations detected - consider adjusting rate limits');
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (summary.securityScore >= 90) riskLevel = 'low';
    else if (summary.securityScore >= 70) riskLevel = 'medium';
    else if (summary.securityScore >= 50) riskLevel = 'high';
    else riskLevel = 'critical';
    
    return {
      summary,
      recentEvents,
      recommendations,
      riskLevel,
    };
  }
}

// Export singleton instance
export const securityHardeningSystem = new SecurityHardeningSystem();

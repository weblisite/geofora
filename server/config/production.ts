/**
 * Production Environment Configuration
 * Complete production setup for GEOFORA platform
 */

import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Production environment validation schema
const ProductionEnvironmentSchema = z.object({
  NODE_ENV: z.literal('production'),
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  META_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  POLAR_ACCESS_TOKEN: z.string().min(1),
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  BACKUP_RETENTION_DAYS: z.string().transform(Number).default(30),
  MONITORING_INTERVAL_MS: z.string().transform(Number).default(60000),
  SSL_CERT_PATH: z.string().optional(),
  SSL_KEY_PATH: z.string().optional(),
  NGINX_CONFIG_PATH: z.string().optional(),
  PM2_CONFIG_PATH: z.string().optional(),
});

export interface ProductionConfig {
  environment: 'production';
  port: number;
  ssl: {
    enabled: boolean;
    certPath?: string;
    keyPath?: string;
  };
  database: {
    url: string;
    ssl: boolean;
    poolSize: number;
    timeout: number;
    retries: number;
  };
  auth: {
    clerk: {
      secretKey: string;
      publishableKey: string;
    };
    jwt: {
      secret: string;
      expiresIn: string;
    };
  };
  ai: {
    providers: {
      openai: { apiKey: string };
      anthropic?: { apiKey: string };
      deepseek?: { apiKey: string };
      google?: { apiKey: string };
      meta?: { apiKey: string };
      xai?: { apiKey: string };
    };
    rateLimits: {
      windowMs: number;
      maxRequests: number;
    };
    fallback: {
      enabled: boolean;
      timeout: number;
    };
  };
  payments: {
    stripe: {
      secretKey: string;
      webhookSecret: string;
      publishableKey: string;
    };
    polar: {
      accessToken: string;
    };
  };
  redis: {
    url: string;
    ttl: number;
    retries: number;
  };
  monitoring: {
    sentry: {
      dsn: string;
      environment: string;
    };
    logLevel: string;
    interval: number;
    alerts: {
      enabled: boolean;
      email: string;
      webhook: string;
    };
  };
  security: {
    cors: {
      origin: string;
      credentials: boolean;
    };
    encryption: {
      key: string;
      algorithm: string;
    };
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
    headers: {
      hsts: boolean;
      xssProtection: boolean;
      contentTypeOptions: boolean;
      frameOptions: boolean;
      referrerPolicy: boolean;
    };
  };
  backup: {
    retentionDays: number;
    schedule: string;
    storage: {
      type: 'local' | 's3' | 'gcs';
      config: any;
    };
    encryption: boolean;
    compression: boolean;
  };
  performance: {
    caching: {
      enabled: boolean;
      ttl: number;
    };
    compression: {
      enabled: boolean;
      level: number;
    };
    clustering: {
      enabled: boolean;
      instances: number;
    };
  };
  deployment: {
    platform: 'docker' | 'cloud' | 'vps';
    domain: string;
    ssl: boolean;
    cdn: boolean;
    loadBalancer: boolean;
  };
}

export class ProductionConfigManager {
  private config: ProductionConfig;

  constructor() {
    this.config = this.loadProductionConfiguration();
    this.validateProductionConfiguration();
  }

  /**
   * Load production configuration
   */
  private loadProductionConfiguration(): ProductionConfig {
    try {
      const env = ProductionEnvironmentSchema.parse(process.env);

      return {
        environment: 'production',
        port: env.PORT,
        ssl: {
          enabled: !!(env.SSL_CERT_PATH && env.SSL_KEY_PATH),
          certPath: env.SSL_CERT_PATH,
          keyPath: env.SSL_KEY_PATH,
        },
        database: {
          url: env.DATABASE_URL,
          ssl: true,
          poolSize: 20,
          timeout: 30000,
          retries: 3,
        },
        auth: {
          clerk: {
            secretKey: env.CLERK_SECRET_KEY,
            publishableKey: env.CLERK_PUBLISHABLE_KEY,
          },
          jwt: {
            secret: env.JWT_SECRET,
            expiresIn: '24h',
          },
        },
        ai: {
          providers: {
            openai: { apiKey: env.OPENAI_API_KEY },
            ...(env.ANTHROPIC_API_KEY && { anthropic: { apiKey: env.ANTHROPIC_API_KEY } }),
            ...(env.DEEPSEEK_API_KEY && { deepseek: { apiKey: env.DEEPSEEK_API_KEY } }),
            ...(env.GOOGLE_API_KEY && { google: { apiKey: env.GOOGLE_API_KEY } }),
            ...(env.META_API_KEY && { meta: { apiKey: env.META_API_KEY } }),
            ...(env.XAI_API_KEY && { xai: { apiKey: env.XAI_API_KEY } }),
          },
          rateLimits: {
            windowMs: env.RATE_LIMIT_WINDOW_MS,
            maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
          },
          fallback: {
            enabled: true,
            timeout: 10000,
          },
        },
        payments: {
          stripe: {
            secretKey: env.STRIPE_SECRET_KEY,
            webhookSecret: env.STRIPE_WEBHOOK_SECRET,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          },
          polar: {
            accessToken: env.POLAR_ACCESS_TOKEN,
          },
        },
        redis: {
          url: env.REDIS_URL || 'redis://localhost:6379',
          ttl: 3600,
          retries: 3,
        },
        monitoring: {
          sentry: {
            dsn: env.SENTRY_DSN || '',
            environment: 'production',
          },
          logLevel: env.LOG_LEVEL,
          interval: env.MONITORING_INTERVAL_MS,
          alerts: {
            enabled: true,
            email: process.env.ALERT_EMAIL || '',
            webhook: process.env.ALERT_WEBHOOK || '',
          },
        },
        security: {
          cors: {
            origin: env.CORS_ORIGIN,
            credentials: true,
          },
          encryption: {
            key: env.ENCRYPTION_KEY,
            algorithm: 'aes-256-gcm',
          },
          rateLimit: {
            windowMs: env.RATE_LIMIT_WINDOW_MS,
            maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
          },
          headers: {
            hsts: true,
            xssProtection: true,
            contentTypeOptions: true,
            frameOptions: true,
            referrerPolicy: true,
          },
        },
        backup: {
          retentionDays: env.BACKUP_RETENTION_DAYS,
          schedule: '0 2 * * *', // Daily at 2 AM
          storage: {
            type: 'local',
            config: {
              path: './backups',
            },
          },
          encryption: true,
          compression: true,
        },
        performance: {
          caching: {
            enabled: true,
            ttl: 3600,
          },
          compression: {
            enabled: true,
            level: 6,
          },
          clustering: {
            enabled: true,
            instances: 0, // Use all available CPUs
          },
        },
        deployment: {
          platform: 'cloud',
          domain: process.env.DOMAIN || 'localhost',
          ssl: true,
          cdn: true,
          loadBalancer: true,
        },
      };
    } catch (error) {
      console.error('Failed to load production configuration:', error);
      throw new Error('Invalid production configuration');
    }
  }

  /**
   * Validate production configuration
   */
  private validateProductionConfiguration(): void {
    const requiredProviders = ['openai'];
    const availableProviders = Object.keys(this.config.ai.providers);
    
    for (const provider of requiredProviders) {
      if (!availableProviders.includes(provider)) {
        throw new Error(`Required AI provider ${provider} is not configured`);
      }
    }

    if (!this.config.monitoring.sentry.dsn) {
      console.warn('Warning: Sentry monitoring not configured for production');
    }
    
    if (!this.config.redis.url) {
      console.warn('Warning: Redis caching not configured for production');
    }

    if (!this.config.ssl.enabled) {
      console.warn('Warning: SSL not configured for production');
    }

    if (!this.config.monitoring.alerts.email) {
      console.warn('Warning: Alert email not configured for production');
    }
  }

  /**
   * Get production configuration
   */
  getConfig(): ProductionConfig {
    return this.config;
  }

  /**
   * Get production readiness status
   */
  getProductionReadinessStatus(): {
    ready: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check SSL
    if (!this.config.ssl.enabled) {
      issues.push('SSL not configured');
      recommendations.push('Configure SSL certificates');
      score -= 20;
    }

    // Check monitoring
    if (!this.config.monitoring.sentry.dsn) {
      issues.push('Sentry monitoring not configured');
      recommendations.push('Configure Sentry for error monitoring');
      score -= 15;
    }

    // Check Redis
    if (!this.config.redis.url) {
      issues.push('Redis caching not configured');
      recommendations.push('Configure Redis for caching');
      score -= 10;
    }

    // Check alerts
    if (!this.config.monitoring.alerts.email) {
      issues.push('Alert email not configured');
      recommendations.push('Configure alert email for notifications');
      score -= 10;
    }

    // Check AI providers
    const availableProviders = Object.keys(this.config.ai.providers);
    if (availableProviders.length < 3) {
      issues.push('Limited AI provider coverage');
      recommendations.push('Configure additional AI providers for redundancy');
      score -= 10;
    }

    // Check backup
    if (!this.config.backup.encryption) {
      issues.push('Backup encryption not enabled');
      recommendations.push('Enable backup encryption');
      score -= 5;
    }

    return {
      ready: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Get production deployment checklist
   */
  getProductionDeploymentChecklist(): {
    preDeployment: string[];
    deployment: string[];
    postDeployment: string[];
  } {
    return {
      preDeployment: [
        'Configure all environment variables',
        'Set up SSL certificates',
        'Configure database with SSL',
        'Set up Redis caching',
        'Configure Sentry monitoring',
        'Set up backup storage',
        'Configure alert notifications',
        'Set up load balancer',
        'Configure CDN',
        'Set up monitoring dashboards',
      ],
      deployment: [
        'Deploy application to production',
        'Run database migrations',
        'Verify all services are running',
        'Test health endpoints',
        'Verify SSL certificates',
        'Test AI provider connections',
        'Verify payment processing',
        'Test backup system',
        'Verify monitoring systems',
        'Run security scans',
      ],
      postDeployment: [
        'Monitor health checks',
        'Verify performance metrics',
        'Test all API endpoints',
        'Verify security headers',
        'Test backup and recovery',
        'Monitor error rates',
        'Verify alert notifications',
        'Test scaling capabilities',
        'Run load tests',
        'Update documentation',
      ],
    };
  }

  /**
   * Get production performance targets
   */
  getProductionPerformanceTargets(): {
    responseTime: {
      api: number;
      ai: number;
      database: number;
    };
    availability: {
      uptime: number;
      errorRate: number;
    };
    scalability: {
      concurrentUsers: number;
      requestsPerSecond: number;
    };
  } {
    return {
      responseTime: {
        api: 200, // milliseconds
        ai: 5000, // milliseconds
        database: 100, // milliseconds
      },
      availability: {
        uptime: 99.9, // percentage
        errorRate: 0.1, // percentage
      },
      scalability: {
        concurrentUsers: 1000,
        requestsPerSecond: 100,
      },
    };
  }

  /**
   * Get production security requirements
   */
  getProductionSecurityRequirements(): {
    authentication: string[];
    authorization: string[];
    dataProtection: string[];
    networkSecurity: string[];
    monitoring: string[];
  } {
    return {
      authentication: [
        'Strong password policies',
        'Multi-factor authentication',
        'Session management',
        'JWT token security',
        'OAuth integration',
      ],
      authorization: [
        'Role-based access control',
        'API key management',
        'Rate limiting',
        'IP whitelisting',
        'Permission validation',
      ],
      dataProtection: [
        'Data encryption at rest',
        'Data encryption in transit',
        'PII anonymization',
        'GDPR compliance',
        'Data retention policies',
      ],
      networkSecurity: [
        'SSL/TLS encryption',
        'Security headers',
        'CORS configuration',
        'Firewall rules',
        'DDoS protection',
      ],
      monitoring: [
        'Security event logging',
        'Intrusion detection',
        'Vulnerability scanning',
        'Penetration testing',
        'Security audits',
      ],
    };
  }

  /**
   * Generate production environment report
   */
  generateProductionEnvironmentReport(): {
    configuration: ProductionConfig;
    readiness: any;
    checklist: any;
    performanceTargets: any;
    securityRequirements: any;
    timestamp: Date;
  } {
    return {
      configuration: this.config,
      readiness: this.getProductionReadinessStatus(),
      checklist: this.getProductionDeploymentChecklist(),
      performanceTargets: this.getProductionPerformanceTargets(),
      securityRequirements: this.getProductionSecurityRequirements(),
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const productionConfigManager = new ProductionConfigManager();

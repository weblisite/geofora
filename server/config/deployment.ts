/**
 * Deployment Configuration System
 * Comprehensive deployment setup for GEOFORA platform
 */

import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment validation schema
const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string().min(1).default('postgresql://localhost:5432/geofora'),
  CLERK_SECRET_KEY: z.string().min(1).default('sk_test_development_key'),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).default('pk_test_development_key'),
  OPENAI_API_KEY: z.string().min(1).default('sk-development-key'),
  ANTHROPIC_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  META_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().min(1).default('sk_test_development_key'),
  POLAR_ACCESS_TOKEN: z.string().min(1).default('development_token'),
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z.string().min(32).default('development-jwt-secret-key-minimum-32-characters-long'),
  ENCRYPTION_KEY: z.string().min(32).default('development-encryption-key-minimum-32-characters-long'),
  BACKUP_RETENTION_DAYS: z.string().transform(Number).default('30'),
  MONITORING_INTERVAL_MS: z.string().transform(Number).default('60000'), // 1 minute
});

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  port: number;
  database: {
    url: string;
    ssl: boolean;
    poolSize: number;
    timeout: number;
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
  };
  payments: {
    stripe: {
      secretKey: string;
      webhookSecret: string;
    };
    polar: {
      accessToken: string;
    };
  };
  redis?: {
    url: string;
    ttl: number;
  };
  monitoring: {
    sentry?: {
      dsn: string;
      environment: string;
    };
    logLevel: string;
    interval: number;
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
  };
  backup: {
    retentionDays: number;
    schedule: string;
    storage: {
      type: 'local' | 's3' | 'gcs';
      config: any;
    };
  };
}

export class DeploymentConfigManager {
  private config: DeploymentConfig;

  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): DeploymentConfig {
    try {
      const env = EnvironmentSchema.parse(process.env);

      return {
        environment: env.NODE_ENV,
        port: env.PORT,
        database: {
          url: env.DATABASE_URL,
          ssl: env.NODE_ENV === 'production',
          poolSize: env.NODE_ENV === 'production' ? 20 : 5,
          timeout: 30000,
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
        },
        payments: {
          stripe: {
            secretKey: env.STRIPE_SECRET_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
          },
          polar: {
            accessToken: env.POLAR_ACCESS_TOKEN,
          },
        },
        ...(env.REDIS_URL && {
          redis: {
            url: env.REDIS_URL,
            ttl: 3600, // 1 hour
          },
        }),
        monitoring: {
          ...(env.SENTRY_DSN && {
            sentry: {
              dsn: env.SENTRY_DSN,
              environment: env.NODE_ENV,
            },
          }),
          logLevel: env.LOG_LEVEL,
          interval: env.MONITORING_INTERVAL_MS,
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
        },
      };
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw new Error('Invalid configuration');
    }
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    const requiredProviders = ['openai'];
    const availableProviders = Object.keys(this.config.ai.providers);
    
    for (const provider of requiredProviders) {
      if (!availableProviders.includes(provider)) {
        throw new Error(`Required AI provider ${provider} is not configured`);
      }
    }

    if (this.config.environment === 'production') {
      if (!this.config.monitoring.sentry) {
        console.warn('Warning: Sentry monitoring not configured for production');
      }
      
      if (!this.config.redis) {
        console.warn('Warning: Redis caching not configured for production');
      }
    }
  }

  /**
   * Get configuration
   */
  getConfig(): DeploymentConfig {
    return this.config;
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig(): {
    isDevelopment: boolean;
    isStaging: boolean;
    isProduction: boolean;
    features: {
      enableCaching: boolean;
      enableMonitoring: boolean;
      enableBackup: boolean;
      enableRateLimit: boolean;
    };
  } {
    return {
      isDevelopment: this.config.environment === 'development',
      isStaging: this.config.environment === 'staging',
      isProduction: this.config.environment === 'production',
      features: {
        enableCaching: !!this.config.redis,
        enableMonitoring: !!this.config.monitoring.sentry,
        enableBackup: this.config.environment === 'production',
        enableRateLimit: true,
      },
    };
  }

  /**
   * Get AI provider configuration
   */
  getAIProviderConfig(provider: string): { apiKey: string } | null {
    return this.config.ai.providers[provider as keyof typeof this.config.ai.providers] || null;
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): DeploymentConfig['database'] {
    return this.config.database;
  }

  /**
   * Get security configuration
   */
  getSecurityConfig(): DeploymentConfig['security'] {
    return this.config.security;
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig(): DeploymentConfig['monitoring'] {
    return this.config.monitoring;
  }

  /**
   * Get backup configuration
   */
  getBackupConfig(): DeploymentConfig['backup'] {
    return this.config.backup;
  }

  /**
   * Validate AI provider configuration
   */
  validateAIProvider(provider: string): boolean {
    return !!this.config.ai.providers[provider as keyof typeof this.config.ai.providers];
  }

  /**
   * Get available AI providers
   */
  getAvailableAIProviders(): string[] {
    return Object.keys(this.config.ai.providers);
  }

  /**
   * Get configuration summary
   */
  getConfigurationSummary(): {
    environment: string;
    port: number;
    database: boolean;
    aiProviders: string[];
    monitoring: boolean;
    caching: boolean;
    backup: boolean;
  } {
    return {
      environment: this.config.environment,
      port: this.config.port,
      database: !!this.config.database.url,
      aiProviders: this.getAvailableAIProviders(),
      monitoring: !!this.config.monitoring.sentry,
      caching: !!this.config.redis,
      backup: this.config.backup.retentionDays > 0,
    };
  }
}

// Export singleton instance
export const deploymentConfig = new DeploymentConfigManager();

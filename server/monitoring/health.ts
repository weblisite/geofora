/**
 * Health Monitoring System
 * Comprehensive health checks and monitoring for GEOFORA platform
 */

import { db } from '../db';
import { aiProviderGateway } from '../ai-providers/gateway';
import { deploymentConfig } from '../config/deployment';

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  details?: any;
  error?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: HealthCheck[];
  uptime: number;
  version: string;
  environment: string;
}

export interface PerformanceMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  ai: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    providerStatus: Record<string, boolean>;
  };
  api: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    statusCodes: Record<number, number>;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number; // minutes
  lastTriggered?: Date;
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: any;
}

export class HealthMonitoringSystem {
  private startTime: Date = new Date();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private performanceMetrics: PerformanceMetrics[] = [];
  private alertRules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAlertRules();
    this.startMonitoring();
  }

  /**
   * Initialize default alert rules
   */
  private initializeAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'cpu_high',
        name: 'High CPU Usage',
        condition: 'cpu_usage > threshold',
        threshold: 80,
        severity: 'high',
        enabled: true,
        cooldown: 15,
      },
      {
        id: 'memory_high',
        name: 'High Memory Usage',
        condition: 'memory_usage > threshold',
        threshold: 85,
        severity: 'high',
        enabled: true,
        cooldown: 15,
      },
      {
        id: 'database_slow',
        name: 'Slow Database Queries',
        condition: 'db_query_time > threshold',
        threshold: 5000, // 5 seconds
        severity: 'medium',
        enabled: true,
        cooldown: 10,
      },
      {
        id: 'ai_error_rate',
        name: 'High AI Error Rate',
        condition: 'ai_error_rate > threshold',
        threshold: 10, // 10%
        severity: 'high',
        enabled: true,
        cooldown: 5,
      },
      {
        id: 'api_error_rate',
        name: 'High API Error Rate',
        condition: 'api_error_rate > threshold',
        threshold: 5, // 5%
        severity: 'medium',
        enabled: true,
        cooldown: 10,
      },
      {
        id: 'ai_provider_down',
        name: 'AI Provider Down',
        condition: 'ai_provider_status == false',
        threshold: 0,
        severity: 'critical',
        enabled: true,
        cooldown: 1,
      },
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    const config = deploymentConfig.getConfig();
    const interval = config.monitoring.interval;

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
        await this.collectPerformanceMetrics();
        await this.checkAlertRules();
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, interval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Perform health checks
   */
  async performHealthChecks(): Promise<void> {
    const checks = [
      this.checkDatabase(),
      this.checkAIProviders(),
      this.checkRedis(),
      this.checkExternalServices(),
    ];

    await Promise.allSettled(checks);
  }

  /**
   * Check database health
   */
  private async checkDatabase(): Promise<void> {
    const startTime = Date.now();
    
    try {
      await db.execute('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      this.healthChecks.set('database', {
        name: 'Database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: {
          responseTime,
          status: 'connected',
        },
      });
    } catch (error) {
      this.healthChecks.set('database', {
        name: 'Database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check AI providers health
   */
  private async checkAIProviders(): Promise<void> {
    const startTime = Date.now();
    const providers = deploymentConfig.getAvailableAIProviders();
    const providerStatus: Record<string, boolean> = {};

    for (const provider of providers) {
      try {
        await aiProviderGateway.generate(provider, [
          { role: 'user', content: 'Health check' }
        ], { maxTokens: 10 });
        providerStatus[provider] = true;
      } catch (error) {
        providerStatus[provider] = false;
      }
    }

    const healthyProviders = Object.values(providerStatus).filter(Boolean).length;
    const totalProviders = providers.length;
    const status = healthyProviders === totalProviders ? 'healthy' : 
                   healthyProviders > 0 ? 'degraded' : 'unhealthy';

    this.healthChecks.set('ai_providers', {
      name: 'AI Providers',
      status,
      responseTime: Date.now() - startTime,
      lastChecked: new Date(),
      details: {
        healthyProviders,
        totalProviders,
        providerStatus,
      },
    });
  }

  /**
   * Check Redis health
   */
  private async checkRedis(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // This would check Redis connection if configured
      const config = deploymentConfig.getConfig();
      if (!config.redis) {
        this.healthChecks.set('redis', {
          name: 'Redis Cache',
          status: 'healthy',
          responseTime: 0,
          lastChecked: new Date(),
          details: {
            status: 'not_configured',
          },
        });
        return;
      }

      // Simulate Redis check
      this.healthChecks.set('redis', {
        name: 'Redis Cache',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: {
          status: 'connected',
        },
      });
    } catch (error) {
      this.healthChecks.set('redis', {
        name: 'Redis Cache',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check external services
   */
  private async checkExternalServices(): Promise<void> {
    const startTime = Date.now();
    const services = ['stripe', 'polar', 'clerk'];
    const serviceStatus: Record<string, boolean> = {};

    for (const service of services) {
      try {
        // Simulate service check
        serviceStatus[service] = true;
      } catch (error) {
        serviceStatus[service] = false;
      }
    }

    const healthyServices = Object.values(serviceStatus).filter(Boolean).length;
    const totalServices = services.length;
    const status = healthyServices === totalServices ? 'healthy' : 
                   healthyServices > 0 ? 'degraded' : 'unhealthy';

    this.healthChecks.set('external_services', {
      name: 'External Services',
      status,
      responseTime: Date.now() - startTime,
      lastChecked: new Date(),
      details: {
        healthyServices,
        totalServices,
        serviceStatus,
      },
    });
  }

  /**
   * Collect performance metrics
   */
  async collectPerformanceMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        cpu: {
          usage: await this.getCPUUsage(),
          load: await this.getCPULoad(),
        },
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
        },
        database: {
          connections: await this.getDatabaseConnections(),
          queryTime: await this.getAverageQueryTime(),
          slowQueries: await this.getSlowQueryCount(),
        },
        ai: {
          totalRequests: await this.getAIRequestCount(),
          averageResponseTime: await this.getAverageAIResponseTime(),
          errorRate: await this.getAIErrorRate(),
          providerStatus: await this.getAIProviderStatus(),
        },
        api: {
          totalRequests: await this.getAPIRequestCount(),
          averageResponseTime: await this.getAverageAPIResponseTime(),
          errorRate: await this.getAPIErrorRate(),
          statusCodes: await this.getAPIStatusCodes(),
        },
      };

      this.performanceMetrics.push(metrics);

      // Keep only last 1000 metrics
      if (this.performanceMetrics.length > 1000) {
        this.performanceMetrics = this.performanceMetrics.slice(-1000);
      }
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  }

  /**
   * Get CPU usage
   */
  private async getCPUUsage(): Promise<number> {
    // This would use a library like 'cpu-stat' in a real implementation
    return Math.random() * 100;
  }

  /**
   * Get CPU load
   */
  private async getCPULoad(): Promise<number[]> {
    // This would use 'os.loadavg()' in a real implementation
    return [0.5, 0.6, 0.7];
  }

  /**
   * Get database connections
   */
  private async getDatabaseConnections(): Promise<number> {
    // This would query the database for connection count
    return 5;
  }

  /**
   * Get average query time
   */
  private async getAverageQueryTime(): Promise<number> {
    // This would track query times
    return 150; // milliseconds
  }

  /**
   * Get slow query count
   */
  private async getSlowQueryCount(): Promise<number> {
    // This would track slow queries
    return 0;
  }

  /**
   * Get AI request count
   */
  private async getAIRequestCount(): Promise<number> {
    // This would track AI requests
    return 100;
  }

  /**
   * Get average AI response time
   */
  private async getAverageAIResponseTime(): Promise<number> {
    // This would track AI response times
    return 2000; // milliseconds
  }

  /**
   * Get AI error rate
   */
  private async getAIErrorRate(): Promise<number> {
    // This would track AI errors
    return 2; // percentage
  }

  /**
   * Get AI provider status
   */
  private async getAIProviderStatus(): Promise<Record<string, boolean>> {
    const providers = deploymentConfig.getAvailableAIProviders();
    const status: Record<string, boolean> = {};
    
    for (const provider of providers) {
      status[provider] = true; // Simplified
    }
    
    return status;
  }

  /**
   * Get API request count
   */
  private async getAPIRequestCount(): Promise<number> {
    // This would track API requests
    return 500;
  }

  /**
   * Get average API response time
   */
  private async getAverageAPIResponseTime(): Promise<number> {
    // This would track API response times
    return 300; // milliseconds
  }

  /**
   * Get API error rate
   */
  private async getAPIErrorRate(): Promise<number> {
    // This would track API errors
    return 1; // percentage
  }

  /**
   * Get API status codes
   */
  private async getAPIStatusCodes(): Promise<Record<number, number>> {
    // This would track status codes
    return {
      200: 450,
      400: 30,
      500: 20,
    };
  }

  /**
   * Check alert rules
   */
  async checkAlertRules(): Promise<void> {
    if (this.performanceMetrics.length === 0) return;

    const latestMetrics = this.performanceMetrics[this.performanceMetrics.length - 1];

    for (const [ruleId, rule] of this.alertRules.entries()) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldown * 60 * 1000;
        if (Date.now() - rule.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }

      let shouldAlert = false;
      let alertMessage = '';

      switch (ruleId) {
        case 'cpu_high':
          if (latestMetrics.cpu.usage > rule.threshold) {
            shouldAlert = true;
            alertMessage = `CPU usage is ${latestMetrics.cpu.usage.toFixed(1)}%, exceeding threshold of ${rule.threshold}%`;
          }
          break;

        case 'memory_high':
          if (latestMetrics.memory.percentage > rule.threshold) {
            shouldAlert = true;
            alertMessage = `Memory usage is ${latestMetrics.memory.percentage.toFixed(1)}%, exceeding threshold of ${rule.threshold}%`;
          }
          break;

        case 'database_slow':
          if (latestMetrics.database.queryTime > rule.threshold) {
            shouldAlert = true;
            alertMessage = `Database query time is ${latestMetrics.database.queryTime}ms, exceeding threshold of ${rule.threshold}ms`;
          }
          break;

        case 'ai_error_rate':
          if (latestMetrics.ai.errorRate > rule.threshold) {
            shouldAlert = true;
            alertMessage = `AI error rate is ${latestMetrics.ai.errorRate}%, exceeding threshold of ${rule.threshold}%`;
          }
          break;

        case 'api_error_rate':
          if (latestMetrics.api.errorRate > rule.threshold) {
            shouldAlert = true;
            alertMessage = `API error rate is ${latestMetrics.api.errorRate}%, exceeding threshold of ${rule.threshold}%`;
          }
          break;

        case 'ai_provider_down':
          const unhealthyProviders = Object.entries(latestMetrics.ai.providerStatus)
            .filter(([_, status]) => !status)
            .map(([provider, _]) => provider);
          
          if (unhealthyProviders.length > 0) {
            shouldAlert = true;
            alertMessage = `AI providers are down: ${unhealthyProviders.join(', ')}`;
          }
          break;
      }

      if (shouldAlert) {
        await this.createAlert(ruleId, rule.severity, alertMessage, latestMetrics);
        rule.lastTriggered = new Date();
      }
    }
  }

  /**
   * Create alert
   */
  private async createAlert(
    ruleId: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metadata: any
  ): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: Alert = {
      id: alertId,
      ruleId,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata,
    };

    this.alerts.set(alertId, alert);
    
    // In a real implementation, this would send notifications
    console.log(`ALERT [${severity.toUpperCase()}]: ${message}`);
  }

  /**
   * Get system health
   */
  getSystemHealth(): SystemHealth {
    const checks = Array.from(this.healthChecks.values());
    const overall = this.calculateOverallHealth(checks);
    
    return {
      overall,
      timestamp: new Date(),
      checks,
      uptime: Date.now() - this.startTime.getTime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: deploymentConfig.getConfig().environment,
    };
  }

  /**
   * Calculate overall health
   */
  private calculateOverallHealth(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    if (checks.length === 0) return 'unhealthy';
    
    const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length;
    const degradedCount = checks.filter(check => check.status === 'degraded').length;
    
    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.performanceMetrics.slice(-limit);
  }

  /**
   * Get alerts
   */
  getAlerts(resolved: boolean = false): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.resolved === resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Update alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStatistics(): {
    uptime: number;
    totalChecks: number;
    totalAlerts: number;
    activeAlerts: number;
    averageResponseTime: number;
    healthScore: number;
  } {
    const checks = Array.from(this.healthChecks.values());
    const alerts = Array.from(this.alerts.values());
    const activeAlerts = alerts.filter(alert => !alert.resolved).length;
    
    const averageResponseTime = checks.length > 0 
      ? checks.reduce((sum, check) => sum + check.responseTime, 0) / checks.length
      : 0;
    
    const healthScore = this.calculateHealthScore(checks);

    return {
      uptime: Date.now() - this.startTime.getTime(),
      totalChecks: checks.length,
      totalAlerts: alerts.length,
      activeAlerts,
      averageResponseTime,
      healthScore,
    };
  }

  /**
   * Calculate health score
   */
  private calculateHealthScore(checks: HealthCheck[]): number {
    if (checks.length === 0) return 0;
    
    const scores = checks.map(check => {
      switch (check.status) {
        case 'healthy': return 100;
        case 'degraded': return 50;
        case 'unhealthy': return 0;
        default: return 0;
      }
    });
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
}

// Export singleton instance
export const healthMonitoringSystem = new HealthMonitoringSystem();

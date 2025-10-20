/**
 * Performance Optimization System
 * Implements PRD requirements for performance optimization and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  startTime: number;
  endTime: number;
  duration: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  databaseQueries: number;
  cacheHits: number;
  cacheMisses: number;
  apiCalls: number;
  errors: number;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  enableCaching: boolean;
  enableCompression: boolean;
  enableMinification: boolean;
  enableImageOptimization: boolean;
  enableCDN: boolean;
  cacheTTL: number;
  maxCacheSize: number;
  compressionLevel: number;
  imageQuality: number;
  cdnUrl?: string;
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
  hits: number;
}

export class PerformanceOptimizationSystem {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private config: PerformanceConfig;
  private readonly MAX_METRICS_SIZE = 1000;
  private readonly MAX_CACHE_SIZE = 10000;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * Performance monitoring middleware
   */
  performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (!this.config.enableMetrics) {
      return next();
    }

    const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
    const startTime = performance.now();
    const startCpuUsage = process.cpuUsage();
    const startMemoryUsage = process.memoryUsage();

    // Add performance tracking to request
    req.performance = {
      requestId,
      startTime,
      startCpuUsage,
      startMemoryUsage,
      databaseQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      errors: 0
    };

    // Override res.end to capture metrics
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const endTime = performance.now();
      const endCpuUsage = process.cpuUsage(startCpuUsage);
      const endMemoryUsage = process.memoryUsage();

      // Create performance metrics
      const metrics: PerformanceMetrics = {
        requestId,
        method: req.method,
        url: req.url,
        startTime,
        endTime,
        duration: endTime - startTime,
        statusCode: res.statusCode,
        memoryUsage: endMemoryUsage,
        cpuUsage: endCpuUsage,
        databaseQueries: req.performance?.databaseQueries || 0,
        cacheHits: req.performance?.cacheHits || 0,
        cacheMisses: req.performance?.cacheMisses || 0,
        apiCalls: req.performance?.apiCalls || 0,
        errors: req.performance?.errors || 0
      };

      // Store metrics
      this.storeMetrics(metrics);

      // Call original end
      originalEnd.call(res, chunk, encoding);
    }.bind(this);

    next();
  };

  /**
   * Cache management
   */
  async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.config.enableCaching) {
      return null;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit count
    entry.hits++;
    this.cache.set(key, entry);

    return entry.value as T;
  }

  async setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.config.enableCaching) {
      return;
    }

    // Check cache size limit
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntry();
    }

    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL,
      hits: 0
    };

    this.cache.set(key, entry);
  }

  /**
   * Database query optimization
   */
  async optimizeDatabaseQuery(query: string, params: any[]): Promise<{
    optimizedQuery: string;
    executionTime: number;
    rowsAffected: number;
  }> {
    const startTime = performance.now();

    // Query optimization logic would go here
    const optimizedQuery = this.optimizeQuery(query);
    
    // Execute query (this would be replaced with actual database execution)
    const result = await this.executeQuery(optimizedQuery, params);
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    return {
      optimizedQuery,
      executionTime,
      rowsAffected: result.rowsAffected || 0
    };
  }

  /**
   * API response optimization
   */
  optimizeResponse(data: any, req: Request): any {
    let optimizedData = data;

    // Remove unnecessary fields
    if (req.query.fields) {
      const fields = (req.query.fields as string).split(',');
      optimizedData = this.selectFields(optimizedData, fields);
    }

    // Limit array sizes
    if (req.query.limit) {
      const limit = parseInt(req.query.limit as string);
      optimizedData = this.limitArraySize(optimizedData, limit);
    }

    // Compress data if enabled
    if (this.config.enableCompression) {
      optimizedData = this.compressData(optimizedData);
    }

    return optimizedData;
  }

  /**
   * Image optimization
   */
  async optimizeImage(imageUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): Promise<string> {
    if (!this.config.enableImageOptimization) {
      return imageUrl;
    }

    const {
      width = 800,
      height = 600,
      quality = this.config.imageQuality,
      format = 'webp'
    } = options;

    // This would integrate with an image optimization service
    // For now, return a placeholder URL
    return `${this.config.cdnUrl || ''}/optimized/${width}x${height}/${quality}/${format}/${imageUrl}`;
  }

  /**
   * Content delivery optimization
   */
  async optimizeContentDelivery(content: string, type: 'html' | 'css' | 'js'): Promise<string> {
    let optimizedContent = content;

    // Minify content
    if (this.config.enableMinification) {
      optimizedContent = this.minifyContent(optimizedContent, type);
    }

    // Add CDN URLs
    if (this.config.enableCDN && this.config.cdnUrl) {
      optimizedContent = this.addCDNUrls(optimizedContent, this.config.cdnUrl);
    }

    return optimizedContent;
  }

  /**
   * Performance monitoring and alerting
   */
  getPerformanceStats(): {
    totalRequests: number;
    averageResponseTime: number;
    slowestRequests: PerformanceMetrics[];
    errorRate: number;
    cacheHitRate: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  } {
    const metrics = Array.from(this.metrics.values());
    const totalRequests = metrics.length;
    
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowestRequests: [],
        errorRate: 0,
        cacheHitRate: 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      };
    }

    const averageResponseTime = metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const slowestRequests = metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
    
    const errorRate = metrics.filter(m => m.statusCode >= 400).length / totalRequests;
    
    const totalCacheHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0);
    const totalCacheRequests = totalCacheHits + metrics.reduce((sum, m) => sum + m.cacheMisses, 0);
    const cacheHitRate = totalCacheRequests > 0 ? totalCacheHits / totalCacheRequests : 0;

    return {
      totalRequests,
      averageResponseTime,
      slowestRequests,
      errorRate,
      cacheHitRate,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Performance alerts
   */
  checkPerformanceAlerts(): Array<{
    type: 'slow_response' | 'high_error_rate' | 'high_memory_usage' | 'low_cache_hit_rate';
    message: string;
    value: number;
    threshold: number;
  }> {
    const stats = this.getPerformanceStats();
    const alerts: Array<{
      type: 'slow_response' | 'high_error_rate' | 'high_memory_usage' | 'low_cache_hit_rate';
      message: string;
      value: number;
      threshold: number;
    }> = [];

    // Slow response time alert
    if (stats.averageResponseTime > 1000) { // 1 second threshold
      alerts.push({
        type: 'slow_response',
        message: 'Average response time is too high',
        value: stats.averageResponseTime,
        threshold: 1000
      });
    }

    // High error rate alert
    if (stats.errorRate > 0.05) { // 5% threshold
      alerts.push({
        type: 'high_error_rate',
        message: 'Error rate is too high',
        value: stats.errorRate,
        threshold: 0.05
      });
    }

    // High memory usage alert
    const memoryUsageMB = stats.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) { // 500MB threshold
      alerts.push({
        type: 'high_memory_usage',
        message: 'Memory usage is too high',
        value: memoryUsageMB,
        threshold: 500
      });
    }

    // Low cache hit rate alert
    if (stats.cacheHitRate < 0.7) { // 70% threshold
      alerts.push({
        type: 'low_cache_hit_rate',
        message: 'Cache hit rate is too low',
        value: stats.cacheHitRate,
        threshold: 0.7
      });
    }

    return alerts;
  }

  /**
   * Performance optimization recommendations
   */
  getOptimizationRecommendations(): Array<{
    category: 'database' | 'caching' | 'compression' | 'images' | 'cdn';
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
  }> {
    const stats = this.getPerformanceStats();
    const recommendations: Array<{
      category: 'database' | 'caching' | 'compression' | 'images' | 'cdn';
      priority: 'high' | 'medium' | 'low';
      description: string;
      impact: string;
    }> = [];

    // Database recommendations
    if (stats.averageResponseTime > 500) {
      recommendations.push({
        category: 'database',
        priority: 'high',
        description: 'Optimize database queries and add indexes',
        impact: 'Reduce response time by 30-50%'
      });
    }

    // Caching recommendations
    if (stats.cacheHitRate < 0.8) {
      recommendations.push({
        category: 'caching',
        priority: 'medium',
        description: 'Implement more aggressive caching strategies',
        impact: 'Improve cache hit rate by 20-30%'
      });
    }

    // Compression recommendations
    if (!this.config.enableCompression) {
      recommendations.push({
        category: 'compression',
        priority: 'medium',
        description: 'Enable response compression',
        impact: 'Reduce bandwidth usage by 60-80%'
      });
    }

    // Image optimization recommendations
    if (!this.config.enableImageOptimization) {
      recommendations.push({
        category: 'images',
        priority: 'low',
        description: 'Implement image optimization and WebP conversion',
        impact: 'Reduce image load times by 40-60%'
      });
    }

    // CDN recommendations
    if (!this.config.enableCDN) {
      recommendations.push({
        category: 'cdn',
        priority: 'medium',
        description: 'Implement CDN for static assets',
        impact: 'Improve global load times by 50-70%'
      });
    }

    return recommendations;
  }

  /**
   * Private helper methods
   */
  private storeMetrics(metrics: PerformanceMetrics): void {
    this.metrics.set(metrics.requestId, metrics);

    // Maintain metrics size limit
    if (this.metrics.size > this.MAX_METRICS_SIZE) {
      const oldestKey = this.metrics.keys().next().value;
      this.metrics.delete(oldestKey);
    }
  }

  private evictOldestCacheEntry(): void {
    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private optimizeQuery(query: string): string {
    // Basic query optimization
    return query
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private async executeQuery(query: string, params: any[]): Promise<any> {
    // This would be replaced with actual database execution
    return { rowsAffected: 1 };
  }

  private selectFields(data: any, fields: string[]): any {
    if (Array.isArray(data)) {
      return data.map(item => this.selectFields(item, fields));
    }

    if (typeof data === 'object' && data !== null) {
      const result: any = {};
      fields.forEach(field => {
        if (data.hasOwnProperty(field)) {
          result[field] = data[field];
        }
      });
      return result;
    }

    return data;
  }

  private limitArraySize(data: any, limit: number): any {
    if (Array.isArray(data)) {
      return data.slice(0, limit);
    }
    return data;
  }

  private compressData(data: any): any {
    // This would integrate with compression libraries
    return data;
  }

  private minifyContent(content: string, type: 'html' | 'css' | 'js'): string {
    // Basic minification
    return content
      .replace(/\s+/g, ' ')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  }

  private addCDNUrls(content: string, cdnUrl: string): string {
    // Add CDN URLs to static assets
    return content
      .replace(/src="\/([^"]+)"/g, `src="${cdnUrl}/$1"`)
      .replace(/href="\/([^"]+)"/g, `href="${cdnUrl}/$1"`);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Clear performance data
   */
  clearPerformanceData(): void {
    this.metrics.clear();
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance with default configuration
export const performanceOptimizationSystem = new PerformanceOptimizationSystem({
  enableMetrics: true,
  enableCaching: true,
  enableCompression: true,
  enableMinification: true,
  enableImageOptimization: true,
  enableCDN: false,
  cacheTTL: 300000, // 5 minutes
  maxCacheSize: 10000,
  compressionLevel: 6,
  imageQuality: 80
});

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      performance?: {
        requestId: string;
        startTime: number;
        startCpuUsage: NodeJS.CpuUsage;
        startMemoryUsage: NodeJS.MemoryUsage;
        databaseQueries: number;
        cacheHits: number;
        cacheMisses: number;
        apiCalls: number;
        errors: number;
      };
    }
  }
}

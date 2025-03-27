/**
 * AI Caching System
 * 
 * This file implements a caching system for AI responses to reduce API costs and improve performance.
 * It provides methods to store, retrieve, and invalidate cached responses based on prompts and parameters.
 */

import * as crypto from 'crypto';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  usageCount: number;
}

export interface AiCacheOptions {
  defaultTtl: number; // Time-to-live in milliseconds
  maxCacheSize: number; // Maximum number of entries in the cache
  cachePrefixes: string[]; // List of cache prefixes for different functionalities
}

export class AiCache {
  private cache: Map<string, CacheEntry<any>>;
  private options: AiCacheOptions;
  
  constructor(options?: Partial<AiCacheOptions>) {
    this.cache = new Map();
    this.options = {
      defaultTtl: options?.defaultTtl || 1000 * 60 * 60 * 24, // 24 hours default
      maxCacheSize: options?.maxCacheSize || 1000, // 1000 entries default
      cachePrefixes: options?.cachePrefixes || [
        'generate-content',
        'generate-questions',
        'analyze-seo',
        'generate-answer',
        'interlinks'
      ],
    };
  }

  /**
   * Generate a cache key from input parameters
   */
  private generateCacheKey(prefix: string, params: Record<string, any>): string {
    // Sort parameters to ensure consistent key generation regardless of object property order
    const sortedParams = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .reduce((acc, [key, value]) => {
        // Skip parameters that shouldn't be part of the cache key
        if (key === 'temperature' || key === 'max_tokens') return acc;
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);

    // Create a hash of the parameters to use as the cache key
    const paramsString = JSON.stringify(sortedParams);
    const hash = crypto.createHash('md5').update(paramsString).digest('hex');
    
    return `${prefix}:${hash}`;
  }

  /**
   * Get a value from the cache
   */
  public get<T>(prefix: string, params: Record<string, any>): T | null {
    const key = this.generateCacheKey(prefix, params);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if the entry has expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    // Update usage count
    entry.usageCount++;
    this.cache.set(key, entry);
    
    return entry.data;
  }

  /**
   * Set a value in the cache
   */
  public set<T>(prefix: string, params: Record<string, any>, data: T, ttl?: number): void {
    // Check cache size limit before adding a new entry
    if (this.cache.size >= this.options.maxCacheSize) {
      this.evictLeastUsed();
    }
    
    const key = this.generateCacheKey(prefix, params);
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl || this.options.defaultTtl);
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
      usageCount: 1
    });
  }

  /**
   * Evict the least used cache entries to make room for new ones
   */
  private evictLeastUsed(): void {
    // Convert the cache Map to an array of [key, entry] pairs
    const entries = Array.from(this.cache.entries());
    
    // Sort by usage count (ascending) and then by age (oldest first)
    entries.sort(([, entryA], [, entryB]) => {
      if (entryA.usageCount !== entryB.usageCount) {
        return entryA.usageCount - entryB.usageCount;
      }
      return entryA.timestamp - entryB.timestamp;
    });
    
    // Remove the 10% least used entries or at least one entry
    const removeCount = Math.max(1, Math.floor(this.cache.size * 0.1));
    for (let i = 0; i < removeCount && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Invalidate cache entries by prefix
   */
  public invalidateByPrefix(prefix: string): void {
    // Convert keys to array before iterating to avoid iterator issues
    const keysToCheck = Array.from(this.cache.keys());
    for (const key of keysToCheck) {
      if (key.startsWith(`${prefix}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate all cache entries
   */
  public invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Get stats about the cache
   */
  public getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
    missRate?: number;
    entriesByPrefix: Record<string, number>;
  } {
    const entriesByPrefix: Record<string, number> = {};
    
    // Count entries by prefix - use Array.from to avoid iterator issues
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      const prefix = key.split(':')[0];
      entriesByPrefix[prefix] = (entriesByPrefix[prefix] || 0) + 1;
    }
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxCacheSize,
      entriesByPrefix
    };
  }
}

// Create a singleton instance of the cache
export const aiCache = new AiCache();
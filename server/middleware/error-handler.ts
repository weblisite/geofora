/**
 * Comprehensive Error Handling System
 * Implements PRD requirements for robust error handling and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ErrorDetails {
  code: string;
  message: string;
  statusCode: number;
  timestamp: Date;
  requestId: string;
  userId?: string;
  organizationId?: string;
  stack?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  id: string;
  error: ErrorDetails;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
    query?: any;
    params?: any;
  };
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body?: any;
  };
  environment: string;
  version: string;
}

export class ErrorHandlingSystem {
  private errorLogs: Map<string, ErrorLog> = new Map();
  private readonly MAX_LOG_SIZE = 1000;

  /**
   * Global error handler middleware
   */
  globalErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    const errorDetails = this.processError(error, req);
    const errorLog = this.createErrorLog(errorDetails, req, res);
    
    // Log error
    this.logError(errorLog);
    
    // Send error response
    this.sendErrorResponse(res, errorDetails);
  };

  /**
   * Process different types of errors
   */
  private processError(error: Error, req: Request): ErrorDetails {
    const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
    const timestamp = new Date();

    // Handle different error types
    if (error instanceof ZodError) {
      return this.handleValidationError(error, requestId, timestamp);
    }

    if (error.name === 'ValidationError') {
      return this.handleValidationError(error, requestId, timestamp);
    }

    if (error.name === 'UnauthorizedError') {
      return this.handleUnauthorizedError(error, requestId, timestamp);
    }

    if (error.name === 'ForbiddenError') {
      return this.handleForbiddenError(error, requestId, timestamp);
    }

    if (error.name === 'NotFoundError') {
      return this.handleNotFoundError(error, requestId, timestamp);
    }

    if (error.name === 'RateLimitError') {
      return this.handleRateLimitError(error, requestId, timestamp);
    }

    if (error.name === 'DatabaseError') {
      return this.handleDatabaseError(error, requestId, timestamp);
    }

    if (error.name === 'AIProviderError') {
      return this.handleAIProviderError(error, requestId, timestamp);
    }

    // Default error handling
    return this.handleGenericError(error, requestId, timestamp);
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(error: Error, requestId: string, timestamp: Date): ErrorDetails {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data provided',
      statusCode: 400,
      timestamp,
      requestId,
      metadata: {
        originalError: error.message,
        type: 'validation'
      }
    };
  }

  /**
   * Handle unauthorized errors
   */
  private handleUnauthorizedError(error: Error, requestId: string, timestamp: Date): ErrorDetails {
    return {
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
      statusCode: 401,
      timestamp,
      requestId,
      metadata: {
        originalError: error.message,
        type: 'authentication'
      }
    };
  }

  /**
   * Handle forbidden errors
   */
  private handleForbiddenError(error: Error, requestId: string, timestamp: Date): ErrorDetails {
    return {
      code: 'FORBIDDEN',
      message: 'Insufficient permissions',
      statusCode: 403,
      timestamp,
      requestId,
      metadata: {
        originalError: error.message,
        type: 'authorization'
      }
    };
  }

  /**
   * Handle not found errors
   */
  private handleNotFoundError(error: Error, requestId: string, timestamp: Date): ErrorDetails {
    return {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      statusCode: 404,
      timestamp,
      requestId,
      metadata: {
        originalError: error.message,
        type: 'not_found'
      }
    };
  }

  /**
   * Handle rate limit errors
   */
  private handleRateLimitError(error: Error, requestId: string, timestamp: Date): ErrorDetails {
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded',
      statusCode: 429,
      timestamp,
      requestId,
      metadata: {
        originalError: error.message,
        type: 'rate_limit'
      }
    };
  }

  /**
   * Handle database errors
   */
  private handleDatabaseError(error: Error, requestId: string, timestamp: Date): ErrorDetails {
    return {
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
      statusCode: 500,
      timestamp,
      requestId,
      stack: error.stack,
      metadata: {
        originalError: error.message,
        type: 'database'
      }
    };
  }

  /**
   * Handle AI provider errors
   */
  private handleAIProviderError(error: Error, requestId: string, timestamp: Date): ErrorDetails {
    return {
      code: 'AI_PROVIDER_ERROR',
      message: 'AI provider service unavailable',
      statusCode: 503,
      timestamp,
      requestId,
      metadata: {
        originalError: error.message,
        type: 'ai_provider'
      }
    };
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(error: Error, requestId: string, timestamp: Date): ErrorDetails {
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp,
      requestId,
      stack: error.stack,
      metadata: {
        originalError: error.message,
        type: 'generic'
      }
    };
  }

  /**
   * Create error log entry
   */
  private createErrorLog(
    errorDetails: ErrorDetails,
    req: Request,
    res?: Response
  ): ErrorLog {
    return {
      id: this.generateRequestId(),
      error: errorDetails,
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers as Record<string, string>,
        body: req.body,
        query: req.query,
        params: req.params
      },
      response: res ? {
        statusCode: res.statusCode,
        headers: res.getHeaders() as Record<string, string>,
        body: res.locals.responseBody
      } : undefined,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0'
    };
  }

  /**
   * Log error to storage
   */
  private logError(errorLog: ErrorLog): void {
    // Store error log
    this.errorLogs.set(errorLog.id, errorLog);

    // Maintain log size limit
    if (this.errorLogs.size > this.MAX_LOG_SIZE) {
      const oldestKey = this.errorLogs.keys().next().value;
      this.errorLogs.delete(oldestKey);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Log:', {
        id: errorLog.id,
        code: errorLog.error.code,
        message: errorLog.error.message,
        statusCode: errorLog.error.statusCode,
        timestamp: errorLog.error.timestamp,
        request: {
          method: errorLog.request.method,
          url: errorLog.request.url
        }
      });
    }

    // In production, this would integrate with external logging services
    // like Sentry, DataDog, or CloudWatch
  }

  /**
   * Send error response to client
   */
  private sendErrorResponse(res: Response, errorDetails: ErrorDetails): void {
    const response = {
      success: false,
      error: {
        code: errorDetails.code,
        message: errorDetails.message,
        requestId: errorDetails.requestId,
        timestamp: errorDetails.timestamp
      }
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && errorDetails.stack) {
      (response.error as any).stack = errorDetails.stack;
    }

    res.status(errorDetails.statusCode).json(response);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByStatusCode: Record<number, number>;
    recentErrors: ErrorLog[];
  } {
    const errors = Array.from(this.errorLogs.values());
    
    const errorsByType: Record<string, number> = {};
    const errorsByStatusCode: Record<number, number> = {};
    
    errors.forEach(errorLog => {
      const type = errorLog.error.metadata?.type || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + 1;
      
      const statusCode = errorLog.error.statusCode;
      errorsByStatusCode[statusCode] = (errorsByStatusCode[statusCode] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      errorsByType,
      errorsByStatusCode,
      recentErrors: errors.slice(-10).reverse()
    };
  }

  /**
   * Get error logs by criteria
   */
  getErrorLogs(criteria: {
    type?: string;
    statusCode?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): ErrorLog[] {
    let errors = Array.from(this.errorLogs.values());

    if (criteria.type) {
      errors = errors.filter(errorLog => 
        errorLog.error.metadata?.type === criteria.type
      );
    }

    if (criteria.statusCode) {
      errors = errors.filter(errorLog => 
        errorLog.error.statusCode === criteria.statusCode
      );
    }

    if (criteria.startDate) {
      errors = errors.filter(errorLog => 
        errorLog.error.timestamp >= criteria.startDate!
      );
    }

    if (criteria.endDate) {
      errors = errors.filter(errorLog => 
        errorLog.error.timestamp <= criteria.endDate!
      );
    }

    if (criteria.limit) {
      errors = errors.slice(0, criteria.limit);
    }

    return errors.sort((a, b) => 
      b.error.timestamp.getTime() - a.error.timestamp.getTime()
    );
  }

  /**
   * Clear error logs
   */
  clearErrorLogs(): void {
    this.errorLogs.clear();
  }

  /**
   * Custom error classes
   */
  static createCustomError(
    code: string,
    message: string,
    statusCode: number = 500,
    metadata?: Record<string, any>
  ): Error {
    const error = new Error(message);
    error.name = code;
    (error as any).statusCode = statusCode;
    (error as any).metadata = metadata;
    return error;
  }

  /**
   * Validation error helper
   */
  static createValidationError(message: string, details?: any): Error {
    return this.createCustomError('ValidationError', message, 400, { details });
  }

  /**
   * Unauthorized error helper
   */
  static createUnauthorizedError(message: string = 'Authentication required'): Error {
    return this.createCustomError('UnauthorizedError', message, 401);
  }

  /**
   * Forbidden error helper
   */
  static createForbiddenError(message: string = 'Insufficient permissions'): Error {
    return this.createCustomError('ForbiddenError', message, 403);
  }

  /**
   * Not found error helper
   */
  static createNotFoundError(message: string = 'Resource not found'): Error {
    return this.createCustomError('NotFoundError', message, 404);
  }

  /**
   * Rate limit error helper
   */
  static createRateLimitError(message: string = 'Rate limit exceeded'): Error {
    return this.createCustomError('RateLimitError', message, 429);
  }

  /**
   * Database error helper
   */
  static createDatabaseError(message: string, originalError?: Error): Error {
    return this.createCustomError('DatabaseError', message, 500, { 
      originalError: originalError?.message 
    });
  }

  /**
   * AI provider error helper
   */
  static createAIProviderError(message: string, provider?: string): Error {
    return this.createCustomError('AIProviderError', message, 503, { provider });
  }
}

// Export singleton instance
export const errorHandlingSystem = new ErrorHandlingSystem();

// Export error classes for use in other modules
export const CustomErrors = {
  ValidationError: ErrorHandlingSystem.createValidationError,
  UnauthorizedError: ErrorHandlingSystem.createUnauthorizedError,
  ForbiddenError: ErrorHandlingSystem.createForbiddenError,
  NotFoundError: ErrorHandlingSystem.createNotFoundError,
  RateLimitError: ErrorHandlingSystem.createRateLimitError,
  DatabaseError: ErrorHandlingSystem.createDatabaseError,
  AIProviderError: ErrorHandlingSystem.createAIProviderError
};

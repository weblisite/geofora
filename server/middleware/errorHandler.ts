import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware for Express
 * Handles different types of errors and provides appropriate responses
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🚨 Error occurred:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  // Handle different error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'The provided data is invalid',
      details: error.details || error.message,
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'UnauthorizedError' || error.message?.includes('Authentication required')) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Please log in to access this resource',
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Access Forbidden',
      message: 'You do not have permission to access this resource',
      timestamp: new Date().toISOString()
    });
  }

  // PostgreSQL specific errors
  if (error.code === '23505') { // Unique violation
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'This record already exists',
      timestamp: new Date().toISOString()
    });
  }

  if (error.code === '23503') { // Foreign key violation
    return res.status(400).json({
      error: 'Invalid Reference',
      message: 'Referenced record does not exist',
      timestamp: new Date().toISOString()
    });
  }

  if (error.code === '23502') { // Not null violation
    return res.status(400).json({
      error: 'Missing Required Field',
      message: 'A required field is missing',
      timestamp: new Date().toISOString()
    });
  }

  // Database connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Database Unavailable',
      message: 'Database service is temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }

  // Clerk authentication errors
  if (error.message?.includes('Invalid authentication token') || error.message?.includes('Token verification')) {
    return res.status(401).json({
      error: 'Invalid Authentication',
      message: 'Your authentication token is invalid or expired',
      timestamp: new Date().toISOString()
    });
  }

  // OpenAI API errors
  if (error.message?.includes('OpenAI') || error.code === 'OPENAI_ERROR') {
    return res.status(503).json({
      error: 'AI Service Unavailable',
      message: 'AI service is temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Something went wrong. Please try again later.',
    timestamp: new Date().toISOString()
  });
};

/**
 * Async wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
};
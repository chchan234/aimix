/**
 * Centralized Error Handling Utilities
 *
 * Provides consistent error handling and response formatting across the API
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Standard API Error Response Format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Standard API Success Response Format
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  [key: string]: any; // Allow additional fields like credits, etc.
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Common API error types
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', message, 403);
  }
}

export class InsufficientCreditsError extends ApiError {
  constructor(required: number, current: number) {
    super(
      'INSUFFICIENT_CREDITS',
      `This service costs ${required} credits, but you only have ${current} credits.`,
      403,
      { required, current }
    );
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
  }
}

/**
 * Higher-order function to wrap async route handlers with error handling
 *
 * @example
 * router.get('/example', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json({ success: true, data });
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handling middleware
 * Should be added after all routes
 *
 * @example
 * app.use(globalErrorHandler);
 */
export function globalErrorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle generic errors
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    },
  };
  res.status(500).json(response);
}

/**
 * Helper to send success response
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  additionalFields?: Record<string, any>
): void {
  const response: ApiSuccessResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...additionalFields,
  };
  res.json(response);
}

/**
 * Helper to send error response
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  res.status(statusCode).json(response);
}

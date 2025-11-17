/**
 * Global Error Handler Middleware
 *
 * Centralized error handling for Express
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiErrorResponse } from '../utils/error-handler.js';

/**
 * Global error handling middleware
 * Should be added after all routes
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

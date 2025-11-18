/**
 * Validation middleware using Zod schemas
 * Provides type-safe request validation with detailed error messages
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Creates validation middleware for request body
 * @param schema - Zod schema to validate against
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request body
      const validated = await schema.parseAsync(req.body);

      // Replace req.body with validated data (type-safe)
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format validation errors in user-friendly way
        const fields = error.errors.map(err => ({
          field: err.path.join('.') || 'body',
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: fields.map(f => `${f.field}: ${f.message}`).join(', '),
          fields,
        });
      }

      // Unknown error
      console.error('Validation error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
      });
    }
  };
}

/**
 * Creates validation middleware for query parameters
 * @param schema - Zod schema to validate against
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = error.errors.map(err => ({
          field: err.path.join('.') || 'query',
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Invalid query parameters',
          details: fields.map(f => `${f.field}: ${f.message}`).join(', '),
          fields,
        });
      }

      console.error('Query validation error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
      });
    }
  };
}

/**
 * Creates validation middleware for route parameters
 * @param schema - Zod schema to validate against
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = error.errors.map(err => ({
          field: err.path.join('.') || 'params',
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Invalid route parameters',
          details: fields.map(f => `${f.field}: ${f.message}`).join(', '),
          fields,
        });
      }

      console.error('Params validation error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
      });
    }
  };
}

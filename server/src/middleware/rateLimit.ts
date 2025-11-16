/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiting (use Redis in production)
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limit by user ID
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimitByUser(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userData) {
      // If no user data, skip rate limiting (auth middleware should catch this)
      next();
      return;
    }

    const userId = req.userData.id;
    const now = Date.now();
    const key = `user:${userId}`;

    let entry = rateLimitStore.get(key);

    // Create new entry if not exists or expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if rate limit exceeded
    if (entry.count > maxRequests) {
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${resetIn} seconds.`,
        retryAfter: resetIn
      });
      return;
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

    next();
  };
}

/**
 * Preset rate limits for different service tiers
 */
export const RateLimits = {
  // AI endpoints: 30 requests per minute per user
  AI: rateLimitByUser(30, 60 * 1000),

  // Authentication: 10 requests per minute per IP (prevents brute force)
  AUTH: rateLimitByUser(10, 60 * 1000),

  // General API: 100 requests per minute per user
  GENERAL: rateLimitByUser(100, 60 * 1000),
};

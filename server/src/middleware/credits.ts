/**
 * Credits Middleware
 * Handles credit checking and deduction for AI services
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase.js';

/**
 * Credit costs for different AI services
 */
export const CREDIT_COSTS = {
  'name-analysis': 10,
  'dream-interpretation': 15,
  'story': 20,
  'chat': 5,
  'face-reading': 25, // Vision API is more expensive
} as const;

/**
 * Check if user has enough credits and deduct them
 */
export function requireCredits(serviceName: keyof typeof CREDIT_COSTS) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userData) {
        res.status(401).json({
          error: 'Authentication required'
        });
        return;
      }

      const cost = CREDIT_COSTS[serviceName];
      const userId = req.userData.id;
      const currentCredits = req.userData.credits;

      // Check if user has enough credits
      if (currentCredits < cost) {
        res.status(402).json({
          error: 'Insufficient credits',
          required: cost,
          current: currentCredits,
          message: `This service costs ${cost} credits, but you only have ${currentCredits} credits.`
        });
        return;
      }

      // Deduct credits
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          credits: currentCredits - cost
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Credit deduction error:', error);
        res.status(500).json({
          error: 'Failed to deduct credits'
        });
        return;
      }

      // Update user data in request
      req.userData = updatedUser;

      // Attach credit info to response
      res.locals.creditInfo = {
        cost,
        previousBalance: currentCredits,
        newBalance: updatedUser.credits
      };

      next();
    } catch (error) {
      console.error('Credits middleware error:', error);
      res.status(500).json({
        error: 'Credit processing failed'
      });
    }
  };
}

/**
 * Attach credit info to successful response
 */
export function attachCreditInfo(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    if (res.locals.creditInfo && body.success !== false) {
      body.credits = {
        ...res.locals.creditInfo,
        remaining: req.userData?.credits
      };
    }
    return originalJson(body);
  };

  next();
}

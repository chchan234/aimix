/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user data to request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';

// Validate JWT_SECRET at module load time
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = process.env.JWT_SECRET;

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        emailVerified?: boolean;
        provider: string;
      };
      userData?: {
        id: string;
        email: string;
        username: string;
        credits: number;
        email_verified: boolean;
        provider: string;
      };
    }
  }
}

/**
 * Verify JWT token and attach user to request
 * Supports both Authorization header and httpOnly cookie
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : null;

    // If no header token, try cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        error: 'No token provided'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      emailVerified?: boolean;
      provider: string;
    };

    // Attach user to request (no DB query needed!)
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
}

/**
 * Require email verification
 * Only applies to email-based users (Kakao users are pre-verified)
 */
export function requireEmailVerification(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Email provider users must verify their email
  if (req.user?.provider === 'email' && !req.user?.emailVerified) {
    res.status(403).json({
      error: 'Email verification required',
      message: 'Please verify your email before using this feature'
    });
    return;
  }

  next();
}

/**
 * Load full user data from database (only use when needed)
 * This is a separate middleware to avoid unnecessary DB queries
 */
export async function loadUserData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required'
      });
      return;
    }

    // Fetch full user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      res.status(401).json({
        error: 'User not found'
      });
      return;
    }

    // Attach full user data to request
    req.userData = user;

    next();
  } catch (error) {
    console.error('Load user data error:', error);
    res.status(500).json({
      error: 'Failed to load user data'
    });
  }
}

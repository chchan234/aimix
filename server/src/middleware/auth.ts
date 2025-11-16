/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user data to request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET!;

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        emailVerified?: boolean;
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
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No token provided'
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      emailVerified?: boolean;
    };

    // Attach user to request
    req.user = decoded;

    // Fetch full user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      res.status(401).json({
        error: 'Invalid token - user not found'
      });
      return;
    }

    // Attach full user data to request
    req.userData = user;

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
 */
export function requireEmailVerification(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.userData?.email_verified && req.userData?.provider === 'email') {
    res.status(403).json({
      error: 'Email verification required',
      message: 'Please verify your email before using this feature'
    });
    return;
  }

  next();
}

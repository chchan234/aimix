/**
 * Refresh Token Service
 * Handles refresh token generation, validation, and revocation
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { supabase } from '../db/supabase.js';

const REFRESH_TOKEN_EXPIRES_DAYS = 30;

/**
 * Generate a secure random refresh token
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Create and store a refresh token for a user
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const token = generateRefreshToken();
  const hashedToken = await bcrypt.hash(token, 10);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

  const { error } = await supabase
    .from('refresh_tokens')
    .insert({
      user_id: userId,
      token: hashedToken,
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    console.error('Failed to create refresh token:', error);
    throw new Error('Failed to create refresh token');
  }

  return token; // Return unhashed token to send to client
}

/**
 * Verify a refresh token and return user ID if valid
 */
export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    // Get all non-revoked, non-expired tokens
    const { data: tokens, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .is('revoked_at', null)
      .gte('expires_at', new Date().toISOString());

    if (error || !tokens || tokens.length === 0) {
      return null;
    }

    // Check each token to find matching hash
    for (const storedToken of tokens) {
      const isValid = await bcrypt.compare(token, storedToken.token);
      if (isValid) {
        return storedToken.user_id;
      }
    }

    return null;
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
}

/**
 * Revoke a refresh token (logout)
 */
export async function revokeRefreshToken(token: string): Promise<boolean> {
  try {
    // Get all non-revoked tokens
    const { data: tokens, error: fetchError } = await supabase
      .from('refresh_tokens')
      .select('*')
      .is('revoked_at', null);

    if (fetchError || !tokens) {
      return false;
    }

    // Find and revoke matching token
    for (const storedToken of tokens) {
      const isMatch = await bcrypt.compare(token, storedToken.token);
      if (isMatch) {
        const { error: revokeError } = await supabase
          .from('refresh_tokens')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', storedToken.id);

        return !revokeError;
      }
    }

    return false;
  } catch (error) {
    console.error('Refresh token revocation error:', error);
    return false;
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);

    return !error;
  } catch (error) {
    console.error('Failed to revoke user tokens:', error);
    return false;
  }
}

/**
 * Clean up expired and revoked tokens (cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .delete()
      .or(`expires_at.lt.${new Date().toISOString()},revoked_at.not.is.null`)
      .select();

    if (error) {
      console.error('Token cleanup error:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Token cleanup error:', error);
    return 0;
  }
}

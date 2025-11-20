/**
 * OAuth State Management
 *
 * Manages CSRF state tokens for OAuth flows using JWT
 * Works in serverless environments without requiring shared state
 */

import crypto from 'crypto';

// State token TTL: 10 minutes
const STATE_TTL_MS = 10 * 60 * 1000;

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Generate a new OAuth state token using JWT
 * @returns JWT-signed state token
 */
export function generateStateToken(): string {
  const payload = {
    nonce: crypto.randomBytes(32).toString('hex'),
    iat: Date.now(),
    exp: Date.now() + STATE_TTL_MS,
  };

  // Simple JWT implementation (header.payload.signature)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payloadStr}`)
    .digest('base64url');

  return `${header}.${payloadStr}.${signature}`;
}

/**
 * Verify and consume an OAuth state token
 * @param token - The JWT state token to verify
 * @returns true if valid, false otherwise
 */
export function verifyAndConsumeStateToken(token: string): boolean {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const [header, payloadStr, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payloadStr}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return false;
    }

    // Decode and verify payload
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString());

    // Check if expired
    if (Date.now() > payload.exp) {
      return false;
    }

    // Verify it was issued recently (within TTL)
    if (Date.now() - payload.iat > STATE_TTL_MS) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('State token verification error:', error);
    return false;
  }
}

/**
 * Get current state store size (for monitoring)
 * Returns 0 since we're not storing tokens anymore
 */
export function getStateStoreSize(): number {
  return 0;
}

/**
 * OAuth State Management
 *
 * Manages CSRF state tokens for OAuth flows
 * Note: In production, use Redis or a database for distributed systems
 */

import crypto from 'crypto';

interface StateRecord {
  token: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory store for OAuth state tokens
// TODO: Replace with Redis in production for multi-instance deployments
const stateStore = new Map<string, StateRecord>();

// State token TTL: 10 minutes
const STATE_TTL_MS = 10 * 60 * 1000;

// Cleanup interval: every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Generate a new OAuth state token
 * @returns 64-character hex string
 */
export function generateStateToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();

  stateStore.set(token, {
    token,
    createdAt: now,
    expiresAt: now + STATE_TTL_MS,
  });

  return token;
}

/**
 * Verify and consume an OAuth state token
 * @param token - The state token to verify
 * @returns true if valid, false otherwise
 */
export function verifyAndConsumeStateToken(token: string): boolean {
  const record = stateStore.get(token);

  if (!record) {
    return false;
  }

  // Check if expired
  if (Date.now() > record.expiresAt) {
    stateStore.delete(token);
    return false;
  }

  // Consume the token (one-time use)
  stateStore.delete(token);
  return true;
}

/**
 * Clean up expired state tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [token, record] of stateStore.entries()) {
    if (now > record.expiresAt) {
      stateStore.delete(token);
    }
  }
}

// Start periodic cleanup
setInterval(cleanupExpiredTokens, CLEANUP_INTERVAL_MS);

/**
 * Get current state store size (for monitoring)
 */
export function getStateStoreSize(): number {
  return stateStore.size;
}

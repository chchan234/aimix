/**
 * Admin Routes
 * Temporary admin endpoints
 */

import { Router } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/admin/add-credits
 * Add credits to a user
 */
router.post('/add-credits', async (req, res) => {
  try {
    const { providerId, amount } = req.body;

    if (!providerId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'providerId and amount are required'
      });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.providerId, providerId));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User with providerId ${providerId} not found`
      });
    }

    console.log(`Adding ${amount} credits to ${user.email} (${user.credits} -> ${user.credits + amount})`);

    // Update credits
    await db
      .update(users)
      .set({
        credits: sql`${users.credits} + ${amount}`,
        lifetimeCredits: sql`${users.lifetimeCredits} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.providerId, providerId));

    // Get updated user
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.providerId, providerId));

    res.json({
      success: true,
      user: {
        email: updatedUser.email,
        providerId: updatedUser.providerId,
        previousCredits: user.credits,
        newCredits: updatedUser.credits,
        lifetimeCredits: updatedUser.lifetimeCredits,
        added: amount
      }
    });

  } catch (error: any) {
    console.error('Add credits error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

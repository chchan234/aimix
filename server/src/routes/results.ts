/**
 * Results API Routes
 * Endpoints for managing user service results
 */

import express from 'express';
import { db } from '../db/index.js';
import { serviceResults, services } from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';
import { eq, and, desc } from 'drizzle-orm';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/results
 * Get all results for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const results = await db
      .select({
        id: serviceResults.id,
        serviceType: services.serviceType,
        serviceName: services.nameKo,
        category: services.category,
        inputData: serviceResults.inputData,
        resultData: serviceResults.resultData,
        resultFiles: serviceResults.resultFiles,
        creditCost: services.creditCost,
        createdAt: serviceResults.createdAt,
      })
      .from(serviceResults)
      .leftJoin(services, eq(serviceResults.serviceId, services.id))
      .where(eq(serviceResults.userId, userId))
      .orderBy(desc(serviceResults.createdAt));

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch results',
    });
  }
});

/**
 * GET /api/results/:id
 * Get a specific result by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const resultId = req.params.id;

    const result = await db
      .select({
        id: serviceResults.id,
        serviceType: services.serviceType,
        serviceName: services.nameKo,
        category: services.category,
        inputData: serviceResults.inputData,
        resultData: serviceResults.resultData,
        resultFiles: serviceResults.resultFiles,
        creditCost: services.creditCost,
        createdAt: serviceResults.createdAt,
      })
      .from(serviceResults)
      .leftJoin(services, eq(serviceResults.serviceId, services.id))
      .where(
        and(
          eq(serviceResults.id, resultId),
          eq(serviceResults.userId, userId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        error: 'Result not found',
      });
    }

    res.json({
      success: true,
      result: result[0],
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch result',
    });
  }
});

/**
 * DELETE /api/results/:id
 * Delete a specific result
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const resultId = req.params.id;

    const deleted = await db
      .delete(serviceResults)
      .where(
        and(
          eq(serviceResults.id, resultId),
          eq(serviceResults.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({
        error: 'Result not found',
      });
    }

    res.json({
      success: true,
      message: 'Result deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete result',
    });
  }
});

export default router;

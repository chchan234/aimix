/**
 * AI Service Routes
 *
 * API endpoints for AI-powered services using OpenAI and Gemini
 * Protected by authentication, rate limiting, and credit system
 */

import express from 'express';
import * as gemini from '../services/gemini.js';
import * as openai from '../services/openai.js';
import { authenticateToken, requireEmailVerification } from '../middleware/auth.js';
import { requireCredits, attachCreditInfo } from '../middleware/credits.js';
import { RateLimits } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validation.js';
import {
  nameAnalysisSchema,
  dreamInterpretationSchema,
  storySchema,
  chatSchema,
  faceReadingSchema,
  sajuSchema,
  tarotSchema,
  tojeongSchema,
} from '../validation/ai-schemas.js';
import { db } from '../db/index.js';
import { serviceResults, services } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Apply authentication, rate limiting, and email verification to all AI routes
router.use(authenticateToken);
router.use(requireEmailVerification); // Require email verification for email-provider users
router.use(RateLimits.AI);
router.use(attachCreditInfo);

/**
 * POST /api/ai/name-analysis
 * Analyze name meaning using Gemini
 *
 * Body: { name: string, birthDate?: string }
 * Cost: 10 credits
 */
router.post('/name-analysis', validateBody(nameAnalysisSchema), requireCredits('name-analysis'), async (req, res) => {
  try {
    const { name, birthDate } = req.body;

    const result = await gemini.analyzeNameMeaning(name, birthDate);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: ('error' in result && result.error) || 'Failed to analyze name'
      });
    }
  } catch (error) {
    console.error('Name analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/dream-interpretation
 * Interpret dream using Gemini
 *
 * Body: { dream: string }
 * Cost: 15 credits
 */
router.post('/dream-interpretation', validateBody(dreamInterpretationSchema), requireCredits('dream-interpretation'), async (req, res) => {
  try {
    const { dream } = req.body;

    const result = await gemini.interpretDream(dream);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: ('error' in result && result.error) || 'Failed to interpret dream'
      });
    }
  } catch (error) {
    console.error('Dream interpretation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/story
 * Generate creative story using Gemini
 *
 * Body: { theme: string, length?: 'short' | 'medium' | 'long' }
 * Cost: 20 credits
 */
router.post('/story', validateBody(storySchema), requireCredits('story'), async (req, res) => {
  try {
    const { theme, length = 'medium' } = req.body;

    const result = await gemini.generateStory(theme, length);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to generate story'
      });
    }
  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/chat
 * General AI chat endpoint
 *
 * Body: { message: string }
 * Cost: 5 credits
 */
router.post('/chat', validateBody(chatSchema), requireCredits('chat'), async (req, res) => {
  try {
    const { message } = req.body;

    const result = await gemini.generateText(message);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to generate response'
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/face-reading
 * Analyze face for fortune reading using OpenAI Vision
 *
 * Body: { imageUrl?: string, base64Image?: string, birthDate?: string }
 * Cost: 25 credits (Vision API is more expensive)
 */
router.post('/face-reading', validateBody(faceReadingSchema), requireCredits('face-reading'), async (req, res) => {
  try {
    const { imageUrl, base64Image, birthDate } = req.body;

    let result;
    if (base64Image) {
      result = await openai.analyzeFaceReadingFromBase64(base64Image, birthDate);
    } else {
      result = await openai.analyzeFaceReading(imageUrl, birthDate);
    }

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to analyze face'
      });
    }
  } catch (error) {
    console.error('Face reading error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/saju
 * Analyze Saju (사주팔자) using OpenAI GPT
 *
 * Body: { birthDate: string, birthTime: string, gender: 'male' | 'female' }
 * Cost: 25 credits
 */
router.post('/saju', validateBody(sajuSchema), requireCredits('saju'), async (req, res) => {
  try {
    const { birthDate, birthTime, gender } = req.body;
    const userId = req.user!.id;

    const result = await openai.analyzeSaju(birthDate, birthTime, gender);

    if (result.success) {
      // Get service ID
      const service = await db
        .select()
        .from(services)
        .where(eq(services.serviceType, 'saju'))
        .limit(1);

      if (service.length > 0) {
        // Save result to database
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiry

        await db.insert(serviceResults).values({
          userId,
          serviceId: service[0].id,
          inputData: { birthDate, birthTime, gender },
          resultData: result.analysis,
          aiModel: result.model,
          expiresAt,
        });
      }

      res.json(result);
    } else {
      res.status(500).json({
        error: ('error' in result && result.error) || 'Failed to analyze saju'
      });
    }
  } catch (error) {
    console.error('Saju analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/tarot
 * Read Tarot cards using OpenAI GPT
 *
 * Body: { question: string }
 * Cost: 20 credits
 */
router.post('/tarot', validateBody(tarotSchema), requireCredits('tarot'), async (req, res) => {
  try {
    const { question } = req.body;

    const result = await openai.readTarot(question);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: ('error' in result && result.error) || 'Failed to read tarot'
      });
    }
  } catch (error) {
    console.error('Tarot reading error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/tojeong
 * Predict fortune using Tojeong Bigyeol (토정비결) with OpenAI GPT
 *
 * Body: { birthDate: string }
 * Cost: 15 credits
 */
router.post('/tojeong', validateBody(tojeongSchema), requireCredits('tojeong'), async (req, res) => {
  try {
    const { birthDate } = req.body;

    const result = await openai.predictTojeong(birthDate);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: ('error' in result && result.error) || 'Failed to predict fortune'
      });
    }
  } catch (error) {
    console.error('Tojeong prediction error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

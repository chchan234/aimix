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
router.post('/name-analysis', requireCredits('name-analysis'), async (req, res) => {
  try {
    const { name, birthDate } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Name is required'
      });
    }

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
router.post('/dream-interpretation', requireCredits('dream-interpretation'), async (req, res) => {
  try {
    const { dream } = req.body;

    if (!dream) {
      return res.status(400).json({
        error: 'Dream description is required'
      });
    }

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
router.post('/story', requireCredits('story'), async (req, res) => {
  try {
    const { theme, length = 'medium' } = req.body;

    if (!theme) {
      return res.status(400).json({
        error: 'Story theme is required'
      });
    }

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
router.post('/chat', requireCredits('chat'), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

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
router.post('/face-reading', requireCredits('face-reading'), async (req, res) => {
  try {
    const { imageUrl, base64Image, birthDate } = req.body;

    if (!imageUrl && !base64Image) {
      return res.status(400).json({
        error: 'Either imageUrl or base64Image is required'
      });
    }

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

export default router;

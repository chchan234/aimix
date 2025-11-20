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
  storySchema,
  chatSchema,
  faceReadingSchema,
  sajuSchema,
  palmistrySchema,
  horoscopeSchema,
  zodiacSchema,
  loveCompatibilitySchema,
  nameCompatibilitySchema,
  marriageCompatibilitySchema,
} from '../validation/ai-schemas.js';
// Note: Database result saving is temporarily disabled due to schema mismatch
// import { db } from '../db/index.js';
// import { serviceResults, services } from '../db/schema.js';
// import { eq } from 'drizzle-orm';

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

    const result = await openai.analyzeSaju(birthDate, birthTime, gender);

    if (result.success) {
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
 * POST /api/ai/deep-saju-2026
 * Deep Saju Analysis for 2026 (심층 신년운세) using OpenAI GPT
 *
 * Body: { birthDate: string, birthTime: string, gender: 'male' | 'female' }
 * Cost: 50 credits
 */
router.post('/deep-saju-2026', validateBody(sajuSchema), requireCredits('deep-fortune-2025'), async (req, res) => {
  try {
    const { birthDate, birthTime, gender } = req.body;

    const result = await openai.analyzeDeepSaju2026(birthDate, birthTime, gender);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: ('error' in result && result.error) || 'Failed to analyze deep saju'
      });
    }
  } catch (error) {
    console.error('Deep Saju 2026 analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/palmistry
 * Analyze palmistry from hand image using OpenAI Vision
 *
 * Body: { imageUrl?: string, base64Image?: string, hand?: 'left' | 'right' }
 * Cost: 25 credits (Vision API)
 */
router.post('/palmistry', validateBody(palmistrySchema), requireCredits('palmistry'), async (req, res) => {
  try {
    const { imageUrl, base64Image, hand = 'right' } = req.body;

    const imageData = base64Image || imageUrl;
    const result = await openai.analyzePalmistry(imageData, hand);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to analyze palmistry'
      });
    }
  } catch (error) {
    console.error('Palmistry analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/horoscope
 * Analyze horoscope (별자리 운세) using OpenAI GPT
 *
 * Body: { birthDate: string, zodiacSign?: string }
 * Cost: 15 credits
 */
router.post('/horoscope', validateBody(horoscopeSchema), requireCredits('horoscope'), async (req, res) => {
  try {
    const { birthDate, zodiacSign } = req.body;

    const result = await openai.analyzeHoroscope(birthDate, zodiacSign);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to analyze horoscope'
      });
    }
  } catch (error) {
    console.error('Horoscope analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/zodiac
 * Analyze Chinese zodiac fortune (띠 운세) using OpenAI GPT
 *
 * Body: { birthDate: string }
 * Cost: 15 credits
 */
router.post('/zodiac', validateBody(zodiacSchema), requireCredits('zodiac'), async (req, res) => {
  try {
    const { birthDate } = req.body;

    const result = await openai.analyzeZodiac(birthDate);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to analyze zodiac'
      });
    }
  } catch (error) {
    console.error('Zodiac analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/love-compatibility
 * Analyze love compatibility (연애궁합) using OpenAI GPT
 *
 * Body: { person1BirthDate: string, person2BirthDate: string }
 * Cost: 20 credits
 */
router.post('/love-compatibility', validateBody(loveCompatibilitySchema), requireCredits('love-compatibility'), async (req, res) => {
  try {
    const { person1BirthDate, person2BirthDate } = req.body;

    const result = await openai.analyzeLoveCompatibility(person1BirthDate, person2BirthDate);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to analyze love compatibility'
      });
    }
  } catch (error) {
    console.error('Love compatibility analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/name-compatibility
 * Analyze name compatibility (이름궁합) using OpenAI GPT
 *
 * Body: { name1: string, name2: string }
 * Cost: 15 credits
 */
router.post('/name-compatibility', validateBody(nameCompatibilitySchema), requireCredits('name-compatibility'), async (req, res) => {
  try {
    const { name1, name2 } = req.body;

    const result = await openai.analyzeNameCompatibility(name1, name2);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to analyze name compatibility'
      });
    }
  } catch (error) {
    console.error('Name compatibility analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/marriage-compatibility
 * Analyze marriage compatibility (결혼궁합) using OpenAI GPT
 *
 * Body: { person1Name: string, person1BirthDate: string, person2Name: string, person2BirthDate: string }
 * Cost: 25 credits
 */
router.post('/marriage-compatibility', validateBody(marriageCompatibilitySchema), requireCredits('marriage-compatibility'), async (req, res) => {
  try {
    const { person1Name, person1BirthDate, person2Name, person2BirthDate } = req.body;

    const result = await openai.analyzeMarriageCompatibility(person1Name, person1BirthDate, person2Name, person2BirthDate);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: result.error || 'Failed to analyze marriage compatibility'
      });
    }
  } catch (error) {
    console.error('Marriage compatibility analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

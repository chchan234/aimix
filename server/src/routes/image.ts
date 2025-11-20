/**
 * Image Generation/Editing API Routes
 * Handles all image service endpoints using Gemini
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireCredits, attachCreditInfo, refundCredits, CREDIT_COSTS } from '../middleware/credits.js';
import { validateBody } from '../middleware/validation.js';
import {
  profileGeneratorSchema,
  caricatureSchema,
  idPhotoSchema,
  ageTransformSchema,
  genderSwapSchema,
  colorizationSchema,
  backgroundRemovalSchema,
  hairstyleSchema,
  tattooSchema,
  lookalikeSchema,
  petSoulmateSchema,
  babyFaceSchema,
  personalColorSchema,
  professionalHeadshotSchema,
} from '../validation/ai-schemas.js';
import * as gemini from '../services/gemini.js';

const router = Router();

// Apply auth and credit middleware to all routes
router.use(authenticateToken);
router.use(attachCreditInfo);

// 1. Profile Generator
router.post('/profile-generator', validateBody(profileGeneratorSchema), requireCredits('profile-generator'), async (req, res) => {
  try {
    const { description, style = 'professional' } = req.body;

    const result = await gemini.generateProfile(description, style);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate profile image'
      });
    }
  } catch (error) {
    console.error('Profile generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 2. Caricature
router.post('/caricature', validateBody(caricatureSchema), requireCredits('caricature'), async (req, res) => {
  try {
    const { imageUrl, base64Image, exaggerationLevel = 'medium' } = req.body;

    const imageData = base64Image || imageUrl;
    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.generateCaricature(imageBase64, exaggerationLevel);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate caricature'
      });
    }
  } catch (error) {
    console.error('Caricature generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 3. ID Photo
router.post('/id-photo', validateBody(idPhotoSchema), requireCredits('id-photo'), async (req, res) => {
  try {
    const { imageUrl, base64Image, backgroundColor = 'white' } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.generateIdPhoto(imageBase64, backgroundColor);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate ID photo'
      });
    }
  } catch (error) {
    console.error('ID photo generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 4. Age Transform
router.post('/age-transform', validateBody(ageTransformSchema), requireCredits('age-transform'), async (req, res) => {
  try {
    const { imageUrl, base64Image, targetAge } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.transformAge(imageBase64, targetAge);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to transform age'
      });
    }
  } catch (error) {
    console.error('Age transform error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 6. Gender Swap
router.post('/gender-swap', validateBody(genderSwapSchema), requireCredits('gender-swap'), async (req, res) => {
  try {
    const { imageUrl, base64Image } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.swapGender(imageBase64);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to swap gender'
      });
    }
  } catch (error) {
    console.error('Gender swap error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 7. Colorization
router.post('/colorization', validateBody(colorizationSchema), requireCredits('colorization'), async (req, res) => {
  try {
    const { imageUrl, base64Image } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.colorizePhoto(imageBase64);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to colorize photo'
      });
    }
  } catch (error) {
    console.error('Colorization error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 8. Background Removal
router.post('/background-removal', validateBody(backgroundRemovalSchema), requireCredits('background-removal'), async (req, res) => {
  try {
    const { imageUrl, base64Image, newBackground = 'transparent' } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.removeBackground(imageBase64, newBackground);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to remove background'
      });
    }
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 9. Hairstyle
router.post('/hairstyle', validateBody(hairstyleSchema), requireCredits('hairstyle'), async (req, res) => {
  try {
    const { imageUrl, base64Image, hairstyleDescription } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.changeHairstyle(imageBase64, hairstyleDescription);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to change hairstyle'
      });
    }
  } catch (error) {
    console.error('Hairstyle change error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 10. Tattoo
router.post('/tattoo', validateBody(tattooSchema), requireCredits('tattoo'), async (req, res) => {
  try {
    const { imageUrl, base64Image, tattooDescription, placement } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.addTattoo(imageBase64, tattooDescription, placement);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to add tattoo'
      });
    }
  } catch (error) {
    console.error('Tattoo simulation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 11. Lookalike Finder - 닮은꼴 찾기
router.post('/lookalike', validateBody(lookalikeSchema), requireCredits('lookalike'), async (req, res) => {
  try {
    const { imageUrl, base64Image, category } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.findLookalike(imageBase64, category);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        category: result.category,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to find lookalike'
      });
    }
  } catch (error) {
    console.error('Lookalike finder error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 12. Pet Soulmate - AI 반려동물 소울메이트
router.post('/pet-soulmate', validateBody(petSoulmateSchema), requireCredits('pet-soulmate'), async (req, res) => {
  try {
    const { imageUrl, base64Image } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.analyzePetSoulmate(imageBase64);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze pet'
      });
    }
  } catch (error) {
    console.error('Pet soulmate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 13. Baby Face Prediction - 2세 얼굴 예측
router.post('/baby-face', validateBody(babyFaceSchema), requireCredits('baby-face'), async (req, res) => {
  try {
    const { parent1Image, parent2Image, style } = req.body;

    // Handle both data URL format and raw base64
    const parent1Base64 = parent1Image.includes(',') ? parent1Image.split(',')[1] : parent1Image;
    const parent2Base64 = parent2Image.includes(',') ? parent2Image.split(',')[1] : parent2Image;

    if (!parent1Base64 || !parent2Base64) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image data format'
      });
    }

    const result = await gemini.generateBabyFace(parent1Base64, parent2Base64, style);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate baby face'
      });
    }
  } catch (error) {
    console.error('Baby face generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 14. Professional Headshot - AI 프로페셔널 헤드샷
router.post('/professional-headshot', validateBody(professionalHeadshotSchema), requireCredits('professional-headshot'), async (req, res) => {
  try {
    const { imageUrl, base64Image, style } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.generateProfessionalHeadshot(imageBase64, style);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate professional headshot'
      });
    }
  } catch (error) {
    console.error('Professional headshot error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 15. Personal Color Analysis - 퍼스널 컬러 진단
router.post('/personal-color', validateBody(personalColorSchema), requireCredits('personal-color'), async (req, res) => {
  try {
    const { imageUrl, base64Image } = req.body;

    const imageBase64 = base64Image ? base64Image.split(',')[1] : imageUrl;

    const result = await gemini.analyzePersonalColor(imageBase64);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze personal color'
      });
    }
  } catch (error) {
    console.error('Personal color analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 16. Generate Result Card - 결과물 카드 이미지 생성
router.post('/generate-result-card', async (req, res) => {
  try {
    const { prompt, creditsRequired = 1 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Deduct credits first
    const db = req.app.get('db');
    const userResult = await db.query('SELECT credits FROM users WHERE id = $1', [userId]);

    if (!userResult.rows[0] || userResult.rows[0].credits < creditsRequired) {
      return res.status(400).json({
        success: false,
        error: '크레딧이 부족합니다.'
      });
    }

    await db.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [creditsRequired, userId]);

    // Generate image using Gemini
    const result = await gemini.generateResultCard(prompt);

    if (result.success) {
      res.json({
        success: true,
        imageUrl: result.imageData,
        model: result.model,
      });
    } else {
      // Refund credits on failure
      await db.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [creditsRequired, userId]);

      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate result card'
      });
    }
  } catch (error) {
    console.error('Result card generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

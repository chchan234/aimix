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

export default router;

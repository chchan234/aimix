/**
 * Health Service API Routes
 * Handles body analysis, skin analysis, and BMI calculator
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireCredits, attachCreditInfo } from '../middleware/credits.js';
import { validateBody } from '../middleware/validation.js';
import {
  bodyAnalysisSchema,
  skinAnalysisSchema,
  bmiCalculatorSchema,
} from '../validation/ai-schemas.js';
import * as gemini from '../services/gemini.js';

const router = Router();

// Apply auth and credit middleware to all routes
router.use(authenticateToken);
router.use(attachCreditInfo);

// Body Type Analysis
router.post('/body-analysis', validateBody(bodyAnalysisSchema), requireCredits('body-analysis'), async (req, res) => {
  try {
    const { base64Image } = req.body;
    const imageBase64 = base64Image.split(',')[1] || base64Image;

    const result = await gemini.analyzeBodyType(imageBase64);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze body type'
      });
    }
  } catch (error) {
    console.error('Body analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Skin Analysis
router.post('/skin-analysis', validateBody(skinAnalysisSchema), requireCredits('skin-analysis'), async (req, res) => {
  try {
    const { base64Image } = req.body;
    const imageBase64 = base64Image.split(',')[1] || base64Image;

    const result = await gemini.analyzeSkin(imageBase64);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze skin'
      });
    }
  } catch (error) {
    console.error('Skin analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// BMI Calculator
router.post('/bmi-calculator', validateBody(bmiCalculatorSchema), requireCredits('bmi-calculator'), async (req, res) => {
  try {
    const { height, weight, age, gender } = req.body;

    const result = await gemini.calculateBMI(height, weight, age, gender);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to calculate BMI'
      });
    }
  } catch (error) {
    console.error('BMI calculation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

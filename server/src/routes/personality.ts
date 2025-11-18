/**
 * Personality Test Routes
 * Handles MBTI analysis and Enneagram test
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireCredits } from '../middleware/credits.js';
import { validateBody } from '../middleware/validation.js';
import {
  mbtiAnalysisSchema,
  enneagramTestSchema,
} from '../validation/personality-schemas.js';
import { analyzeMBTI, analyzeEnneagram } from '../services/openai.js';
import { mbtiQuestions } from '../data/mbti-questions.js';
import { enneagramQuestions } from '../data/enneagram-questions.js';

const router = Router();

// Get MBTI questions
router.get('/mbti/questions', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      questions: mbtiQuestions.map(q => ({
        id: q.id,
        question: q.question,
      }))
    });
  } catch (error) {
    console.error('Get MBTI questions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Enneagram questions
router.get('/enneagram/questions', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      questions: enneagramQuestions.map(q => ({
        id: q.id,
        question: q.question,
      }))
    });
  } catch (error) {
    console.error('Get Enneagram questions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MBTI Analysis
router.post('/mbti-analysis', validateBody(mbtiAnalysisSchema), requireCredits('mbti-analysis'), async (req, res) => {
  try {
    const { userInputMBTI, answers } = req.body;

    console.log('🧠 MBTI Analysis started');
    console.log('User input MBTI:', userInputMBTI || 'None');
    console.log('Answers count:', answers.length);

    const result = await analyzeMBTI(userInputMBTI, answers);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        testResultMBTI: result.testResultMBTI,
        axisScores: result.axisScores,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze MBTI'
      });
    }
  } catch (error) {
    console.error('MBTI analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enneagram Test
router.post('/enneagram-test', validateBody(enneagramTestSchema), requireCredits('enneagram-test'), async (req, res) => {
  try {
    const { answers } = req.body;

    console.log('🔢 Enneagram Test started');
    console.log('Answers count:', answers.length);

    const result = await analyzeEnneagram(answers);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        mainType: result.mainType,
        wingType: result.wingType,
        typeScores: result.typeScores,
        model: result.model,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze Enneagram'
      });
    }
  } catch (error) {
    console.error('Enneagram test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

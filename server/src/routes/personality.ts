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
  bigFiveTestSchema,
  stressTestSchema,
  geumjjokiTestSchema,
} from '../validation/personality-schemas.js';
import { analyzeMBTI, analyzeEnneagram, analyzeBigFive, analyzeStress, analyzeGeumjjoki } from '../services/openai.js';
import { mbtiQuestions } from '../data/mbti-questions.js';
import { enneagramQuestions } from '../data/enneagram-questions.js';
import { bigFiveQuestions } from '../data/bigfive-questions.js';
import { stressQuestions } from '../data/stress-questions.js';
import { geumjjokiQuestions } from '../data/geumjjoki-questions.js';

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
router.post('/mbti-analysis', authenticateToken, validateBody(mbtiAnalysisSchema), requireCredits('mbti-analysis'), async (req, res) => {
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
        credits: {
          remaining: req.userData?.credits,
          cost: res.locals.creditInfo?.cost,
        },
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
router.post('/enneagram-test', authenticateToken, validateBody(enneagramTestSchema), requireCredits('enneagram-test'), async (req, res) => {
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
        credits: {
          remaining: req.userData?.credits,
          cost: res.locals.creditInfo?.cost,
        },
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

// Get Big Five questions
router.get('/bigfive/questions', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      questions: bigFiveQuestions.map(q => ({
        id: q.id,
        question: q.question,
      }))
    });
  } catch (error) {
    console.error('Get Big Five questions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Big Five Test
router.post('/bigfive-test', authenticateToken, validateBody(bigFiveTestSchema), requireCredits('bigfive-test'), async (req, res) => {
  try {
    const { answers } = req.body;

    console.log('🧠 Big Five Test started');
    console.log('Answers count:', answers.length);

    const result = await analyzeBigFive(answers);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        traitScores: result.traitScores,
        model: result.model,
        credits: {
          remaining: req.userData?.credits,
          cost: res.locals.creditInfo?.cost,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze Big Five'
      });
    }
  } catch (error) {
    console.error('Big Five test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Stress questions
router.get('/stress/questions', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      questions: stressQuestions.map(q => ({
        id: q.id,
        question: q.question,
      }))
    });
  } catch (error) {
    console.error('Get Stress questions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stress Test
router.post('/stress-test', authenticateToken, validateBody(stressTestSchema), requireCredits('stress-test'), async (req, res) => {
  try {
    const { answers } = req.body;

    console.log('😰 Stress Test started');
    console.log('Answers count:', answers.length);

    const result = await analyzeStress(answers);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        overallStressLevel: result.overallStressLevel,
        categoryScores: result.categoryScores,
        model: result.model,
        credits: {
          remaining: req.userData?.credits,
          cost: res.locals.creditInfo?.cost,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze stress'
      });
    }
  } catch (error) {
    console.error('Stress test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Geumjjoki questions
router.get('/geumjjoki/questions', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      questions: geumjjokiQuestions.map(q => ({
        id: q.id,
        question: q.question,
      }))
    });
  } catch (error) {
    console.error('Get Geumjjoki questions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Geumjjoki Test
router.post('/geumjjoki-test', authenticateToken, validateBody(geumjjokiTestSchema), requireCredits('geumjjoki-test'), async (req, res) => {
  try {
    const { answers } = req.body;

    console.log('🔥 Geumjjoki Test started');
    console.log('Answers count:', answers.length);

    const result = await analyzeGeumjjoki(answers);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        geumjjokiScore: result.geumjjokiScore,
        grade: result.grade,
        categoryScores: result.categoryScores,
        model: result.model,
        credits: {
          remaining: req.userData?.credits,
          cost: res.locals.creditInfo?.cost,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze geumjjoki'
      });
    }
  } catch (error) {
    console.error('Geumjjoki test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

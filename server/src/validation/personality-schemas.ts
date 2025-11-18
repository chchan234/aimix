/**
 * Zod validation schemas for Personality Test endpoints
 */

import { z } from 'zod';

// MBTI Analysis Schema
export const mbtiAnalysisSchema = z.object({
  userInputMBTI: z.string()
    .regex(/^[EI][SN][TF][JP]$/, 'Invalid MBTI format (e.g., INTJ)')
    .optional()
    .nullable(),
  answers: z.array(z.number().int().min(1).max(5))
    .length(28, 'Must have exactly 28 answers'),
});

// Enneagram Test Schema
export const enneagramTestSchema = z.object({
  answers: z.array(z.number().int().min(1).max(5))
    .length(36, 'Must have exactly 36 answers'),
});

// Big Five Test Schema
export const bigFiveTestSchema = z.object({
  answers: z.array(z.number().int().min(1).max(5))
    .length(25, 'Must have exactly 25 answers'),
});

// Stress Test Schema
export const stressTestSchema = z.object({
  answers: z.array(z.number().int().min(1).max(5))
    .length(20, 'Must have exactly 20 answers'),
});

// Type exports
export type MBTIAnalysisInput = z.infer<typeof mbtiAnalysisSchema>;
export type EnneagramTestInput = z.infer<typeof enneagramTestSchema>;
export type BigFiveTestInput = z.infer<typeof bigFiveTestSchema>;
export type StressTestInput = z.infer<typeof stressTestSchema>;

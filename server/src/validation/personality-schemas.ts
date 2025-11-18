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

// Type exports
export type MBTIAnalysisInput = z.infer<typeof mbtiAnalysisSchema>;
export type EnneagramTestInput = z.infer<typeof enneagramTestSchema>;

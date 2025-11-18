/**
 * Zod validation schemas for AI endpoints
 * Prevents prompt injection and validates input data
 */

import { z } from 'zod';

// Security: Max lengths to prevent abuse
const MAX_TEXT_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;
const MAX_QUESTION_LENGTH = 1000;
const MAX_THEME_LENGTH = 500;

// Security: Prevent prompt injection patterns
const DANGEROUS_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /disregard\s+all\s+prior\s+commands/i,
  /forget\s+everything/i,
  /system\s*:/i,
  /assistant\s*:/i,
  /<\s*script/i,
  /javascript\s*:/i,
];

function validateNoDangerousPatterns(value: string): boolean {
  return !DANGEROUS_PATTERNS.some(pattern => pattern.test(value));
}

// Date validation helper
const dateString = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed < new Date();
  }, 'Invalid date or future date');

// Time validation helper (HH:MM format)
const timeString = z.string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format (24-hour)');

// Base64 image validation
const base64Image = z.string()
  .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/, 'Must be valid base64 image')
  .refine((data) => {
    // Check if base64 is not too large (max 10MB)
    const base64Data = data.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    return sizeInBytes < 10 * 1024 * 1024;
  }, 'Image size must be less than 10MB');

// URL validation
const imageUrl = z.string()
  .url('Must be valid URL')
  .regex(/\.(jpg|jpeg|png|webp)$/i, 'Must be image URL (jpg, jpeg, png, webp)');

// Name Analysis Schema
export const nameAnalysisSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
  birthDate: dateString.optional(),
});

// Dream Interpretation Schema
export const dreamInterpretationSchema = z.object({
  dream: z.string()
    .min(10, 'Dream description must be at least 10 characters')
    .max(MAX_TEXT_LENGTH, `Dream description must be less than ${MAX_TEXT_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
});

// Story Generation Schema
export const storySchema = z.object({
  theme: z.string()
    .min(3, 'Theme must be at least 3 characters')
    .max(MAX_THEME_LENGTH, `Theme must be less than ${MAX_THEME_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
});

// Chat Schema
export const chatSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(MAX_TEXT_LENGTH, `Message must be less than ${MAX_TEXT_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
});

// Face Reading Schema
export const faceReadingSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  birthDate: dateString.optional(),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Saju Analysis Schema
export const sajuSchema = z.object({
  birthDate: dateString,
  birthTime: timeString,
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be either "male" or "female"' })
  }),
});

// Tarot Reading Schema
export const tarotSchema = z.object({
  question: z.string()
    .min(5, 'Question must be at least 5 characters')
    .max(MAX_QUESTION_LENGTH, `Question must be less than ${MAX_QUESTION_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
});

// Tojeong Prediction Schema
export const tojeongSchema = z.object({
  birthDate: dateString,
});

// Type exports for use in route handlers
export type NameAnalysisInput = z.infer<typeof nameAnalysisSchema>;
export type DreamInterpretationInput = z.infer<typeof dreamInterpretationSchema>;
export type StoryInput = z.infer<typeof storySchema>;
export type ChatInput = z.infer<typeof chatSchema>;
export type FaceReadingInput = z.infer<typeof faceReadingSchema>;
export type SajuInput = z.infer<typeof sajuSchema>;
export type TarotInput = z.infer<typeof tarotSchema>;
export type TojeongInput = z.infer<typeof tojeongSchema>;

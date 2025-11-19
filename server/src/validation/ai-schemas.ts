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

// Palmistry Analysis Schema
export const palmistrySchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  hand: z.enum(['left', 'right']).default('right'),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Horoscope Schema
export const horoscopeSchema = z.object({
  birthDate: dateString,
  zodiacSign: z.enum(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']).optional(),
});

// Zodiac Schema (12띠)
export const zodiacSchema = z.object({
  birthDate: dateString,
});

// Love Compatibility Schema
export const loveCompatibilitySchema = z.object({
  person1BirthDate: dateString,
  person2BirthDate: dateString,
});

// Name Compatibility Schema
export const nameCompatibilitySchema = z.object({
  name1: z.string()
    .min(1, 'Name 1 is required')
    .max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
  name2: z.string()
    .min(1, 'Name 2 is required')
    .max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
});

// Marriage Compatibility Schema
export const marriageCompatibilitySchema = z.object({
  person1Name: z.string()
    .min(1, 'Person 1 name is required')
    .max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
  person1BirthDate: dateString,
  person2Name: z.string()
    .min(1, 'Person 2 name is required')
    .max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
  person2BirthDate: dateString,
});

// Image Generation/Editing Schemas

// Profile Generator Schema
export const profileGeneratorSchema = z.object({
  description: z.string()
    .min(3, 'Description must be at least 3 characters')
    .max(MAX_TEXT_LENGTH, `Description must be less than ${MAX_TEXT_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
  style: z.enum(['professional', 'casual', 'artistic']).default('professional'),
});

// Caricature Schema
export const caricatureSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  exaggerationLevel: z.enum(['low', 'medium', 'high']).default('medium'),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// ID Photo Schema
export const idPhotoSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  backgroundColor: z.enum(['white', 'blue', 'gray']).default('white'),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Age Transform Schema
export const ageTransformSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  targetAge: z.number()
    .min(1, 'Age must be at least 1')
    .max(120, 'Age must be less than 120'),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Gender Swap Schema
export const genderSwapSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Colorization Schema
export const colorizationSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Background Removal Schema
export const backgroundRemovalSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  newBackground: z.string()
    .max(MAX_TEXT_LENGTH, `Background description must be less than ${MAX_TEXT_LENGTH} characters`)
    .default('transparent')
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Hairstyle Schema
export const hairstyleSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  hairstyleDescription: z.string()
    .min(1, 'Hairstyle description is required')
    .max(MAX_TEXT_LENGTH, `Hairstyle description must be less than ${MAX_TEXT_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Tattoo Schema
export const tattooSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  tattooDescription: z.string()
    .min(1, 'Tattoo description is required')
    .max(MAX_TEXT_LENGTH, `Tattoo description must be less than ${MAX_TEXT_LENGTH} characters`)
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
  placement: z.string()
    .min(1, 'Placement is required')
    .max(100, 'Placement must be less than 100 characters')
    .refine(validateNoDangerousPatterns, 'Invalid characters detected'),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

// Type exports for use in route handlers
export type NameAnalysisInput = z.infer<typeof nameAnalysisSchema>;
export type StoryInput = z.infer<typeof storySchema>;
export type ChatInput = z.infer<typeof chatSchema>;
export type FaceReadingInput = z.infer<typeof faceReadingSchema>;
export type SajuInput = z.infer<typeof sajuSchema>;
export type PalmistryInput = z.infer<typeof palmistrySchema>;
export type HoroscopeInput = z.infer<typeof horoscopeSchema>;
export type ZodiacInput = z.infer<typeof zodiacSchema>;
export type LoveCompatibilityInput = z.infer<typeof loveCompatibilitySchema>;
export type NameCompatibilityInput = z.infer<typeof nameCompatibilitySchema>;
export type MarriageCompatibilityInput = z.infer<typeof marriageCompatibilitySchema>;

// Image service types
export type ProfileGeneratorInput = z.infer<typeof profileGeneratorSchema>;
export type CaricatureInput = z.infer<typeof caricatureSchema>;
export type IdPhotoInput = z.infer<typeof idPhotoSchema>;
export type AgeTransformInput = z.infer<typeof ageTransformSchema>;
export type GenderSwapInput = z.infer<typeof genderSwapSchema>;
export type ColorizationInput = z.infer<typeof colorizationSchema>;
export type BackgroundRemovalInput = z.infer<typeof backgroundRemovalSchema>;
export type HairstyleInput = z.infer<typeof hairstyleSchema>;
export type TattooInput = z.infer<typeof tattooSchema>;

// Lookalike Schema
export const lookalikeSchema = z.object({
  imageUrl: imageUrl.optional(),
  base64Image: base64Image.optional(),
  category: z.enum(['celebrity', 'anime', 'animal'], {
    errorMap: () => ({ message: 'Category must be celebrity, anime, or animal' })
  }),
}).refine(
  (data) => data.imageUrl || data.base64Image,
  'Either imageUrl or base64Image is required'
);

export type LookalikeInput = z.infer<typeof lookalikeSchema>;

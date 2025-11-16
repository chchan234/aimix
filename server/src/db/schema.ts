import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, decimal, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ================================
// Users Table
// ================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).unique(),
  provider: varchar('provider', { length: 20 }).notNull().default('email'), // 'email', 'kakao', 'google'
  providerId: varchar('provider_id', { length: 255 }),
  profileImageUrl: text('profile_image_url'),

  // Credits
  credits: integer('credits').notNull().default(0),
  lifetimeCredits: integer('lifetime_credits').notNull().default(0),

  // Subscription
  subscriptionTier: varchar('subscription_tier', { length: 20 }), // 'basic', 'premium', 'pro'
  subscriptionEndDate: timestamp('subscription_end_date'),

  // Meta
  locale: varchar('locale', { length: 10 }).notNull().default('ko'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('idx_email').on(table.email),
  providerIdx: index('idx_provider').on(table.provider, table.providerId),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// ================================
// ⭐ Prompt Templates Table (핵심)
// ================================
export const promptTemplates = pgTable('prompt_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceType: varchar('service_type', { length: 100 }).notNull(),
  aiModel: varchar('ai_model', { length: 30 }).notNull(), // 'gpt-4o-mini', 'gemini-2.5-flash-image'
  version: varchar('version', { length: 10 }).notNull(),

  // Prompts
  systemPrompt: text('system_prompt'),
  userPromptTemplate: text('user_prompt_template').notNull(),

  // Parameters
  parameters: jsonb('parameters').notNull().default({}),

  // Output
  outputFormat: varchar('output_format', { length: 20 }).notNull(), // 'json', 'text', 'markdown', 'image'
  validationSchema: jsonb('validation_schema'),

  // Meta
  description: text('description'),
  author: varchar('author', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),

  // Performance tracking
  avgTokens: integer('avg_tokens'),
  avgResponseTime: integer('avg_response_time'), // ms
  usageCount: integer('usage_count').notNull().default(0),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueServiceVersion: uniqueIndex('unique_service_version').on(table.serviceType, table.version),
  serviceActiveIdx: index('idx_service_active').on(table.serviceType, table.isActive),
}));

export const insertPromptTemplateSchema = createInsertSchema(promptTemplates);
export const selectPromptTemplateSchema = createSelectSchema(promptTemplates);

// ================================
// ⭐ Prompt Experiments (A/B Testing)
// ================================
export const promptExperiments = pgTable('prompt_experiments', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceType: varchar('service_type', { length: 100 }).notNull(),

  templateAId: uuid('template_a_id').references(() => promptTemplates.id),
  templateBId: uuid('template_b_id').references(() => promptTemplates.id),

  trafficSplit: integer('traffic_split').notNull().default(50), // A/B ratio
  status: varchar('status', { length: 20 }).notNull().default('running'), // 'running', 'completed', 'cancelled'

  // Results
  versionACount: integer('version_a_count').notNull().default(0),
  versionBCount: integer('version_b_count').notNull().default(0),
  versionAAvgRating: decimal('version_a_avg_rating', { precision: 3, scale: 2 }),
  versionBAvgRating: decimal('version_b_avg_rating', { precision: 3, scale: 2 }),

  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  winner: varchar('winner', { length: 10 }), // 'A', 'B', 'tie'
});

export const insertPromptExperimentSchema = createInsertSchema(promptExperiments);
export const selectPromptExperimentSchema = createSelectSchema(promptExperiments);

// ================================
// Services Table
// ================================
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 50 }).notNull(), // 'fortune', 'image', 'entertainment', 'utility'
  serviceType: varchar('service_type', { length: 100 }).notNull(),

  nameKo: varchar('name_ko', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  descriptionKo: text('description_ko'),
  descriptionEn: text('description_en'),

  creditCost: integer('credit_cost').notNull(),
  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueCategoryService: uniqueIndex('unique_category_service').on(table.category, table.serviceType),
}));

export const insertServiceSchema = createInsertSchema(services);
export const selectServiceSchema = createSelectSchema(services);

// ================================
// Service Results Table
// ================================
export const serviceResults = pgTable('service_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').references(() => services.id),

  // Input
  inputData: jsonb('input_data'),
  inputFiles: text('input_files').array(),

  // Result
  resultData: jsonb('result_data'),
  resultFiles: text('result_files').array(),

  // AI Info
  aiModel: varchar('ai_model', { length: 50 }),
  promptTemplateId: uuid('prompt_template_id').references(() => promptTemplates.id),
  tokensUsed: integer('tokens_used'),
  processingTime: integer('processing_time'), // ms

  // Sharing
  isPublic: boolean('is_public').notNull().default(false),
  shareToken: varchar('share_token', { length: 100 }).unique(),

  // Expiry (12 months)
  expiresAt: timestamp('expires_at').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userServiceIdx: index('idx_user_service').on(table.userId, table.serviceId),
  shareTokenIdx: index('idx_share_token').on(table.shareToken),
}));

export const insertServiceResultSchema = createInsertSchema(serviceResults);
export const selectServiceResultSchema = createSelectSchema(serviceResults);

// ================================
// Transactions Table
// ================================
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

  type: varchar('type', { length: 20 }).notNull(), // 'charge', 'use', 'refund'
  creditAmount: integer('credit_amount').notNull(),
  creditBalanceAfter: integer('credit_balance_after').notNull(),

  // Payment info
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentId: varchar('payment_id', { length: 100 }).unique(),
  actualAmount: integer('actual_amount'), // KRW

  // Service usage
  serviceId: uuid('service_id').references(() => services.id),
  resultId: uuid('result_id').references(() => serviceResults.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userCreatedIdx: index('idx_user_created').on(table.userId, table.createdAt),
}));

export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);

// ================================
// Type exports
// ================================
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertPromptTemplate = typeof promptTemplates.$inferInsert;

export type PromptExperiment = typeof promptExperiments.$inferSelect;
export type InsertPromptExperiment = typeof promptExperiments.$inferInsert;

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

export type ServiceResult = typeof serviceResults.$inferSelect;
export type InsertServiceResult = typeof serviceResults.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

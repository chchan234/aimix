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
  password: varchar('password', { length: 255 }), // Hashed password for email provider
  provider: varchar('provider', { length: 20 }).notNull().default('email'), // 'email', 'kakao', 'google'
  providerId: varchar('provider_id', { length: 255 }),
  profileImageUrl: text('profile_image_url'),

  // Credits
  credits: integer('credits').notNull().default(0),
  lifetimeCredits: integer('lifetime_credits').notNull().default(0),

  // Subscription
  subscriptionTier: varchar('subscription_tier', { length: 20 }), // 'basic', 'premium', 'pro'
  subscriptionEndDate: timestamp('subscription_end_date'),

  // Role
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'user', 'admin'

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
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serviceType: varchar('service_type', { length: 100 }).notNull(),

  inputData: jsonb('input_data').notNull(),
  inputImageUrl: text('input_image_url'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  resultId: uuid('result_id'),

  creditCost: integer('credit_cost').notNull(),
  processingTime: integer('processing_time'), // in milliseconds

  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

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
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  type: varchar('type', { length: 20 }).notNull(), // 'charge', 'use', 'refund'
  amount: integer('amount').notNull(),
  creditsBefore: integer('credits_before').notNull(),
  creditsAfter: integer('credits_after').notNull(),

  // Reference info
  referenceId: varchar('reference_id', { length: 200 }),
  referenceType: varchar('reference_type', { length: 50 }),
  description: text('description'),
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userCreatedIdx: index('idx_user_created').on(table.userId, table.createdAt),
}));

export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);

// ================================
// Payments Table (Toss Payments)
// ================================
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  transactionId: uuid('transaction_id').references(() => transactions.id),

  // Toss Payments Info
  paymentKey: varchar('payment_key', { length: 200 }).notNull().unique(),
  orderId: varchar('order_id', { length: 100 }).notNull().unique(),
  orderName: varchar('order_name', { length: 200 }).notNull(),

  // Payment Details
  method: varchar('method', { length: 50 }).notNull(), // 'card', 'virtualAccount', 'transfer', 'mobilePhone', 'giftCertificate', 'easyPay'
  totalAmount: integer('total_amount').notNull(),
  balanceAmount: integer('balance_amount').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // 'READY', 'IN_PROGRESS', 'WAITING_FOR_DEPOSIT', 'DONE', 'CANCELED', 'PARTIAL_CANCELED', 'ABORTED', 'EXPIRED'

  // Card Info (nullable)
  cardNumber: varchar('card_number', { length: 50 }),
  cardType: varchar('card_type', { length: 20 }),
  cardIssuer: varchar('card_issuer', { length: 50 }),
  cardAcquirer: varchar('card_acquirer', { length: 50 }),

  // EasyPay Info (nullable)
  easyPayProvider: varchar('easy_pay_provider', { length: 50 }),
  easyPayAmount: integer('easy_pay_amount'),

  // Timestamps
  requestedAt: timestamp('requested_at'),
  approvedAt: timestamp('approved_at'),
  canceledAt: timestamp('canceled_at'),

  // Receipt
  receiptUrl: text('receipt_url'),

  // Credits Info
  creditsGranted: integer('credits_granted').notNull(),

  // Additional Info
  metadata: jsonb('metadata'), // Raw response from Toss Payments
  failureCode: varchar('failure_code', { length: 50 }),
  failureMessage: text('failure_message'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('idx_payments_user').on(table.userId),
  statusIdx: index('idx_payments_status').on(table.status),
  createdIdx: index('idx_payments_created').on(table.createdAt),
}));

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

// ================================
// Admin Activity Logs Table
// ================================
export const adminLogs = pgTable('admin_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').references(() => users.id, { onDelete: 'set null' }),

  action: varchar('action', { length: 100 }).notNull(), // 'credit_charge', 'user_update', 'announcement_create', etc.
  targetType: varchar('target_type', { length: 50 }), // 'user', 'announcement', 'service', etc.
  targetId: uuid('target_id'),

  details: jsonb('details'), // Additional action details
  ipAddress: varchar('ip_address', { length: 45 }),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  adminIdx: index('idx_admin_logs_admin').on(table.adminId),
  actionIdx: index('idx_admin_logs_action').on(table.action),
  createdIdx: index('idx_admin_logs_created').on(table.createdAt),
}));

export const insertAdminLogSchema = createInsertSchema(adminLogs);
export const selectAdminLogSchema = createSelectSchema(adminLogs);

// ================================
// Service Usage Logs Table
// ================================
export const serviceLogs = pgTable('service_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

  serviceType: varchar('service_type', { length: 100 }).notNull(),
  creditUsed: integer('credit_used').notNull(),

  // Request info
  inputSummary: text('input_summary'), // Brief summary of input
  processingTime: integer('processing_time'), // ms
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('idx_service_logs_user').on(table.userId),
  serviceIdx: index('idx_service_logs_service').on(table.serviceType),
  createdIdx: index('idx_service_logs_created').on(table.createdAt),
}));

export const insertServiceLogSchema = createInsertSchema(serviceLogs);
export const selectServiceLogSchema = createSelectSchema(serviceLogs);

// ================================
// Announcements Table
// ================================
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').references(() => users.id, { onDelete: 'set null' }),

  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),

  type: varchar('type', { length: 20 }).notNull().default('info'), // 'info', 'warning', 'update', 'event'
  isActive: boolean('is_active').notNull().default(true),
  isPinned: boolean('is_pinned').notNull().default(false),

  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  activeIdx: index('idx_announcements_active').on(table.isActive),
  createdIdx: index('idx_announcements_created').on(table.createdAt),
}));

export const insertAnnouncementSchema = createInsertSchema(announcements);
export const selectAnnouncementSchema = createSelectSchema(announcements);

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

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

export type ServiceLog = typeof serviceLogs.$inferSelect;
export type InsertServiceLog = typeof serviceLogs.$inferInsert;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

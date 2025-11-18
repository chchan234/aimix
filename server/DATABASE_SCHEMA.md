# AIMix Database Schema Documentation

## Overview

AIMix uses Supabase PostgreSQL database to manage users, AI services, credit system, and service usage tracking.

**Database**: PostgreSQL 15.x (Supabase)
**ORM**: Drizzle ORM
**Migration Tool**: SQL migrations in `/migrations` folder

## Table of Contents

1. [Users](#users)
2. [Prompt Templates](#prompt-templates)
3. [Prompt Experiments](#prompt-experiments)
4. [Services (Catalog)](#services-catalog)
5. [Service Results](#service-results)
6. [Transactions](#transactions)
7. [Functions](#database-functions)
8. [Triggers](#triggers)
9. [Indexes](#indexes)

---

## Users

**Table**: `users`
**Purpose**: Store user account information, authentication, and credits

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | User unique identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `username` | VARCHAR(50) | UNIQUE | Display name |
| `password` | VARCHAR(255) | NULL | Hashed password (email provider) |
| `provider` | VARCHAR(20) | NOT NULL, DEFAULT 'email' | Auth provider: 'email', 'kakao', 'google' |
| `provider_id` | VARCHAR(255) | NULL | Provider's user ID |
| `profile_image_url` | TEXT | NULL | Profile image URL |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verification status |
| `verification_token` | VARCHAR(255) | NULL | Email verification token |
| `verification_token_expires` | TIMESTAMP | NULL | Token expiration time |
| `credits` | INTEGER | NOT NULL, DEFAULT 1000 | Current credit balance |
| `lifetime_credits` | INTEGER | NOT NULL, DEFAULT 0 | Total credits ever earned/purchased |
| `subscription_tier` | VARCHAR(20) | NULL | Subscription level: 'basic', 'premium', 'pro' |
| `subscription_end_date` | TIMESTAMP | NULL | Subscription expiration |
| `locale` | VARCHAR(10) | NOT NULL, DEFAULT 'ko' | Preferred language |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

### Indexes
- `idx_email` ON (email)
- `idx_provider` ON (provider, provider_id)

---

## Prompt Templates

**Table**: `prompt_templates`
**Purpose**: Store and version AI prompt templates for different services

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Template unique identifier |
| `service_type` | VARCHAR(100) | NOT NULL | Service name (e.g., 'saju', 'tarot') |
| `ai_model` | VARCHAR(30) | NOT NULL | AI model used (e.g., 'gpt-4o-mini', 'gemini-2.5-flash') |
| `version` | VARCHAR(10) | NOT NULL | Template version |
| `system_prompt` | TEXT | NULL | System-level prompt |
| `user_prompt_template` | TEXT | NOT NULL | User prompt template with placeholders |
| `parameters` | JSONB | NOT NULL, DEFAULT '{}' | Template parameters |
| `output_format` | VARCHAR(20) | NOT NULL | Expected output format: 'json', 'text', 'markdown', 'image' |
| `validation_schema` | JSONB | NULL | JSON schema for output validation |
| `description` | TEXT | NULL | Template description |
| `author` | VARCHAR(100) | NULL | Template author |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| `avg_tokens` | INTEGER | NULL | Average tokens used |
| `avg_response_time` | INTEGER | NULL | Average response time (ms) |
| `usage_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of times used |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |

### Constraints
- UNIQUE(service_type, version)

### Indexes
- `idx_service_active` ON (service_type, is_active)

---

## Prompt Experiments

**Table**: `prompt_experiments`
**Purpose**: A/B testing for prompt templates

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Experiment unique identifier |
| `service_type` | VARCHAR(100) | NOT NULL | Service being tested |
| `template_a_id` | UUID | REFERENCES prompt_templates(id) | Template A |
| `template_b_id` | UUID | REFERENCES prompt_templates(id) | Template B |
| `traffic_split` | INTEGER | NOT NULL, DEFAULT 50 | Traffic split percentage (A/B ratio) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'running' | Status: 'running', 'completed', 'cancelled' |
| `version_a_count` | INTEGER | NOT NULL, DEFAULT 0 | Version A usage count |
| `version_b_count` | INTEGER | NOT NULL, DEFAULT 0 | Version B usage count |
| `version_a_avg_rating` | DECIMAL(3, 2) | NULL | Version A average rating |
| `version_b_avg_rating` | DECIMAL(3, 2) | NULL | Version B average rating |
| `started_at` | TIMESTAMP | NOT NULL | Experiment start time |
| `ended_at` | TIMESTAMP | NULL | Experiment end time |
| `winner` | VARCHAR(10) | NULL | Winning version: 'A', 'B', 'tie' |

---

## Services (Catalog)

**Table**: `services`
**Purpose**: Catalog of available AI services with descriptions and pricing

⚠️ **Important**: This table stores the SERVICE CATALOG (available services), NOT service requests!

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Service unique identifier |
| `category` | VARCHAR(50) | NOT NULL | Service category: 'fortune', 'image', 'entertainment', 'utility' |
| `service_type` | VARCHAR(100) | NOT NULL | Service type identifier |
| `name_ko` | VARCHAR(100) | NOT NULL | Korean service name |
| `name_en` | VARCHAR(100) | NOT NULL | English service name |
| `description_ko` | TEXT | NULL | Korean description |
| `description_en` | TEXT | NULL | English description |
| `credit_cost` | INTEGER | NOT NULL | Cost in credits |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Service availability |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |

### Constraints
- UNIQUE(category, service_type)

### Available Services

| Category | Service Type | Name (KO) | Cost | Description |
|----------|-------------|-----------|------|-------------|
| fortune | name-analysis | 성명학 분석 | 10 | Analyze name meaning and fortune |
| fortune | dream-interpretation | 꿈 해몽 | 15 | Interpret dream meaning |
| entertainment | story | 이야기 생성 | 20 | Generate creative story |
| utility | chat | AI 채팅 | 5 | Chat with AI |
| fortune | face-reading | 관상 분석 | 25 | Analyze face for fortune reading |
| fortune | saju | 사주팔자 | 25 | Analyze Four Pillars of Destiny |
| fortune | tarot | 타로 카드 | 20 | Read fortune with Tarot cards |
| fortune | tojeong | 토정비결 | 15 | Predict fortune with Tojeong Bigyeol |

---

## Service Results

**Table**: `service_results`
**Purpose**: Store service usage history and results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Result unique identifier |
| `user_id` | UUID | REFERENCES users(id) ON DELETE CASCADE | User who used service |
| `service_id` | UUID | REFERENCES services(id) | Service used |
| `input_data` | JSONB | NULL | Input data (e.g., birth date, question) |
| `input_files` | TEXT[] | NULL | Input file URLs |
| `result_data` | JSONB | NULL | AI-generated result data |
| `result_files` | TEXT[] | NULL | Result file URLs (e.g., generated images) |
| `ai_model` | VARCHAR(50) | NULL | AI model used |
| `prompt_template_id` | UUID | REFERENCES prompt_templates(id) | Prompt template used |
| `tokens_used` | INTEGER | NULL | Tokens consumed |
| `processing_time` | INTEGER | NULL | Processing time in milliseconds |
| `is_public` | BOOLEAN | NOT NULL, DEFAULT FALSE | Public sharing enabled |
| `share_token` | VARCHAR(100) | UNIQUE, NULL | Public sharing token |
| `expires_at` | TIMESTAMP | NOT NULL | Result expiration (12 months) |
| `created_at` | TIMESTAMP | NOT NULL | Service usage time |

### Indexes
- `idx_user_service` ON (user_id, service_id)
- `idx_share_token` ON (share_token)

---

## Transactions

**Table**: `transactions`
**Purpose**: Track all credit transactions (charges, usage, refunds)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Transaction unique identifier |
| `user_id` | UUID | REFERENCES users(id) ON DELETE CASCADE | User |
| `type` | VARCHAR(20) | NOT NULL | Transaction type: 'charge', 'use', 'refund' |
| `credit_amount` | INTEGER | NOT NULL | Credit amount (positive or negative) |
| `credit_balance_after` | INTEGER | NOT NULL | Credit balance after transaction |
| `payment_method` | VARCHAR(50) | NULL | Payment method (for charges) |
| `payment_id` | VARCHAR(100) | UNIQUE, NULL | Payment provider transaction ID |
| `actual_amount` | INTEGER | NULL | Actual amount in KRW (for charges) |
| `service_id` | UUID | REFERENCES services(id), NULL | Service used (for 'use' type) |
| `result_id` | UUID | REFERENCES service_results(id), NULL | Result reference |
| `created_at` | TIMESTAMP | NOT NULL | Transaction time |

### Indexes
- `idx_user_created` ON (user_id, created_at)

### Transaction Types

- **charge**: User purchases credits
- **use**: User spends credits on AI service
- **refund**: Credits refunded to user

---

## Database Functions

### `deduct_credits(p_user_id UUID, p_amount INTEGER)`

**Purpose**: Atomically check and deduct credits from user account

**Returns**: TABLE with user information or empty if insufficient credits

**Behavior**:
- Atomically checks if user has sufficient credits
- Deducts credits if available
- Returns updated user record on success
- Returns empty result if insufficient credits (prevents race conditions)

**Usage**:
```sql
SELECT * FROM deduct_credits('user-uuid-here'::uuid, 25);
```

**Code**:
```sql
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  credits INTEGER,
  provider TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  UPDATE users
  SET
    credits = users.credits - p_amount,
    updated_at = NOW()
  WHERE users.id = p_user_id
    AND users.credits >= p_amount
  RETURNING
    users.id,
    users.email,
    users.username,
    users.credits,
    users.provider,
    users.profile_image_url,
    users.created_at,
    users.updated_at;
END;
$$ LANGUAGE plpgsql;
```

### `update_updated_at_column()`

**Purpose**: Trigger function to automatically update `updated_at` timestamp

**Usage**: Applied to tables with `updated_at` column

---

## Triggers

### `update_users_updated_at`
- **Table**: users
- **Type**: BEFORE UPDATE
- **Function**: update_updated_at_column()

### `update_prompt_templates_updated_at`
- **Table**: prompt_templates
- **Type**: BEFORE UPDATE
- **Function**: update_updated_at_column()

### `update_services_updated_at`
- **Table**: services
- **Type**: BEFORE UPDATE
- **Function**: update_updated_at_column()

---

## Indexes

### Users
- `idx_email` - Fast email lookup for authentication
- `idx_provider` - Fast OAuth provider lookup

### Prompt Templates
- `idx_service_active` - Query active templates by service

### Service Results
- `idx_user_service` - User's service history
- `idx_share_token` - Public sharing lookup

### Transactions
- `idx_user_created` - User transaction history (chronological)

---

## Migration Files

All schema migrations are stored in `/server/migrations/`:

1. `001_initial_schema.sql` - Initial database setup
2. `002_add_email_verification.sql` - Email verification fields
3. `003_atomic_credit_deduction.sql` - deduct_credits function
4. `004_fix_deduct_credits.sql` - Fix PostgreSQL SET clause syntax
5. `005_complete_schema.sql` - Complete schema with all tables

---

## Schema Diagram

```
┌─────────────────┐
│     users       │
│  (accounts &    │
│   credits)      │
└────────┬────────┘
         │
         │ user_id
         ▼
┌─────────────────────┐      ┌──────────────────┐
│  service_results    │──────│   transactions   │
│  (usage history)    │      │  (credit log)    │
└──────┬──────────┬───┘      └──────────────────┘
       │          │
       │          │ service_id
       │          ▼
       │     ┌─────────────┐
       │     │  services   │
       │     │ (catalog)   │
       │     └─────────────┘
       │
       │ prompt_template_id
       ▼
┌────────────────────┐      ┌────────────────────┐
│ prompt_templates   │◄─────│ prompt_experiments │
│ (AI prompts)       │      │  (A/B testing)     │
└────────────────────┘      └────────────────────┘
```

---

## Notes

### Current Implementation Status

✅ **Implemented**:
- User authentication and credit system
- Credit deduction with atomic transactions
- Service catalog
- All table definitions

⚠️ **Partially Implemented**:
- Service results are NOT being saved currently
- Transaction history is NOT being logged
- Prompt templates are defined but not actively used

❌ **Not Implemented**:
- Prompt experiments (A/B testing)
- Service result sharing
- Result expiration cleanup

### TODO

1. **Implement Service Logging**: Modify AI routes to save service results to `service_results` table
2. **Implement Transaction Logging**: Log all credit operations to `transactions` table
3. **Implement Result Cleanup**: Create cron job to delete expired results (>12 months)
4. **Implement Prompt Management**: Use `prompt_templates` for versioned AI prompts
5. **Implement A/B Testing**: Use `prompt_experiments` to optimize AI responses

---

## Connection Information

**Production Database** (aimix.vercel.app):
- Host: `db.ssmrlqzbwigzwtlpjsiz.supabase.co`
- Port: 5432
- Database: `postgres`
- Connection URL: Available in `.env.production`

**Development**:
- Use Supabase dashboard SQL Editor
- Or connect via psql/pg client with DATABASE_URL from `.env`

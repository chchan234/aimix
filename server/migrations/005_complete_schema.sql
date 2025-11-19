-- Migration 005: Complete Database Schema
-- Creates all missing tables and columns based on Drizzle schema

-- ================================
-- Enable Extensions
-- ================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- Update Users Table - Add Missing Columns
-- ================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

-- Update default credits to 1000 for new users
ALTER TABLE users
  ALTER COLUMN credits SET DEFAULT 1000;

-- ================================
-- Prompt Templates Table
-- ================================
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type VARCHAR(100) NOT NULL,
  ai_model VARCHAR(30) NOT NULL,
  version VARCHAR(10) NOT NULL,

  system_prompt TEXT,
  user_prompt_template TEXT NOT NULL,

  parameters JSONB NOT NULL DEFAULT '{}',

  output_format VARCHAR(20) NOT NULL,
  validation_schema JSONB,

  description TEXT,
  author VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  avg_tokens INTEGER,
  avg_response_time INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_service_version UNIQUE(service_type, version)
);

CREATE INDEX IF NOT EXISTS idx_service_active ON prompt_templates(service_type, is_active);

-- ================================
-- Prompt Experiments (A/B Testing)
-- ================================
CREATE TABLE IF NOT EXISTS prompt_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type VARCHAR(100) NOT NULL,

  template_a_id UUID REFERENCES prompt_templates(id),
  template_b_id UUID REFERENCES prompt_templates(id),

  traffic_split INTEGER NOT NULL DEFAULT 50,
  status VARCHAR(20) NOT NULL DEFAULT 'running',

  version_a_count INTEGER NOT NULL DEFAULT 0,
  version_b_count INTEGER NOT NULL DEFAULT 0,
  version_a_avg_rating DECIMAL(3, 2),
  version_b_avg_rating DECIMAL(3, 2),

  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  winner VARCHAR(10)
);

-- ================================
-- Services Table (Service Catalog)
-- ================================
-- NOTE: This is a CATALOG of available services, not service requests!
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  service_type VARCHAR(100) NOT NULL,

  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_ko TEXT,
  description_en TEXT,

  credit_cost INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_category_service UNIQUE(category, service_type)
);

-- ================================
-- Service Results Table (Service Usage History)
-- ================================
CREATE TABLE IF NOT EXISTS service_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),

  -- Input
  input_data JSONB,
  input_files TEXT[],

  -- Result
  result_data JSONB,
  result_files TEXT[],

  -- AI Info
  ai_model VARCHAR(50),
  prompt_template_id UUID REFERENCES prompt_templates(id),
  tokens_used INTEGER,
  processing_time INTEGER,

  -- Sharing
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  share_token VARCHAR(100) UNIQUE,

  -- Expiry (12 months)
  expires_at TIMESTAMP NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_service ON service_results(user_id, service_id);
CREATE INDEX IF NOT EXISTS idx_share_token ON service_results(share_token);

-- ================================
-- Transactions Table (Credit Transaction History)
-- ================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL,
  credit_amount INTEGER NOT NULL,
  credit_balance_after INTEGER NOT NULL,

  -- Payment info
  payment_method VARCHAR(50),
  payment_id VARCHAR(100) UNIQUE,
  actual_amount INTEGER,

  -- Service usage
  service_id UUID REFERENCES services(id),
  result_id UUID REFERENCES service_results(id),

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_created ON transactions(user_id, created_at);

-- ================================
-- Insert Service Catalog Data
-- ================================
INSERT INTO services (category, service_type, name_ko, name_en, description_ko, description_en, credit_cost, is_active) VALUES
  ('fortune', 'name-analysis', '성명학 분석', 'Name Analysis', '이름의 의미와 운세를 분석합니다', 'Analyze name meaning and fortune', 10, TRUE),
  ('fortune', 'dream-interpretation', '꿈 해몽', 'Dream Interpretation', '꿈의 의미를 해석합니다', 'Interpret dream meaning', 15, TRUE),
  ('entertainment', 'story', '이야기 생성', 'Story Generation', '창의적인 이야기를 생성합니다', 'Generate creative story', 20, TRUE),
  ('utility', 'chat', 'AI 채팅', 'AI Chat', 'AI와 대화합니다', 'Chat with AI', 5, TRUE),
  ('fortune', 'face-reading', '관상 분석', 'Face Reading', '얼굴을 분석하여 운세를 봅니다', 'Analyze face for fortune reading', 25, TRUE),
  ('fortune', 'saju', '사주팔자', 'Saju Analysis', '사주팔자를 분석합니다', 'Analyze Four Pillars of Destiny', 25, TRUE),
  ('fortune', 'tarot', '타로 카드', 'Tarot Reading', '타로 카드로 운세를 봅니다', 'Read fortune with Tarot cards', 20, TRUE),
  ('fortune', 'tojeong', '토정비결', 'Tojeong Bigyeol', '토정비결로 운세를 봅니다', 'Predict fortune with Tojeong Bigyeol', 15, TRUE)
ON CONFLICT (category, service_type) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  name_en = EXCLUDED.name_en,
  description_ko = EXCLUDED.description_ko,
  description_en = EXCLUDED.description_en,
  credit_cost = EXCLUDED.credit_cost,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ================================
-- Updated_at Trigger
-- ================================
-- Apply trigger to services table
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

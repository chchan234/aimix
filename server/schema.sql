-- AIMix Database Schema for Supabase PostgreSQL
-- Generated from Drizzle ORM schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- Users Table
-- ================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) UNIQUE,
  provider VARCHAR(20) NOT NULL DEFAULT 'email',
  provider_id VARCHAR(255),
  profile_image_url TEXT,

  credits INTEGER NOT NULL DEFAULT 0,
  lifetime_credits INTEGER NOT NULL DEFAULT 0,

  subscription_tier VARCHAR(20),
  subscription_end_date TIMESTAMP,

  locale VARCHAR(10) NOT NULL DEFAULT 'ko',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_provider ON users(provider, provider_id);

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

  UNIQUE(service_type, version)
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
-- Services Table
-- ================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL,

  input_data JSONB NOT NULL,
  input_image_url TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  result_id UUID,

  credit_cost INTEGER NOT NULL,
  processing_time INTEGER,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_services ON services(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_status ON services(status);

-- ================================
-- Service Results Table
-- ================================
CREATE TABLE IF NOT EXISTS service_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  result_data JSONB NOT NULL,
  result_image_url TEXT,
  result_text TEXT,

  prompt_template_id UUID REFERENCES prompt_templates(id),
  ai_model VARCHAR(30),
  tokens_used INTEGER,

  user_rating INTEGER,
  user_feedback TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_results ON service_results(service_id);

-- ================================
-- Transactions Table
-- ================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  credits_before INTEGER NOT NULL,
  credits_after INTEGER NOT NULL,

  reference_id UUID,
  reference_type VARCHAR(50),

  description TEXT,
  metadata JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_transactions ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON transactions(type);

-- ================================
-- Updated_at Trigger Function
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to prompt_templates table
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

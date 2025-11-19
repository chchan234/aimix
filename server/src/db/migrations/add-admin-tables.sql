-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Set kakao_4548065516 as admin
UPDATE users SET role = 'admin' WHERE provider_id = '4548065516' AND provider = 'kakao';

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,

  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,

  details JSONB,
  ip_address VARCHAR(45),

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);

-- Create service_logs table
CREATE TABLE IF NOT EXISTS service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  service_type VARCHAR(100) NOT NULL,
  credit_used INTEGER NOT NULL,

  input_summary TEXT,
  processing_time INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_logs_user ON service_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_service ON service_logs(service_type);
CREATE INDEX IF NOT EXISTS idx_service_logs_created ON service_logs(created_at);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,

  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,

  type VARCHAR(20) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_pinned BOOLEAN NOT NULL DEFAULT false,

  start_date TIMESTAMP,
  end_date TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at);

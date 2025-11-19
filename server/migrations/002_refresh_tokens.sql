-- Refresh Tokens Table
-- Stores refresh tokens for httpOnly cookie authentication

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Clean up expired tokens automatically (run this periodically)
-- Can be set up as a cron job in Supabase
CREATE OR REPLACE FUNCTION delete_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens
  WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for JWT authentication with httpOnly cookies';
COMMENT ON COLUMN refresh_tokens.token IS 'Hashed refresh token (bcrypt)';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Token expiration time (30 days default)';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'When token was revoked (logout)';

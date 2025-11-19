-- Add email verification columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

-- Set email_verified to true for existing OAuth users (Kakao)
UPDATE users
SET email_verified = true
WHERE provider != 'email';

-- Add comment
COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN users.verification_token IS 'Token sent to user email for verification';
COMMENT ON COLUMN users.verification_token_expires IS 'Expiration time for verification token';

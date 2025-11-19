-- Atomic Credit Deduction Function
-- Prevents race conditions in credit system

/**
 * Atomically deduct credits from user account
 * Returns the updated user row if successful, null if insufficient credits
 */
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  credits INTEGER,
  email_verified BOOLEAN,
  provider TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Atomically check and deduct credits in a single operation
  RETURN QUERY
  UPDATE users
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE users.id = p_user_id
    AND users.credits >= p_amount  -- Atomic check
  RETURNING
    users.id,
    users.email,
    users.username,
    users.credits,
    users.email_verified,
    users.provider,
    users.profile_image_url,
    users.created_at,
    users.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION deduct_credits IS 'Atomically deduct credits from user account with race condition prevention';

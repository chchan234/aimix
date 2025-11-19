-- Migration 006: Fix deduct_credits function - CORRECT DATA TYPES
-- Problem: RETURNS TABLE types don't match actual table column types
-- Solution: Use exact data types from users table

DROP FUNCTION IF EXISTS deduct_credits(uuid, integer);

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),                        -- FIXED: was TEXT
  username VARCHAR(50),                      -- FIXED: was TEXT
  credits INTEGER,
  provider VARCHAR(20),                      -- FIXED: was TEXT
  profile_image_url TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE,    -- FIXED: was WITH TIME ZONE
  updated_at TIMESTAMP WITHOUT TIME ZONE     -- FIXED: was WITH TIME ZONE
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, integer) TO anon;

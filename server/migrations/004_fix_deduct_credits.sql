-- Migration 004: Fix deduct_credits function
-- Problem: PostgreSQL does not allow table-qualified column names on the LEFT side of SET clause
-- Solution: Use unqualified column names in SET clause

DROP FUNCTION IF EXISTS deduct_credits(uuid, integer);

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
    credits = users.credits - p_amount,  -- LEFT: unqualified, RIGHT: can be qualified
    updated_at = NOW()
  WHERE users.id = p_user_id
    AND users.credits >= p_amount  -- Atomic check prevents race conditions
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

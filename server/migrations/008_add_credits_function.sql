-- Add credits function for refunds
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id TEXT,
  p_amount INTEGER
)
RETURNS TABLE (
  id TEXT,
  credits INTEGER,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  UPDATE users
  SET
    credits = users.credits + p_amount,
    updated_at = NOW()
  WHERE users.id = p_user_id
  RETURNING users.id, users.credits, users.updated_at;
END;
$$ LANGUAGE plpgsql;

const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:zzxxcc556611@db.ssmrlqzbwigzwtlpjsiz.supabase.co:5432/postgres'
});

const sql = `DROP FUNCTION IF EXISTS deduct_credits(uuid, integer);

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

GRANT EXECUTE ON FUNCTION deduct_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, integer) TO anon;`;

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const result = await client.query(sql);
    console.log('✅ Successfully executed SQL');

    await client.end();
    console.log('✅ deduct_credits function fixed successfully!');
    console.log('The function now correctly uses unqualified column names in the SET clause.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

main();

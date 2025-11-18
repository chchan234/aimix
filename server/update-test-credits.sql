-- Update test user's credits to 9999 and reset password to 'test'
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ssmrlqzbwigzwtlpjsiz/editor

UPDATE users
SET
  credits = 9999,
  lifetime_credits = 9999,
  email_verified = true
WHERE email = 'test@test.com';

-- Show the updated user
SELECT id, email, username, credits, email_verified
FROM users
WHERE email = 'test@test.com';

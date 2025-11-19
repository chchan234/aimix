#!/bin/bash

# Create test user directly in PostgreSQL
# Email: test@test.com
# Password: test (bcrypt hash will be generated)

# Generate bcrypt hash for "test" password
# Using Node.js to generate the hash
HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('test', 10).then(hash => console.log(hash))")

echo "Creating test user..."
echo "Email: test@test.com"
echo "Password: test"
echo "Credits: 9999"
echo ""

# Connect to PostgreSQL and create user
PGPASSWORD="zzxxcc556611" psql \
  -h db.ssmrlqzbwigzwtlpjsiz.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "
    INSERT INTO users (email, password, username, provider, credits, lifetime_credits, email_verified)
    VALUES ('test@test.com', '$(node -p "require('bcrypt').hashSync('test', 10)")', 'testmaster', 'email', 9999, 9999, true)
    ON CONFLICT (email)
    DO UPDATE SET
      credits = 9999,
      lifetime_credits = 9999,
      email_verified = true,
      password = EXCLUDED.password
    RETURNING id, email, username, credits, email_verified;
  "

echo ""
echo "✅ Test user created/updated successfully!"

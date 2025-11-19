/**
 * Create test user directly in PostgreSQL
 */

const bcrypt = require('bcrypt');
const { Client } = require('pg');
require('dotenv').config();

async function createTestUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();

    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash('test', 10);

    console.log('👤 Creating/updating test user...');

    const result = await client.query(`
      INSERT INTO users (email, password, username, provider, credits, lifetime_credits, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email)
      DO UPDATE SET
        credits = EXCLUDED.credits,
        lifetime_credits = EXCLUDED.lifetime_credits,
        email_verified = EXCLUDED.email_verified,
        password = EXCLUDED.password
      RETURNING id, email, username, credits, email_verified;
    `, ['test@test.com', hashedPassword, 'testmaster', 'email', 9999, 9999, true]);

    console.log('');
    console.log('=== Test Account Created/Updated ===');
    console.log('📧 Email: test@test.com');
    console.log('🔑 Password: test');
    console.log('👤 Username:', result.rows[0].username);
    console.log('💰 Credits:', result.rows[0].credits);
    console.log('✉️  Email Verified:', result.rows[0].email_verified);
    console.log('🆔 User ID:', result.rows[0].id);
    console.log('===================================');
    console.log('');
    console.log('✅ Success! You can now login with:');
    console.log('   Email: test@test.com');
    console.log('   Password: test');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createTestUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

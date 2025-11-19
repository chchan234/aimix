/**
 * Create test master account
 * Email: test@test
 * Password: test
 * Credits: 9999
 */

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './src/db/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Check environment variables
console.log('🔧 Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
console.log('');

async function createTestUser() {
  try {
    const email = 'test@test';
    const password = 'test';
    const username = 'testmaster';
    const credits = 9999;

    console.log('🔍 Checking if user already exists...');

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('⚠️  User already exists. Updating credits...');

      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          credits: credits,
          lifetime_credits: credits,
          email_verified: true,
          verification_token: null,
          verification_token_expires: null
        })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Test user updated successfully!');
      console.log('📧 Email:', updatedUser.email);
      console.log('👤 Username:', updatedUser.username);
      console.log('💰 Credits:', updatedUser.credits);
      console.log('✉️  Email Verified:', updatedUser.email_verified);
      return;
    }

    console.log('🔒 Hashing password...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('👤 Creating test user...');

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        username,
        provider: 'email',
        credits,
        lifetime_credits: credits,
        email_verified: true, // Skip email verification for test account
        verification_token: null,
        verification_token_expires: null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('=== Test Account Details ===');
    console.log('📧 Email:', newUser.email);
    console.log('🔑 Password: test');
    console.log('👤 Username:', newUser.username);
    console.log('💰 Credits:', newUser.credits);
    console.log('✉️  Email Verified:', newUser.email_verified);
    console.log('🆔 User ID:', newUser.id);
    console.log('===========================');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
createTestUser()
  .then(() => {
    console.log('');
    console.log('✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

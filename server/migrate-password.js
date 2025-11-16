/**
 * Migration script to add password column to users table
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require'
  });

  try {
    console.log('Adding password column to users table...');

    // Add password column
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)`;

    console.log('✅ Password column added successfully!');

    // Verify the column exists
    const result = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'password'
    `;

    if (result.length > 0) {
      console.log('✅ Verification successful - password column exists');
    } else {
      console.log('⚠️ Warning: password column not found in verification');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();

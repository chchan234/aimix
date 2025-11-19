import { config } from 'dotenv';
config();

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users } from './src/db/schema.js';
import { eq, sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

console.log('✓ Using database:', connectionString.replace(/:[^:@]+@/, ':****@'));

async function addCredits(providerId: string, amount: number) {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    // Extract provider from providerId (e.g., kakao_4548065516 -> kakao)
    const provider = providerId.split('_')[0];

    console.log(`Looking for user with provider: ${provider}, providerId: ${providerId}`);

    // Get current credits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.providerId, providerId));

    if (!user) {
      console.error(`❌ User with providerId ${providerId} not found`);
      return;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Current credits: ${user.credits}`);

    // Add credits
    await db
      .update(users)
      .set({
        credits: sql`${users.credits} + ${amount}`,
        lifetimeCredits: sql`${users.lifetimeCredits} + ${amount}`
      })
      .where(eq(users.providerId, providerId));

    // Get updated credits
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.providerId, providerId));

    console.log(`✅ Added ${amount} credits to ${user.email}`);
    console.log(`New credits: ${updatedUser.credits}`);
    console.log(`New lifetime credits: ${updatedUser.lifetimeCredits}`);

  } catch (error) {
    console.error('❌ Error adding credits:', error);
  } finally {
    await pool.end();
  }
}

const providerId = process.argv[2];
const amount = parseInt(process.argv[3]);

if (!providerId || !amount) {
  console.error('Usage: tsx add-credits.ts <providerId> <amount>');
  console.error('Example: tsx add-credits.ts kakao_4548065516 2000');
  process.exit(1);
}

addCredits(providerId, amount);

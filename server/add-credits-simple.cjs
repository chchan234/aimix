const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Using DATABASE_URL:', process.env.DATABASE_URL.substring(0, 30) + '...');

async function addCredits(providerId, amount) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  try {
    // First, test connection by listing all kakao users
    console.log('\n🔍 Testing database connection...');
    const testResult = await client.query(
      "SELECT provider_id, email FROM users WHERE provider LIKE 'kakao%' LIMIT 5"
    );
    console.log(`Found ${testResult.rows.length} Kakao users in database`);
    if (testResult.rows.length > 0) {
      console.log('Sample provider_ids:');
      testResult.rows.forEach(row => console.log(`  - ${row.provider_id} (${row.email})`));
    }

    // Get current user
    console.log(`\n🔍 Looking for user with provider_id: ${providerId}`);
    const result = await client.query(
      'SELECT id, email, credits, lifetime_credits FROM users WHERE provider_id = $1',
      [providerId]
    );

    if (result.rows.length === 0) {
      console.error(`❌ User with provider_id ${providerId} not found`);
      return;
    }

    const user = result.rows[0];
    console.log(`Found user: ${user.email}`);
    console.log(`Current credits: ${user.credits}`);
    console.log(`Current lifetime credits: ${user.lifetime_credits}`);

    // Update credits
    const updateResult = await client.query(
      `UPDATE users
       SET credits = credits + $1,
           lifetime_credits = lifetime_credits + $1,
           updated_at = NOW()
       WHERE provider_id = $2
       RETURNING credits, lifetime_credits`,
      [amount, providerId]
    );

    const updated = updateResult.rows[0];
    console.log(`\n✅ Added ${amount} credits to ${user.email}`);
    console.log(`New credits: ${updated.credits}`);
    console.log(`New lifetime credits: ${updated.lifetime_credits}`);

  } catch (error) {
    console.error('❌ Error adding credits:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

const providerId = process.argv[2];
const amount = parseInt(process.argv[3]);

if (!providerId || !amount || isNaN(amount)) {
  console.error('Usage: node add-credits-simple.cjs <providerId> <amount>');
  console.error('Example: node add-credits-simple.cjs kakao_4548065516 2000');
  process.exit(1);
}

console.log(`\n🔍 Adding ${amount} credits to provider_id: ${providerId}\n`);
addCredits(providerId, amount);

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function createPaymentTables() {
  try {
    console.log('Creating transactions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        amount INTEGER NOT NULL,
        credits_before INTEGER NOT NULL,
        credits_after INTEGER NOT NULL,
        reference_id VARCHAR(200),
        reference_type VARCHAR(50),
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('Creating index on transactions...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_created ON transactions(user_id, created_at)
    `;

    console.log('Creating payments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        transaction_id UUID REFERENCES transactions(id),
        payment_key VARCHAR(200) NOT NULL UNIQUE,
        order_id VARCHAR(100) NOT NULL UNIQUE,
        order_name VARCHAR(200) NOT NULL,
        method VARCHAR(50) NOT NULL,
        total_amount INTEGER NOT NULL,
        balance_amount INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        card_number VARCHAR(50),
        card_type VARCHAR(20),
        card_issuer VARCHAR(50),
        card_acquirer VARCHAR(50),
        easy_pay_provider VARCHAR(50),
        easy_pay_amount INTEGER,
        requested_at TIMESTAMP,
        approved_at TIMESTAMP,
        canceled_at TIMESTAMP,
        receipt_url VARCHAR(500),
        credits_granted INTEGER NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('Creating indexes on payments...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)
    `;

    console.log('✅ Payment tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

createPaymentTables();

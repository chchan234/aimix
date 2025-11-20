import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function checkTableStructure() {
  try {
    console.log('Checking payments table structure...\n');

    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position
    `;

    console.log('Payments table columns:');
    console.table(columns);

    const hasFailureCode = columns.some(col => col.column_name === 'failure_code');
    const hasFailureMessage = columns.some(col => col.column_name === 'failure_message');

    console.log('\nColumn check:');
    console.log(`failure_code exists: ${hasFailureCode}`);
    console.log(`failure_message exists: ${hasFailureMessage}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkTableStructure();

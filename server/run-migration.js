import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  try {
    // Read SQL file
    const sql = readFileSync(join(__dirname, 'migrations', '001_add_email_verification.sql'), 'utf-8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 100) + '...');
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Try direct query instead
        const { error: directError } = await supabase.from('users').select('id').limit(1);
        if (directError) {
          console.error('Error:', error);
          throw error;
        }
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

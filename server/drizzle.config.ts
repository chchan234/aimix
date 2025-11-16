import { defineConfig } from 'drizzle-kit';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
});

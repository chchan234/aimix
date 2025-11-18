/**
 * Script to insert initial services into the database
 * Run with: npx tsx server/insert-services.ts
 */

import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { services } from './src/db/schema.js';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function insertServices() {
  console.log('🌱 Inserting services...');

  try {
    const initialServices = await db
      .insert(services)
      .values([
        {
          category: 'fortune',
          serviceType: 'face-reading',
          nameKo: 'AI 관상 분석',
          nameEn: 'AI Face Reading',
          descriptionKo: '얼굴 특징을 분석하여 성격과 운세를 알려드립니다',
          descriptionEn: 'Analyze facial features to reveal personality and fortune',
          creditCost: 25,
          isActive: true,
        },
        {
          category: 'fortune',
          serviceType: 'saju',
          nameKo: 'AI 사주팔자',
          nameEn: 'AI Saju (Four Pillars)',
          descriptionKo: '생년월일시를 기반으로 사주를 풀이합니다',
          descriptionEn: 'Interpret your Four Pillars based on birth date and time',
          creditCost: 25,
          isActive: true,
        },
      ])
      .onConflictDoUpdate({
        target: [services.category, services.serviceType],
        set: {
          nameKo: services.nameKo,
          nameEn: services.nameEn,
          descriptionKo: services.descriptionKo,
          descriptionEn: services.descriptionEn,
          creditCost: services.creditCost,
          isActive: services.isActive,
          updatedAt: new Date(),
        },
      })
      .returning();

    console.log(`✅ Inserted/updated ${initialServices.length} services`);
    initialServices.forEach((s) => {
      console.log(`  - ${s.nameKo} (${s.serviceType})`);
    });
  } catch (error) {
    console.error('❌ Error inserting services:', error);
    throw error;
  } finally {
    await client.end();
  }
}

insertServices();

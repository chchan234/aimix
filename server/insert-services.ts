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
        {
          category: 'fortune',
          serviceType: 'palmistry',
          nameKo: 'AI 수상 분석',
          nameEn: 'AI Palmistry',
          descriptionKo: '손금을 분석하여 운세와 성격을 알려드립니다',
          descriptionEn: 'Analyze palm lines to reveal fortune and personality',
          creditCost: 25,
          isActive: true,
        },
        {
          category: 'fortune',
          serviceType: 'horoscope',
          nameKo: 'AI 별자리 운세',
          nameEn: 'AI Horoscope',
          descriptionKo: '서양 별자리 기반 운세를 제공합니다',
          descriptionEn: 'Western zodiac-based fortune reading',
          creditCost: 15,
          isActive: true,
        },
        {
          category: 'fortune',
          serviceType: 'zodiac',
          nameKo: 'AI 띠 운세',
          nameEn: 'AI Chinese Zodiac',
          descriptionKo: '12띠 기반 올해 운세를 제공합니다',
          descriptionEn: 'Chinese zodiac-based yearly fortune',
          creditCost: 15,
          isActive: true,
        },
        {
          category: 'fortune',
          serviceType: 'love-compatibility',
          nameKo: 'AI 연애궁합',
          nameEn: 'AI Love Compatibility',
          descriptionKo: '두 사람의 연애 궁합을 분석합니다',
          descriptionEn: 'Analyze love compatibility between two people',
          creditCost: 20,
          isActive: true,
        },
        {
          category: 'fortune',
          serviceType: 'name-compatibility',
          nameKo: 'AI 이름궁합',
          nameEn: 'AI Name Compatibility',
          descriptionKo: '이름으로 두 사람의 궁합을 분석합니다',
          descriptionEn: 'Analyze compatibility based on names',
          creditCost: 15,
          isActive: true,
        },
        {
          category: 'fortune',
          serviceType: 'marriage-compatibility',
          nameKo: 'AI 결혼궁합',
          nameEn: 'AI Marriage Compatibility',
          descriptionKo: '결혼 궁합을 종합적으로 분석합니다',
          descriptionEn: 'Comprehensive marriage compatibility analysis',
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

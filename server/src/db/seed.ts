import { db } from './index';
import { services, promptTemplates } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed services
  const initialServices = await db.insert(services).values([
    {
      category: 'fortune',
      serviceType: 'face-reading',
      nameKo: 'AI 관상 분석',
      nameEn: 'AI Face Reading',
      descriptionKo: '얼굴 특징을 분석하여 성격과 운세를 알려드립니다',
      descriptionEn: 'Analyze facial features to reveal personality and fortune',
      creditCost: 5,
      isActive: true,
    },
    {
      category: 'fortune',
      serviceType: 'saju',
      nameKo: 'AI 사주팔자',
      nameEn: 'AI Saju (Four Pillars)',
      descriptionKo: '생년월일시를 기반으로 사주를 풀이합니다',
      descriptionEn: 'Interpret your Four Pillars based on birth date and time',
      creditCost: 10,
      isActive: false,
    },
    {
      category: 'fortune',
      serviceType: 'tarot',
      nameKo: 'AI 타로 카드',
      nameEn: 'AI Tarot Reading',
      descriptionKo: '타로 카드로 현재와 미래를 예측합니다',
      descriptionEn: 'Predict present and future with tarot cards',
      creditCost: 8,
      isActive: false,
    },
  ]).returning();

  console.log(`✅ Seeded ${initialServices.length} services`);

  // Seed initial prompt template for face reading
  const faceReadingTemplate = await db.insert(promptTemplates).values({
    serviceType: 'face-reading',
    aiModel: 'gpt-4o-mini',
    version: 'v1.0',
    systemPrompt: `당신은 30년 경력의 전문 관상가입니다.
얼굴의 각 부위가 가진 의미를 깊이 이해하고 있으며,
사람의 성격, 재능, 운세를 정확하게 분석할 수 있습니다.

분석 시 다음을 고려하세요:
- 이마: 지혜, 사고력, 초년운
- 눈: 감정, 통찰력, 인간관계
- 코: 재물운, 자존심, 리더십
- 입: 말솜씨, 식복, 대인관계
- 얼굴형: 기본 성격과 인생 운세

객관적이면서도 따뜻한 조언을 제공하세요.`,
    userPromptTemplate: `다음 얼굴 특징을 바탕으로 관상을 분석해주세요:

이마: {{forehead_description}}
눈: {{eyes_description}}
코: {{nose_description}}
입: {{mouth_description}}
얼굴형: {{face_shape_description}}

JSON 형식으로 다음 항목을 포함하여 응답하세요:
{
  "overall_fortune": "전체 운세 요약 (2-3문장)",
  "personality": {
    "strengths": ["강점1", "강점2", "강점3"],
    "weaknesses": ["약점1", "약점2"],
    "characteristics": "성격 특징 설명 (3-4문장)"
  },
  "fortune_aspects": {
    "wealth": { "score": 75, "description": "재물운 설명" },
    "love": { "score": 80, "description": "애정운 설명" },
    "career": { "score": 85, "description": "직업운 설명" },
    "health": { "score": 70, "description": "건강운 설명" }
  },
  "advice": "인생 조언 (3-4문장)",
  "lucky_elements": {
    "color": "행운의 색",
    "number": "행운의 숫자",
    "direction": "행운의 방향"
  }
}`,
    parameters: {
      temperature: 0.7,
      max_tokens: 2000,
      response_format: 'json',
    },
    outputFormat: 'json',
    description: 'Face reading analysis prompt v1.0',
    author: 'AIMix Team',
    isActive: true,
  }).returning();

  console.log(`✅ Seeded ${faceReadingTemplate.length} prompt templates`);

  console.log('✨ Database seeding completed!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

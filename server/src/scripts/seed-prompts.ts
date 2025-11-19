import { supabase } from '../db/supabase.js';

const PROMPTS = [
  {
    service_type: 'face-reading',
    ai_model: 'gpt-4o-mini',
    version: '1',
    user_prompt_template: `당신은 한국의 관상학 전문가입니다. 제공된 얼굴 사진을 분석하여 관상학적 해석을 제공해주세요.

{{birthDateInfo}}

다음 항목을 포함하여 상세히 분석해주세요:
1. 얼굴형과 전체적인 인상
2. 이마 (재물운, 지혜)
3. 눈 (감정, 인간관계)
4. 코 (재물운, 의지력)
5. 입 (언변, 복록)
6. 귀 (건강, 재물)
7. 전체적인 운세 및 조언

JSON 형식으로 응답해주세요:
{
  "overallImpression": "전체적인 인상",
  "faceShape": { "type": "얼굴형", "meaning": "의미" },
  "forehead": { "analysis": "이마 분석", "fortune": "재물운 및 지혜" },
  "eyes": { "analysis": "눈 분석", "fortune": "감정 및 인간관계운" },
  "nose": { "analysis": "코 분석", "fortune": "재물운 및 의지력" },
  "mouth": { "analysis": "입 분석", "fortune": "언변 및 복록" },
  "ears": { "analysis": "귀 분석", "fortune": "건강 및 재물운" },
  "overallFortune": "전체적인 운세 평가",
  "advice": ["조언 사항들"],
  "luckyColors": ["행운의 색상들"],
  "luckyNumbers": [행운의 숫자들],
  "strengths": ["강점들"],
  "challenges": ["주의할 점들"]
}`,
    output_format: 'json',
    parameters: {},
    is_active: true
  },
  {
    service_type: 'saju',
    ai_model: 'gpt-4o-mini',
    version: '1',
    user_prompt_template: `당신은 한국의 사주팔자 전문가입니다. 다음 정보를 바탕으로 사주를 분석해주세요:

생년월일: {{birthDate}}
태어난 시간: {{birthTime}}
성별: {{gender}}

다음 항목을 포함하여 상세히 분석해주세요:
1. 사주팔자 (천간지지)
2. 오행 분석 (목화토금수)
3. 성격과 재능
4. 재물운
5. 건강운
6. 연애운
7. 사업운
8. 올해 운세
9. 조언

JSON 형식으로 응답해주세요.`,
    output_format: 'json',
    parameters: {},
    is_active: true
  }
];

async function seed() {
  console.log('🌱 Seeding prompt templates using Supabase REST API...');

  try {
    for (const prompt of PROMPTS) {
      // Check if exists
      const { data: existing } = await supabase
        .from('prompt_templates')
        .select('id')
        .eq('service_type', prompt.service_type)
        .eq('version', prompt.version)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('prompt_templates')
          .insert(prompt);

        if (error) {
          console.error(`❌ Failed to create ${prompt.service_type}:`, error.message);
        } else {
          console.log(`✅ Created template for ${prompt.service_type}`);
        }
      } else {
        console.log(`⚠️  Template for ${prompt.service_type} (v${prompt.version}) already exists, skipping...`);
      }
    }

    console.log('✨ Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seed();

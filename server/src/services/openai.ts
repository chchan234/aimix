/**
 * OpenAI API Service
 *
 * Provides vision-based face reading and analysis using GPT-4 Vision
 * Refactored to use centralized OpenAIClient from prompt-engine
 */

import { OpenAIClient } from './prompt-engine/openai-client.js';
import { validateImage } from '../utils/image-validator.js';

// Initialize centralized OpenAI client
const client = new OpenAIClient();

/**
 * Face reading prompt template (관상학)
 */
const FACE_READING_PROMPT = (birthDate?: string) => `
당신은 한국의 관상학 전문가입니다. 제공된 얼굴 사진을 분석하여 관상학적 해석을 제공해주세요.

${birthDate ? `생년월일: ${birthDate}` : ''}

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
  "faceShape": {
    "type": "얼굴형",
    "meaning": "의미"
  },
  "forehead": {
    "analysis": "이마 분석",
    "fortune": "재물운 및 지혜"
  },
  "eyes": {
    "analysis": "눈 분석",
    "fortune": "감정 및 인간관계운"
  },
  "nose": {
    "analysis": "코 분석",
    "fortune": "재물운 및 의지력"
  },
  "mouth": {
    "analysis": "입 분석",
    "fortune": "언변 및 복록"
  },
  "ears": {
    "analysis": "귀 분석",
    "fortune": "건강 및 재물운"
  },
  "overallFortune": "전체적인 운세 평가",
  "advice": ["조언 사항들"],
  "luckyColors": ["행운의 색상들"],
  "luckyNumbers": [행운의 숫자들],
  "strengths": ["강점들"],
  "challenges": ["주의할 점들"]
}
`;

/**
 * Saju (사주팔자) prompt template
 */
const SAJU_PROMPT = (birthDate: string, birthTime: string, gender: 'male' | 'female') => `
당신은 한국의 사주팔자 전문가입니다. 다음 정보를 바탕으로 사주를 분석해주세요:

생년월일: ${birthDate}
태어난 시간: ${birthTime}
성별: ${gender === 'male' ? '남성' : '여성'}

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

JSON 형식으로 응답해주세요:
{
  "saju": "사주팔자",
  "elements": {
    "wood": 0,
    "fire": 0,
    "earth": 0,
    "metal": 0,
    "water": 0
  },
  "personality": "성격과 재능",
  "wealth": "재물운",
  "health": "건강운",
  "love": "연애운",
  "career": "사업운",
  "yearlyFortune": "올해 운세",
  "advice": "조언"
}
`;

/**
 * Tarot reading prompt template
 */
const TAROT_PROMPT = (question: string) => `
당신은 전문 타로 리더입니다. 다음 질문에 대해 타로 카드를 읽어주세요:

질문: ${question}

3장의 카드를 뽑아서 해석해주세요:
1. 과거 카드: 현재 상황의 원인과 배경
2. 현재 카드: 지금의 상황과 에너지
3. 미래 카드: 앞으로의 전망과 결과

각 카드의 의미와 전체적인 해석을 제공해주세요.

JSON 형식으로 응답해주세요:
{
  "cards": [
    {
      "position": "과거",
      "card": "카드 이름",
      "meaning": "카드 의미",
      "interpretation": "해석"
    },
    {
      "position": "현재",
      "card": "카드 이름",
      "meaning": "카드 의미",
      "interpretation": "해석"
    },
    {
      "position": "미래",
      "card": "카드 이름",
      "meaning": "카드 의미",
      "interpretation": "해석"
    }
  ],
  "overallReading": "전체적인 해석",
  "advice": "조언"
}
`;

/**
 * Tojeong Bigyeol (토정비결) prompt template
 */
const TOJEONG_PROMPT = (birthDate: string) => `
당신은 한국의 토정비결 전문가입니다. 다음 생년월일을 바탕으로 올해 운세를 예측해주세요:

생년월일: ${birthDate} (음력 기준으로 변환하여 분석)

토정비결의 전통 방식에 따라 다음 항목을 분석해주세요:
1. 전체 운세
2. 1월부터 12월까지 월별 운세
3. 재물운
4. 건강운
5. 가정운
6. 올해의 행운 키워드

JSON 형식으로 응답해주세요:
{
  "overallFortune": "전체 운세",
  "monthlyFortune": [
    {"month": 1, "fortune": "1월 운세"},
    {"month": 2, "fortune": "2월 운세"},
    {"month": 3, "fortune": "3월 운세"},
    {"month": 4, "fortune": "4월 운세"},
    {"month": 5, "fortune": "5월 운세"},
    {"month": 6, "fortune": "6월 운세"},
    {"month": 7, "fortune": "7월 운세"},
    {"month": 8, "fortune": "8월 운세"},
    {"month": 9, "fortune": "9월 운세"},
    {"month": 10, "fortune": "10월 운세"},
    {"month": 11, "fortune": "11월 운세"},
    {"month": 12, "fortune": "12월 운세"}
  ],
  "wealth": "재물운",
  "health": "건강운",
  "family": "가정운",
  "luckyKeywords": ["키워드1", "키워드2", "키워드3"]
}
`;

/**
 * Analyze face from image for fortune reading (얼굴운세)
 * @param imageUrl - URL of the face image to analyze
 * @param birthDate - Optional birth date for enhanced analysis
 */
export async function analyzeFaceReading(imageUrl: string, birthDate?: string) {
  try {
    const prompt = FACE_READING_PROMPT(birthDate);

    const response = await client.vision(imageUrl, prompt, {
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: 'json',
    });

    const analysis = client.parseJSON(response.content);

    return {
      success: true,
      analysis,
      model: 'gpt-4o-mini',
    };
  } catch (error) {
    console.error('OpenAI face reading error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze face from base64 image data
 * @param base64Image - Base64 encoded image (with data:image/... prefix)
 * @param birthDate - Optional birth date for enhanced analysis
 */
export async function analyzeFaceReadingFromBase64(base64Image: string, birthDate?: string) {
  try {
    // Ensure base64 image has the correct format
    let imageData = base64Image;
    if (!imageData.startsWith('data:image/')) {
      imageData = `data:image/jpeg;base64,${base64Image}`;
    }

    // Validate image size and format
    validateImage(imageData);

    return await analyzeFaceReading(imageData, birthDate);
  } catch (error) {
    console.error('OpenAI face reading error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze Saju (사주팔자) using GPT-4
 */
export async function analyzeSaju(birthDate: string, birthTime: string, gender: 'male' | 'female') {
  try {
    const prompt = SAJU_PROMPT(birthDate, birthTime, gender);

    const response = await client.chat(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        maxTokens: 2000,
        responseFormat: 'json',
      }
    );

    const analysis = client.parseJSON(response.content);

    return {
      success: true,
      analysis,
      model: 'gpt-4o-mini',
    };
  } catch (error) {
    console.error('OpenAI Saju analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Read Tarot cards using GPT-4
 */
export async function readTarot(question: string) {
  try {
    const prompt = TAROT_PROMPT(question);

    const response = await client.chat(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.8,
        maxTokens: 2000,
        responseFormat: 'json',
      }
    );

    const reading = client.parseJSON(response.content);

    return {
      success: true,
      reading,
      model: 'gpt-4o-mini',
    };
  } catch (error) {
    console.error('OpenAI Tarot reading error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Predict fortune using Tojeong Bigyeol (토정비결)
 */
export async function predictTojeong(birthDate: string) {
  try {
    const prompt = TOJEONG_PROMPT(birthDate);

    const response = await client.chat(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        maxTokens: 2000,
        responseFormat: 'json',
      }
    );

    const prediction = client.parseJSON(response.content);

    return {
      success: true,
      prediction,
      model: 'gpt-4o-mini',
    };
  } catch (error) {
    console.error('OpenAI Tojeong prediction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default {
  analyzeFaceReading,
  analyzeFaceReadingFromBase64,
  analyzeSaju,
  readTarot,
  predictTojeong,
};

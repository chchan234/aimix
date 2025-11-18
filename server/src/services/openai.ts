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
  "saju": "사주팔자를 한 줄로 표현 (예: 연주 경자년, 월주 신축월, 일주 신축일, 시주 임신시)",
  "elements": {
    "wood": 0,
    "fire": 0,
    "earth": 0,
    "metal": 0,
    "water": 0
  },
  "personality": "성격과 재능에 대한 상세한 설명",
  "wealth": "재물운에 대한 상세한 설명",
  "health": "건강운에 대한 상세한 설명",
  "love": "연애운에 대한 상세한 설명",
  "career": "사업운에 대한 상세한 설명",
  "yearlyFortune": "올해 운세에 대한 상세한 설명",
  "advice": "조언 및 주의사항"
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

export default {
  analyzeFaceReading,
  analyzeFaceReadingFromBase64,
  analyzeSaju,
};

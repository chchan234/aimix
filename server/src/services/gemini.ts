/**
 * Google Gemini API Service
 *
 * Provides AI text generation and analysis using Google's Gemini model
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate text using Gemini 1.5 Flash model
 */
export async function generateText(prompt: string) {
  try {
    // Using gemini-2.5-flash-image-preview (nanobanana) for image editing
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      text,
      model: 'gemini-1.5-flash'
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Analyze name using Gemini (성명학 분석)
 * @param name - Korean name to analyze
 * @param birthDate - Birth date (YYYY-MM-DD)
 */
export async function analyzeNameMeaning(name: string, birthDate?: string) {
  const prompt = `
당신은 한국의 성명학 전문가입니다. 다음 이름을 분석해주세요:

이름: ${name}
${birthDate ? `생년월일: ${birthDate}` : ''}

다음 항목을 포함하여 상세히 분석해주세요:
1. 이름의 의미와 유래
2. 한자 뜻 (가능한 경우)
3. 음양오행 분석
4. 이름에 담긴 긍정적 의미
5. 전체적인 운세 평가

JSON 형식으로 응답해주세요:
{
  "name": "이름",
  "meaning": "이름의 의미",
  "hanja": "한자 표기",
  "elements": "음양오행 분석",
  "positiveTraits": ["긍정적 특성들"],
  "fortune": "전체 운세 평가",
  "luckyNumbers": [행운의 숫자들],
  "luckyColors": ["행운의 색상들"]
}
`;

  const result = await generateText(prompt);

  if (result.success && result.text) {
    try {
      // Extract JSON from response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          analysis
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
    }

    // Return raw text if JSON parsing fails
    return {
      success: true,
      rawText: result.text
    };
  }

  return result;
}

/**
 * Generate creative story using Gemini
 */
export async function generateStory(theme: string, length: 'short' | 'medium' | 'long' = 'medium') {
  const lengthMap = {
    short: '200-300',
    medium: '500-700',
    long: '1000-1500'
  };

  const prompt = `
다음 주제로 창의적인 이야기를 작성해주세요:

주제: ${theme}
길이: ${lengthMap[length]}자 내외

이야기는 다음 요소를 포함해야 합니다:
1. 흥미로운 도입부
2. 명확한 갈등 또는 문제
3. 반전이나 흥미로운 전개
4. 만족스러운 결말

한국어로 작성하고, 읽기 쉽게 문단을 나누어주세요.
`;

  return await generateText(prompt);
}

/**
 * Interpret dream using Gemini (꿈 해몽)
 */
export async function interpretDream(dreamDescription: string) {
  const prompt = `
당신은 한국의 꿈 해몽 전문가입니다. 다음 꿈을 해석해주세요:

꿈 내용: ${dreamDescription}

다음 항목을 포함하여 해석해주세요:
1. 꿈의 전체적인 의미
2. 주요 상징과 해석
3. 심리적 의미
4. 긍정적 메시지
5. 주의사항 (있다면)

JSON 형식으로 응답해주세요:
{
  "overallMeaning": "전체적인 의미",
  "symbols": [
    {"symbol": "상징", "meaning": "의미"}
  ],
  "psychologicalMeaning": "심리적 의미",
  "positiveMessage": "긍정적 메시지",
  "warnings": ["주의사항들"],
  "luckyNumbers": [행운의 숫자들]
}
`;

  const result = await generateText(prompt);

  if (result.success && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const interpretation = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          interpretation
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
    }

    return {
      success: true,
      rawText: result.text
    };
  }

  return result;
}

/**
 * Analyze Saju (사주팔자) using Gemini
 */
export async function analyzeSaju(birthDate: string, birthTime: string, gender: 'male' | 'female') {
  const prompt = `
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

  const result = await generateText(prompt);

  if (result.success && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          analysis
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
    }

    return {
      success: true,
      rawText: result.text
    };
  }

  return result;
}

/**
 * Read Tarot cards using Gemini (타로 카드)
 */
export async function readTarot(question: string) {
  const prompt = `
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

  const result = await generateText(prompt);

  if (result.success && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const reading = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          reading
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
    }

    return {
      success: true,
      rawText: result.text
    };
  }

  return result;
}

/**
 * Predict fortune using Tojeong Bigyeol (토정비결)
 */
export async function predictTojeong(birthDate: string) {
  const prompt = `
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
    ...
  ],
  "wealth": "재물운",
  "health": "건강운",
  "family": "가정운",
  "luckyKeywords": ["키워드1", "키워드2", "키워드3"]
}
`;

  const result = await generateText(prompt);

  if (result.success && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const prediction = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          prediction
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
    }

    return {
      success: true,
      rawText: result.text
    };
  }

  return result;
}

export default {
  generateText,
  analyzeNameMeaning,
  generateStory,
  interpretDream,
  analyzeSaju,
  readTarot,
  predictTojeong
};

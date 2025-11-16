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
    // Using gemini-1.5-flash for free tier
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
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

export default {
  generateText,
  analyzeNameMeaning,
  generateStory,
  interpretDream
};

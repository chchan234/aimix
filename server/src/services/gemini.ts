/**
 * Google Gemini API Service
 *
 * Provides AI text generation and analysis using Google's Gemini model
 * Refactored to use centralized GeminiClient from prompt-engine
 */

import { GeminiClient } from './prompt-engine/gemini-client.js';

// Lazy initialization - only create client when needed and API key exists
let client: GeminiClient | null = null;

function getClient(): GeminiClient {
  if (!client) {
    client = new GeminiClient();
  }
  return client;
}

/**
 * Name analysis prompt template (성명학)
 */
const NAME_ANALYSIS_PROMPT = (name: string, birthDate?: string) => `
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

/**
 * Story generation prompt template
 */
const STORY_PROMPT = (theme: string, length: 'short' | 'medium' | 'long') => {
  const lengthMap = {
    short: '200-300',
    medium: '500-700',
    long: '1000-1500'
  };

  return `
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
};

/**
 * Generate text using Gemini 1.5 Flash model
 */
export async function generateText(prompt: string) {
  try {
    const response = await getClient().generateText(prompt);

    return {
      success: true,
      text: response.content,
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
  try {
    const prompt = NAME_ANALYSIS_PROMPT(name, birthDate);
    const response = await getClient().generateText(prompt);
    const analysis = getClient().parseJSON(response.content);

    return {
      success: true,
      analysis
    };
  } catch (error) {
    console.error('Gemini name analysis error:', error);
    // Try to return raw text if JSON parsing fails
    try {
      const response = await getClient().generateText(NAME_ANALYSIS_PROMPT(name, birthDate));
      return {
        success: true,
        rawText: response.content
      };
    } catch (innerError) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Generate creative story using Gemini
 */
export async function generateStory(theme: string, length: 'short' | 'medium' | 'long' = 'medium') {
  const prompt = STORY_PROMPT(theme, length);
  return await generateText(prompt);
}

export default {
  generateText,
  analyzeNameMeaning,
  generateStory,
};

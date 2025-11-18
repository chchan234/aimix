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

/**
 * Image Generation & Editing Services
 */

// 1. Profile Generator - AI 프로필 생성
export async function generateProfile(description: string, style: string = 'professional') {
  try {
    const prompt = `Create a high-quality ${style} profile picture with the following characteristics: ${description}.
    Style: ${style === 'professional' ? 'Professional headshot, business attire, neutral background' :
            style === 'casual' ? 'Casual and friendly, relaxed setting' :
            style === 'artistic' ? 'Creative and artistic, unique composition' : style}
    Make it photorealistic and high resolution.`;

    const response = await getClient().generateImage(prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Profile generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 2. Caricature - 캐리커쳐 변환
export async function generateCaricature(imageBase64: string, exaggerationLevel: string = 'medium') {
  try {
    const levelMap = {
      low: 'subtle exaggeration, maintain realistic features',
      medium: 'moderate caricature style with emphasized features',
      high: 'strong caricature effect with highly exaggerated features'
    };

    const prompt = `Transform this photo into a caricature drawing.
    Style: ${levelMap[exaggerationLevel as keyof typeof levelMap] || levelMap.medium}
    Keep the person recognizable but add artistic caricature elements.
    Use vibrant colors and cartoon-style rendering.`;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Caricature generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 3. ID Photo - 증명사진
export async function generateIdPhoto(imageBase64: string, backgroundColor: string = 'white') {
  try {
    const prompt = `Transform this photo into a professional ID/passport photo format:
    - Remove or replace background with solid ${backgroundColor} color
    - Center the face properly
    - Ensure proper lighting and contrast
    - Professional expression
    - Standard ID photo composition
    - High quality and sharp details`;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('ID photo generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 4. Face Swap - 얼굴 바꾸기
export async function swapFaces(sourceImageBase64: string, targetImageBase64: string) {
  try {
    const prompt = `Create a face swap between these two images.
    Take the face from the first image and seamlessly blend it onto the second image's head/body.
    Maintain natural skin tones, lighting, and perspective.
    Ensure realistic and high-quality blending.`;

    // Use editImageWithReference to process both images
    const response = await getClient().editImageWithReference(
      sourceImageBase64,
      targetImageBase64,
      prompt
    );

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.5-flash-image'
    };
  } catch (error) {
    console.error('Face swap error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 5. Age Transform - 나이 변환
export async function transformAge(imageBase64: string, targetAge: number) {
  try {
    const prompt = `Transform this person to look like they are ${targetAge} years old.
    - Adjust facial features naturally (wrinkles, skin texture, etc.)
    - Modify hair (graying, thinning, etc. if appropriate)
    - Keep the person recognizable
    - Maintain photorealistic quality
    - Natural aging progression`;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Age transform error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 6. Gender Swap - 성별 바꾸기
export async function swapGender(imageBase64: string) {
  try {
    const prompt = `Transform this person to the opposite gender while maintaining their recognizable features.
    - Adjust facial structure naturally
    - Modify hairstyle appropriately
    - Adjust makeup and features
    - Keep photorealistic quality
    - Maintain the person's essential characteristics`;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Gender swap error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 7. Colorization - 흑백사진 컬러화
export async function colorizePhoto(imageBase64: string) {
  try {
    const prompt = `Colorize this black and white photo with realistic, historically accurate colors.
    - Add natural skin tones
    - Use period-appropriate clothing colors
    - Ensure realistic color saturation
    - Maintain photo quality and details
    - Natural and believable color palette`;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Colorization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 8. Background Removal - 배경 제거
export async function removeBackground(imageBase64: string, newBackground: string = 'transparent') {
  try {
    const prompt = `Remove the background from this image and replace it with ${newBackground === 'transparent' ? 'a transparent/white background' : newBackground}.
    - Keep the main subject intact with clean edges
    - Preserve fine details (hair, etc.)
    - Professional background removal quality
    - Smooth edge transitions`;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Background removal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 9. Hairstyle - 헤어스타일 변경
export async function changeHairstyle(imageBase64: string, hairstyleDescription: string) {
  try {
    const prompt = `Change the hairstyle in this photo to: ${hairstyleDescription}
    - Maintain the person's face and features
    - Natural hair color and texture (unless specified otherwise)
    - Photorealistic hair rendering
    - Proper hair physics and flow
    - Professional salon-quality result`;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Hairstyle change error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 10. Tattoo - 타투 시뮬레이션
export async function addTattoo(imageBase64: string, tattooDescription: string, placement: string) {
  try {
    const prompt = `Add a ${tattooDescription} tattoo to this photo on the ${placement}.
    - Realistic tattoo appearance
    - Follow body contours naturally
    - Appropriate shading and depth
    - Professional tattoo art quality
    - Blend naturally with skin tone`;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Tattoo simulation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default {
  generateText,
  analyzeNameMeaning,
  generateStory,
  // Image services
  generateProfile,
  generateCaricature,
  generateIdPhoto,
  swapFaces,
  transformAge,
  swapGender,
  colorizePhoto,
  removeBackground,
  changeHairstyle,
  addTattoo,
};

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

// 1. Professional Headshot - AI 프로페셔널 헤드샷 (이미지 업로드 방식으로 변경)
export async function generateProfessionalHeadshot(imageBase64: string, style: string = 'professional') {
  try {
    const stylePrompts = {
      professional: 'Transform this photo into a professional LinkedIn-style headshot. Studio lighting, clean neutral background (light gray or white), business professional attire, confident expression, perfect focus on face.',
      business: 'Transform this into a formal business portrait. Premium studio quality, dark professional background, business formal attire, dignified and authoritative presence.',
      casual: 'Transform this into a professional casual portrait. Natural lighting, soft background, business casual attire, friendly and approachable expression.'
    };

    const prompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.professional;

    const response = await getClient().editImage(imageBase64, prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Professional headshot generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 구버전 호환성을 위해 유지
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

// 11. Lookalike Finder - 닮은꼴 찾기
export async function findLookalike(imageBase64: string, category: 'celebrity' | 'anime' | 'animal') {
  try {
    const categoryPrompts = {
      celebrity: `한국 연예인(K-pop 아이돌, 배우, 가수) 중에서 이 사람과 가장 닮은 연예인을 찾아주세요.
        닮은 연예인 3명을 유사도 순으로 분석해주세요.`,
      anime: `애니메이션/만화 캐릭터(디즈니, 지브리, 일본 애니메이션 등) 중에서 이 사람과 가장 닮은 캐릭터를 찾아주세요.
        닮은 캐릭터 3명을 유사도 순으로 분석해주세요.`,
      animal: `동물 중에서 이 사람과 가장 닮은 동물을 찾아주세요.
        닮은 동물 3가지를 유사도 순으로 분석해주세요.`
    };

    const prompt = `이 사진 속 사람의 얼굴을 분석해주세요.

${categoryPrompts[category]}

다음 JSON 형식으로 응답해주세요:
{
  "matches": [
    {
      "name": "닮은 대상 이름",
      "similarity": 85,
      "reason": "닮은 이유 설명 (눈매, 코, 입술, 전체적인 인상 등)",
      "characteristics": ["특징1", "특징2", "특징3"]
    }
  ],
  "faceAnalysis": {
    "faceShape": "얼굴형",
    "eyeType": "눈 특징",
    "noseType": "코 특징",
    "lipType": "입술 특징",
    "overallImpression": "전체적인 인상"
  },
  "funComment": "재미있는 한 줄 코멘트"
}`;

    const client = getClient();
    const response = await client.analyzeImageWithText(imageBase64, prompt);

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON not found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis result'
      };
    }

    return {
      success: true,
      analysis,
      category,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Lookalike finder error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// NEW SERVICES

// 12. Pet Soulmate - AI 반려동물 소울메이트
export async function analyzePetSoulmate(imageBase64: string) {
  try {
    const prompt = `이 반려동물의 사진을 보고 재미있고 창의적으로 분석해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "animalType": "동물 종류 (예: 강아지, 고양이)",
  "breed": "품종 (추정)",
  "pastLife": {
    "job": "전생의 직업 (예: 힙합 아티스트, 재벌 회장, 요가 강사 등)",
    "era": "시대 (예: 1990년대, 고려시대 등)",
    "description": "전생에 대한 재미있는 설명"
  },
  "mbti": "MBTI 성격 유형",
  "mbtiDescription": "MBTI에 대한 설명",
  "ownerCompatibility": {
    "score": 95,
    "description": "주인과의 궁합 설명"
  },
  "personalityTraits": ["성격 특징1", "성격 특징2", "성격 특징3"],
  "funComment": "재미있는 한 줄 코멘트"
}`;

    const client = getClient();
    const response = await client.analyzeImageWithText(imageBase64, prompt);

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON not found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis result'
      };
    }

    return {
      success: true,
      analysis,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Pet soulmate analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 13. Baby Face Prediction - 2세 얼굴 예측
export async function generateBabyFace(parent1Base64: string, parent2Base64: string, style: string = 'normal') {
  try {
    console.log('🍼 Starting baby face generation...');
    console.log(`Parent 1 image size: ${parent1Base64.length} chars`);
    console.log(`Parent 2 image size: ${parent2Base64.length} chars`);
    console.log(`Style: ${style}`);

    const client = getClient();

    // Detailed parent analysis prompt
    const analysisPrompt = `이 사람의 얼굴 특징을 매우 상세하게 분석해주세요. 다음 항목들을 구체적으로 설명해주세요:

1. 얼굴형: 계란형/둥근형/각진형/긴형/하트형 등
2. 이마: 넓이, 높이, 모양
3. 눈:
   - 크기 (큰/중간/작은)
   - 모양 (둥근/아몬드형/고양이눈/처진눈)
   - 쌍꺼풀 유무 및 종류
   - 눈 사이 거리
   - 눈썹 모양과 굵기
4. 코:
   - 길이 (긴/중간/짧은)
   - 콧대 높이
   - 코끝 모양 (둥근/뾰족/올라간/내려간)
   - 콧볼 너비
5. 입:
   - 입술 두께 (두꺼운/중간/얇은)
   - 입술 모양
   - 입꼬리 방향
   - 인중 길이
6. 턱과 광대:
   - 턱선 모양
   - 광대뼈 위치와 돌출 정도
7. 피부톤: 밝기와 색조
8. 전체적인 인상과 분위기

각 특징을 구체적인 수치나 비유를 사용해 최대한 자세히 설명해주세요.`;

    // First analyze both parents
    console.log('📸 Analyzing parent 1 facial features...');
    const parent1Analysis = await client.analyzeImageWithText(parent1Base64, analysisPrompt);
    console.log('✅ Parent 1 analysis complete:', parent1Analysis.substring(0, 100) + '...');

    console.log('📸 Analyzing parent 2 facial features...');
    const parent2Analysis = await client.analyzeImageWithText(parent2Base64, analysisPrompt);
    console.log('✅ Parent 2 analysis complete:', parent2Analysis.substring(0, 100) + '...');

    // Style-specific instructions
    const styleInstructions = style === 'idol'
      ? `스타일 지시사항:
- 아이돌처럼 이상적인 비율과 매력적인 외모로 생성
- 또렷한 이목구비와 밝은 피부톤
- 큰 눈과 오똑한 코
- 전체적으로 귀엽고 예쁜 인상`
      : `스타일 지시사항:
- 가장 현실적이고 자연스러운 아기 얼굴 생성
- 부모의 특징이 자연스럽게 조합된 모습`;

    // Generate baby based on combined features with detailed genetic guidance
    const combinedPrompt = `두 부모의 얼굴 특징을 분석한 결과를 바탕으로 이들의 아기 얼굴을 생성해주세요.

[부모 1 얼굴 특징]
${parent1Analysis}

[부모 2 얼굴 특징]
${parent2Analysis}

[유전적 특징 조합 가이드라인]
아기의 각 부위는 다음과 같이 부모의 특징을 조합해주세요:

1. 눈:
   - 쌍꺼풀은 우성이므로, 한 명이라도 쌍꺼풀이면 아기도 쌍꺼풀
   - 눈 크기는 두 부모의 중간 또는 큰 쪽을 따름
   - 눈 모양은 두 부모의 특징을 블렌딩

2. 코:
   - 콧대 높이는 두 부모의 중간값
   - 코끝 모양은 둘 중 하나를 선택적으로 반영
   - 콧볼 너비는 중간값

3. 입:
   - 입술 두께는 두꺼운 쪽이 우성
   - 입 모양은 두 부모의 블렌딩

4. 얼굴형:
   - 두 부모 얼굴형의 중간 형태
   - 아기 특유의 통통한 볼살 반영

5. 피부톤:
   - 두 부모 피부톤의 중간값

[아기 특징 반영]
- 나이: 1-2세 아기
- 아기 특유의 통통한 볼
- 작고 귀여운 코
- 맑고 큰 눈
- 부드러운 피부결
- 자연스러운 표정 (웃는 표정 또는 천진난만한 표정)

${styleInstructions}

[중요]
- 반드시 두 부모의 특징이 명확하게 드러나는 아기를 생성해주세요
- 부모를 보면 "닮았다"고 느낄 수 있도록 특징적인 부분을 강조해주세요
- 고화질의 선명한 아기 사진을 생성해주세요
- 배경은 단순하게, 아기 얼굴이 중심이 되도록 해주세요`;

    console.log('🎨 Generating baby face image...');
    console.log('Combined prompt length:', combinedPrompt.length);
    const response = await client.generateImage(combinedPrompt);
    console.log('✅ Baby face image generated successfully');

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.5-flash-image'
    };
  } catch (error) {
    console.error('❌ Baby face generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 14. Celebrity Doppelganger 2.0 - 연예인 도플갱어 상세 분석
export async function findCelebrityDoppelganger(imageBase64: string) {
  try {
    const prompt = `이 사진 속 사람의 얼굴을 매우 상세하게 분석해주세요.

한국 연예인(K-pop 아이돌, 배우, 가수) 중에서 이 사람과 가장 닮은 연예인 TOP 3을 찾아주세요.
각 연예인에 대해 어떤 특징이 닮았는지 구체적으로 분석해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "faceAnalysis": {
    "faceShape": "얼굴형 (예: 계란형, 둥근형 등)",
    "eyeShape": "눈 모양 상세 설명",
    "eyeSize": "눈 크기",
    "noseShape": "코 모양 상세 설명",
    "lipShape": "입술 모양 상세 설명",
    "jawline": "턱선 설명",
    "cheekbones": "광대 설명",
    "overallImpression": "전체적인 인상"
  },
  "celebrityMatches": [
    {
      "name": "연예인 이름",
      "similarity": 88,
      "matchingFeatures": {
        "eyes": "눈 부분이 닮은 이유 상세 설명",
        "nose": "코 부분이 닮은 이유 상세 설명 (닮지 않으면 null)",
        "lips": "입술 부분이 닮은 이유 상세 설명 (닮지 않으면 null)",
        "face": "전체 얼굴형이 닮은 이유 상세 설명 (닮지 않으면 null)",
        "overall": "전체적으로 닮은 이유 요약"
      }
    }
  ],
  "funComment": "재미있는 한 줄 코멘트"
}`;

    const client = getClient();
    const response = await client.analyzeImageWithText(imageBase64, prompt);

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON not found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis result'
      };
    }

    return {
      success: true,
      analysis,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Celebrity doppelganger analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// HEALTH SERVICES

// 16. Body Type Analysis - AI 체형 분석
export async function analyzeBodyType(imageBase64: string) {
  try {
    const prompt = `이 전신 사진을 분석하여 체형을 진단해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "bodyType": "체형 유형 (예: 역삼각형, 직사각형, 사과형, 배형, 모래시계형)",
  "proportions": {
    "shoulder": "어깨 설명",
    "waist": "허리 설명",
    "hip": "힙 설명",
    "legs": "다리 설명"
  },
  "exerciseRecommendations": [
    {
      "exercise": "운동 이름",
      "reason": "추천 이유",
      "frequency": "권장 빈도"
    }
  ],
  "fashionRecommendations": {
    "tops": ["상의 추천1", "상의 추천2"],
    "bottoms": ["하의 추천1", "하의 추천2"],
    "avoid": ["피해야 할 스타일"],
    "tips": "전체적인 패션 팁"
  },
  "postureAnalysis": {
    "current": "현재 자세 분석",
    "improvements": ["개선점1", "개선점2"]
  },
  "overallComment": "전체적인 코멘트"
}`;

    const client = getClient();
    const response = await client.analyzeImageWithText(imageBase64, prompt);

    let analysis;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON not found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis result'
      };
    }

    return {
      success: true,
      analysis,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Body type analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 17. Skin Analysis - AI 피부 분석
export async function analyzeSkin(imageBase64: string) {
  try {
    const prompt = `이 얼굴 사진을 분석하여 피부 상태를 진단해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "skinType": "피부 타입 (건성, 지성, 복합성, 중성, 민감성)",
  "skinAge": "피부 나이 (예: 25세)",
  "conditions": {
    "hydration": {
      "level": "수분도 레벨 (1-10)",
      "description": "수분 상태 설명"
    },
    "oiliness": {
      "level": "유분도 레벨 (1-10)",
      "description": "유분 상태 설명"
    },
    "sensitivity": {
      "level": "민감도 레벨 (1-10)",
      "description": "민감도 설명"
    },
    "elasticity": {
      "level": "탄력도 레벨 (1-10)",
      "description": "탄력 상태 설명"
    }
  },
  "concerns": ["피부 고민1", "피부 고민2"],
  "skincare": {
    "morning": ["아침 루틴1", "아침 루틴2"],
    "evening": ["저녁 루틴1", "저녁 루틴2"],
    "weekly": ["주간 케어1", "주간 케어2"]
  },
  "ingredients": {
    "recommended": ["추천 성분1", "추천 성분2"],
    "avoid": ["피해야 할 성분1", "피해야 할 성분2"]
  },
  "lifestyle": ["라이프스타일 조언1", "라이프스타일 조언2"],
  "overallComment": "전체적인 피부 상태 요약"
}`;

    const client = getClient();
    const response = await client.analyzeImageWithText(imageBase64, prompt);

    let analysis;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON not found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis result'
      };
    }

    return {
      success: true,
      analysis,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Skin analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 18. BMI Calculator - AI BMI 계산기
export async function calculateBMI(height: number, weight: number, age: number, gender: 'male' | 'female') {
  try {
    const bmi = weight / ((height / 100) ** 2);
    const bmiRounded = Math.round(bmi * 10) / 10;

    const prompt = `다음 정보를 바탕으로 BMI 분석 결과를 제공해주세요:

키: ${height}cm
체중: ${weight}kg
나이: ${age}세
성별: ${gender === 'male' ? '남성' : '여성'}
계산된 BMI: ${bmiRounded}

다음 JSON 형식으로 응답해주세요:
{
  "bmi": ${bmiRounded},
  "category": "BMI 분류 (저체중, 정상, 과체중, 비만)",
  "idealWeight": {
    "min": 이상적인 체중 최소값,
    "max": 이상적인 체중 최대값,
    "description": "이상적인 체중 범위 설명"
  },
  "healthRisks": ["건강 위험 요소1", "건강 위험 요소2"],
  "recommendations": {
    "diet": ["식단 추천1", "식단 추천2"],
    "exercise": ["운동 추천1", "운동 추천2"],
    "lifestyle": ["생활습관 조언1", "생활습관 조언2"]
  },
  "dailyCalories": {
    "maintain": 유지 칼로리,
    "lose": 감량 칼로리,
    "gain": 증량 칼로리
  },
  "metabolicAge": "대사 나이 추정",
  "overallComment": "전체적인 건강 상태 요약"
}`;

    const client = getClient();
    const response = await client.generateText(prompt);

    let analysis;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON not found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis result'
      };
    }

    return {
      success: true,
      analysis,
      model: 'gemini-1.5-flash'
    };
  } catch (error) {
    console.error('BMI calculation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 15. Personal Color Analysis - 퍼스널 컬러 진단
export async function analyzePersonalColor(imageBase64: string) {
  try {
    const prompt = `이 사진 속 사람의 피부톤을 분석하여 퍼스널 컬러를 진단해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "personalColor": "진단 결과 (Spring Warm, Summer Cool, Autumn Warm, Winter Cool 중 하나)",
  "confidence": 85,
  "skinAnalysis": {
    "undertone": "피부 언더톤 (따뜻한, 차가운, 중성)",
    "brightness": "피부 밝기 (밝음, 보통, 어두움)",
    "saturation": "채도",
    "description": "피부톤 상세 설명"
  },
  "recommendedColors": {
    "best": ["어울리는 색상1", "어울리는 색상2", "어울리는 색상3"],
    "avoid": ["피해야 할 색상1", "피해야 할 색상2"]
  },
  "makeupRecommendations": {
    "lipstick": ["추천 립스틱 색상1", "추천 립스틱 색상2"],
    "eyeshadow": ["추천 아이섀도우 톤"],
    "blush": ["추천 블러셔 색상"]
  },
  "clothingRecommendations": {
    "colors": ["옷 추천 색상1", "옷 추천 색상2", "옷 추천 색상3"],
    "metals": "어울리는 금속 (골드 or 실버)",
    "description": "어울리는 옷 스타일 설명"
  },
  "explanation": "이 진단 결과에 대한 상세한 설명"
}`;

    const client = getClient();
    const response = await client.analyzeImageWithText(imageBase64, prompt);

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON not found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis result'
      };
    }

    return {
      success: true,
      analysis,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Personal color analysis error:', error);
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
  generateProfessionalHeadshot,
  generateCaricature,
  generateIdPhoto,
  transformAge,
  swapGender,
  colorizePhoto,
  removeBackground,
  changeHairstyle,
  addTattoo,
  findLookalike,
  // New services
  analyzePetSoulmate,
  generateBabyFace,
  findCelebrityDoppelganger,
  analyzePersonalColor,
  // Health services
  analyzeBodyType,
  analyzeSkin,
  calculateBMI,
};

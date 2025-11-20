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
    "job": "전생의 직업 (예: 궁중 악사, 서당 훈장, 로마 검투사, 이집트 서기관 등 역사적 직업)",
    "era": "역사적 시대만 사용 (예: 조선시대, 고려시대, 삼국시대, 로마시대, 중세 유럽 등) - 절대로 1900년대 이후의 현대는 사용하지 마세요",
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

[매우 중요 - 인종/민족 특성]
1. 인종/민족 특성: 동양인(한국인/일본인/중국인 등)/서양인/혼혈 등
   - 이 특성은 아기 생성 시 반드시 보존되어야 합니다

2. 얼굴형: 계란형/둥근형/각진형/긴형/하트형 등
3. 이마: 넓이, 높이, 모양
4. 눈:
   - 크기 (큰/중간/작은)
   - 모양 (둥근/아몬드형/고양이눈/처진눈)
   - 쌍꺼풀 유무 및 종류 (동양인의 경우 무쌍/속쌍/겉쌍 구분)
   - 눈 사이 거리
   - 눈썹 모양과 굵기
5. 코:
   - 길이 (긴/중간/짧은)
   - 콧대 높이
   - 코끝 모양 (둥근/뾰족/올라간/내려간)
   - 콧볼 너비
6. 입:
   - 입술 두께 (두꺼운/중간/얇은)
   - 입술 모양
   - 입꼬리 방향
   - 인중 길이
7. 턱과 광대:
   - 턱선 모양
   - 광대뼈 위치와 돌출 정도
8. 피부톤: 밝기와 색조 (동양인 특유의 피부톤 등)
9. 전체적인 인상과 분위기

각 특징을 구체적인 수치나 비유를 사용해 최대한 자세히 설명해주세요.
인종/민족 특성은 반드시 명시해주세요.`;

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

[매우 중요 - 인종/민족 특성 보존]
- 부모가 동양인(한국인)이면 아기도 반드시 동양인(한국인) 아기여야 합니다
- 부모가 서양인이면 아기도 반드시 서양인 아기여야 합니다
- 부모의 인종/민족적 특성(피부톤, 눈 모양, 얼굴 구조 등)을 아기에게 정확히 반영해주세요
- 동양인 부모의 경우: 검은 머리카락, 동양인 특유의 눈 모양, 적절한 피부톤을 반드시 반영

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
    const prompt = `당신은 20년 경력의 체형 분석 전문가이자 피트니스 마스터 트레이너입니다. 연예인, 모델, 운동선수들의 바디 프로필을 담당해왔으며, '나에게 맞는 운동법' 저자입니다. 수천 명의 체형 분석과 맞춤 운동 프로그램을 제공했습니다.

이 전신 사진을 분석하여 체형을 정밀 진단해주세요.

[분석 지침]

1. 톤앤매너
- "오! 당신의 체형은..." 같이 분석하는 순간의 느낌 전달
- "~것으로 보입니다" 같은 AI스러운 표현 절대 금지
- 긍정적이고 동기부여가 되는 톤
- 체형의 장점을 먼저 강조

2. 재미 요소
- 같은 체형의 연예인/셀럽 예시
- "이 체형 사람들만 잘 어울리는" 패션 포인트
- SNS에 공유하고 싶은 내 체형 강점

3. 실용적 가치
- "이 운동은 주 3회, 세트당 15회씩" 같은 구체적 수치
- 바로 쇼핑할 때 찾을 수 있는 패션 키워드
- 체형 보완을 위한 실천 가능한 팁

다음 JSON 형식으로 응답해주세요:
{
  "bodyType": "체형 유형 (역삼각형/직사각형/사과형/배형/모래시계형/타원형)",
  "bodyTypeDescription": "이 체형에 대한 친근한 설명",
  "firstImpression": "체형을 본 첫 인상과 강점",
  "proportions": {
    "shoulder": {
      "description": "어깨 상세 분석",
      "ratio": "어깨 비율"
    },
    "waist": {
      "description": "허리 상세 분석",
      "ratio": "허리 비율"
    },
    "hip": {
      "description": "힙 상세 분석",
      "ratio": "힙 비율"
    },
    "legs": {
      "description": "다리 상세 분석",
      "ratio": "상체 대비 하체 비율"
    }
  },
  "strengths": ["이 체형의 강점들"],
  "celebrityMatch": "같은 체형의 연예인/셀럽",
  "exerciseRecommendations": {
    "priority": [
      {
        "exercise": "최우선 운동",
        "reason": "추천 이유",
        "sets": "세트 수",
        "reps": "반복 횟수",
        "frequency": "주간 빈도"
      }
    ],
    "secondary": [
      {
        "exercise": "보조 운동",
        "reason": "추천 이유",
        "frequency": "권장 빈도"
      }
    ],
    "cardio": {
      "type": "추천 유산소",
      "duration": "권장 시간",
      "frequency": "주간 빈도"
    },
    "avoid": ["피해야 할 운동들과 이유"]
  },
  "fashionRecommendations": {
    "bestStyles": ["가장 잘 어울리는 스타일들"],
    "tops": {
      "recommended": ["상의 추천들"],
      "details": "상의 선택 팁"
    },
    "bottoms": {
      "recommended": ["하의 추천들"],
      "details": "하의 선택 팁"
    },
    "dresses": "원피스/정장 추천",
    "accessories": ["추천 액세서리"],
    "avoid": ["피해야 할 스타일들과 이유"],
    "shoppingKeywords": ["쇼핑할 때 검색할 키워드들"]
  },
  "postureAnalysis": {
    "current": "현재 자세 분석",
    "strengths": ["자세의 좋은 점"],
    "improvements": [
      {
        "issue": "개선할 점",
        "solution": "해결 방법",
        "exercise": "도움되는 운동"
      }
    ]
  },
  "goalBasedPlan": {
    "slimming": "슬림해지고 싶다면",
    "bulking": "근육을 키우고 싶다면",
    "toning": "탄탄해지고 싶다면"
  },
  "weeklyRoutine": {
    "monday": "월요일 추천 운동",
    "wednesday": "수요일 추천 운동",
    "friday": "금요일 추천 운동"
  },
  "overallComment": "전문가의 종합 코멘트와 응원 메시지"
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
    const prompt = `당신은 25년 경력의 피부과 전문의이자 피부관리 전문가입니다. 유명 피부과에서 원장으로 재직하며, '피부는 거짓말을 하지 않는다' 저자입니다. 수만 명의 피부 상담을 진행했으며, 올리브영, 화해 앱 성분 자문위원으로 활동하고 있습니다.

이 얼굴 사진을 분석하여 피부 상태를 정밀 진단해주세요.

[분석 지침]

1. 톤앤매너
- "당신의 피부를 보니..." 같이 진료하는 느낌
- "~것으로 보입니다" 같은 AI스러운 표현 절대 금지
- 현재 상태를 솔직하게 말하되 개선 가능성 강조
- 전문적이면서도 친근한 설명

2. 재미 요소
- "이 피부 타입은 20대에 가장 좋아 보여요!" 같은 긍정 포인트
- 같은 피부 타입의 연예인 예시
- SNS에 공유하고 싶은 피부 장점

3. 실용적 가치
- 바로 올리브영 가서 살 수 있는 구체적 제품/성분명
- "아침에 이것, 저녁에 이것" 명확한 루틴
- 피부과 시술 추천 (필요시)

다음 JSON 형식으로 응답해주세요:
{
  "skinType": "피부 타입 (건성/지성/복합성/중성/민감성)",
  "skinTypeDetail": "세부 피부 타입 설명",
  "skinAge": "피부 나이",
  "skinAgeComment": "피부 나이에 대한 코멘트",
  "firstImpression": "피부를 본 첫 인상과 강점",
  "conditions": {
    "hydration": {
      "score": 7,
      "description": "수분 상태 상세",
      "improvement": "개선 방법"
    },
    "oiliness": {
      "score": 5,
      "description": "유분 상태 상세",
      "improvement": "관리 방법"
    },
    "sensitivity": {
      "score": 3,
      "description": "민감도 상세",
      "triggers": ["자극 요인들"]
    },
    "elasticity": {
      "score": 8,
      "description": "탄력 상태 상세",
      "maintenance": "유지 방법"
    },
    "pores": {
      "score": 6,
      "description": "모공 상태",
      "improvement": "개선 방법"
    },
    "pigmentation": {
      "score": 7,
      "description": "색소침착/톤",
      "improvement": "개선 방법"
    }
  },
  "strengths": ["피부의 강점들"],
  "concerns": {
    "primary": "가장 시급한 고민",
    "secondary": ["기타 개선점들"]
  },
  "celebrityMatch": "비슷한 피부 타입 연예인",
  "skincare": {
    "morning": {
      "steps": ["1. 클렌저", "2. 토너", "3. 세럼", "4. 크림", "5. 선크림"],
      "keyProduct": "아침 필수 제품",
      "tip": "아침 루틴 팁"
    },
    "evening": {
      "steps": ["1. 클렌징오일", "2. 폼클렌저", "3. 토너", "4. 세럼", "5. 크림"],
      "keyProduct": "저녁 필수 제품",
      "tip": "저녁 루틴 팁"
    },
    "weekly": {
      "exfoliation": "각질 케어 추천",
      "mask": "마스크팩 추천",
      "special": "스페셜 케어"
    }
  },
  "ingredients": {
    "mustHave": [
      {
        "ingredient": "성분명",
        "reason": "추천 이유",
        "products": "제품 예시"
      }
    ],
    "recommended": ["추천 성분들"],
    "avoid": [
      {
        "ingredient": "피해야 할 성분",
        "reason": "이유"
      }
    ]
  },
  "treatments": {
    "home": ["집에서 할 수 있는 관리"],
    "clinic": ["추천 피부과 시술 (필요시)"]
  },
  "lifestyle": {
    "diet": ["식단 조언"],
    "sleep": "수면 조언",
    "habits": ["생활 습관 조언"]
  },
  "seasonalTips": {
    "summer": "여름 관리 팁",
    "winter": "겨울 관리 팁"
  },
  "monthlyGoal": "한 달 후 기대 변화",
  "overallComment": "전문가의 종합 진단과 응원 메시지"
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

    const prompt = `당신은 15년 경력의 가정의학과 전문의이자 비만클리닉 원장입니다. 수천 명의 체중 관리 상담을 진행했으며, '숫자로 보는 내 건강' 저자입니다. BMI를 단순 수치가 아닌 종합적인 건강 지표로 해석하는 것으로 유명합니다.

다음 정보를 바탕으로 BMI 분석과 맞춤 건강 조언을 제공해주세요:

키: ${height}cm
체중: ${weight}kg
나이: ${age}세
성별: ${gender === 'male' ? '남성' : '여성'}
계산된 BMI: ${bmiRounded}

[분석 지침]

1. 톤앤매너
- "당신의 BMI를 보니..." 같이 진료하는 느낌
- "~것으로 보입니다" 같은 AI스러운 표현 절대 금지
- BMI 수치에 대한 솔직한 평가와 개선 가능성 강조
- 동기부여가 되는 긍정적 톤

2. 재미 요소
- "한국인 ${age}세 ${gender === 'male' ? '남성' : '여성'} 평균과 비교하면..." 같은 비교
- 3개월 후 목표 달성 시 예상 모습
- SNS에 공유하고 싶은 긍정적 포인트

3. 실용적 가치
- "하루 1800kcal, 단백질 80g" 같은 구체적 수치
- "아침에 달걀 2개, 점심에 현미밥 2/3공기" 같은 실제 식단
- "주 3회 30분 유산소" 같은 실천 가능한 운동 계획

다음 JSON 형식으로 응답해주세요:
{
  "bmi": ${bmiRounded},
  "category": "BMI 분류 (저체중/정상/과체중/경도비만/중등도비만/고도비만)",
  "categoryDetail": "분류에 대한 상세 설명",
  "comparison": {
    "koreanAverage": "한국인 ${age}세 ${gender === 'male' ? '남성' : '여성'} 평균 BMI",
    "yourPosition": "평균 대비 위치",
    "percentile": "상위 몇 %인지"
  },
  "idealWeight": {
    "target": "목표 체중",
    "min": 정상범위 최소,
    "max": 정상범위 최대,
    "toTarget": "목표까지 필요한 변화량",
    "description": "목표 설정 근거"
  },
  "bodyComposition": {
    "estimatedFat": "추정 체지방률",
    "estimatedMuscle": "추정 근육량",
    "note": "체성분 관련 코멘트"
  },
  "healthRisks": {
    "current": ["현재 건강 위험 요소들"],
    "ifNotManaged": ["관리하지 않을 경우 위험"],
    "preventable": ["예방 가능한 질환들"]
  },
  "metabolicHealth": {
    "metabolicAge": "추정 대사 나이",
    "basalMetabolicRate": "기초대사량 (kcal)",
    "metabolicComment": "대사 건강 코멘트"
  },
  "dailyCalories": {
    "maintain": 유지 칼로리,
    "lose": 감량 칼로리 (0.5kg/주),
    "gain": 증량 칼로리 (0.5kg/주),
    "calculation": "칼로리 계산 근거"
  },
  "nutritionPlan": {
    "macros": {
      "protein": "단백질 g",
      "carbs": "탄수화물 g",
      "fat": "지방 g"
    },
    "meals": {
      "breakfast": "아침 식단 예시",
      "lunch": "점심 식단 예시",
      "dinner": "저녁 식단 예시",
      "snacks": "간식 추천"
    },
    "hydration": "하루 수분 섭취량",
    "avoid": ["피해야 할 음식들"]
  },
  "exercisePlan": {
    "cardio": {
      "type": "추천 유산소",
      "duration": "시간",
      "frequency": "주간 빈도",
      "intensity": "강도"
    },
    "strength": {
      "type": "추천 근력운동",
      "duration": "시간",
      "frequency": "주간 빈도"
    },
    "dailyActivity": "일상 활동량 목표 (걸음수 등)"
  },
  "timeline": {
    "week1": "1주차 목표와 예상 변화",
    "month1": "1개월 후 예상",
    "month3": "3개월 후 목표"
  },
  "lifestyle": {
    "sleep": "수면 조언",
    "stress": "스트레스 관리",
    "habits": ["개선할 생활습관들"]
  },
  "medicalCheckup": ["추천 건강검진 항목들"],
  "motivation": "동기부여 메시지",
  "overallComment": "전문가의 종합 건강 평가와 조언"
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

// 15. Result Card Generation - 결과물 카드 이미지 생성
export async function generateResultCard(prompt: string) {
  try {
    const response = await getClient().generateImage(prompt);

    return {
      success: true,
      imageData: response.imageData,
      mimeType: response.mimeType,
      model: 'gemini-2.0-flash-exp'
    };
  } catch (error) {
    console.error('Result card generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 16. Personal Color Analysis - 퍼스널 컬러 진단
export async function analyzePersonalColor(imageBase64: string) {
  try {
    const prompt = `당신은 15년 경력의 퍼스널컬러 전문 컨설턴트입니다. 연예인, 아나운서, 대기업 임원들의 이미지 컨설팅을 담당해왔으며, 수천 명의 컬러 진단 경험이 있습니다.

이 사진 속 사람의 피부톤을 정밀 분석하여 퍼스널 컬러를 진단해주세요.

[분석 지침]

1. 전문적 분석
- 피부의 언더톤, 명도, 채도를 정밀 분석
- 눈동자 색, 머리카락 색, 입술 색도 함께 고려
- 왜 이 퍼스널컬러인지 구체적인 근거 제시
- 같은 계절 타입 내에서도 세부 타입(브라이트, 뮤트, 딥 등) 구분

2. 톤앤매너
- 전문가가 1:1 상담하는 것처럼 친근하면서도 신뢰감 있게
- "~것으로 보입니다" 같은 AI스러운 표현 절대 금지
- "당신의 피부톤을 보니...", "솔직히 말씀드리면..." 같은 자연스러운 표현 사용

3. 실용적 조언
- 추천 색상은 구체적인 색상명으로 (예: "코랄 핑크", "버건디", "머스타드")
- 실제 쇼핑할 때 바로 찾을 수 있는 키워드 제공
- 피해야 할 색상은 왜 피해야 하는지 이유도 설명

4. 일관성 규칙 (매우 중요)
- 모든 배열은 반드시 지정된 개수만큼 제공
- 색상명은 항상 한글로 (영어 혼용 금지)
- 메이크업과 의류 추천은 항상 구체적인 제품/색상명 사용
- 피부톤 진단은 반드시 봄/여름/가을/겨울 중 하나로 명확하게

다음 JSON 형식으로 정확히 응답해주세요 (모든 필드 필수):
{
  "personalColor": "봄 웜톤/여름 쿨톤/가을 웜톤/겨울 쿨톤 중 하나만",
  "subType": "세부 타입 (예: 라이트 스프링, 브라이트 스프링, 라이트 서머, 뮤트 서머, 소프트 오텀, 딥 오텀, 브라이트 윈터, 딥 윈터 등)",
  "confidence": 85,
  "skinAnalysis": {
    "undertone": "웜톤 또는 쿨톤 + 구체적 특징 설명",
    "brightness": "피부 밝기 (밝음/중간/어두움) + 특징",
    "saturation": "채도 (높음/중간/낮음) + 특징",
    "description": "전체적인 피부톤 분석 (3문장 이상)"
  },
  "colorAnalysis": {
    "eyeColor": "눈동자 색상과 밝기",
    "hairColor": "자연 모발 색상",
    "lipColor": "입술 자연색",
    "harmony": "전체적인 색조 조화 분석"
  },
  "recommendedColors": {
    "best": ["베스트 색상1", "색상2", "색상3", "색상4", "색상5"],
    "good": ["추천 색상1", "색상2", "색상3"],
    "avoid": ["피해야 할 색상1", "색상2"]
  },
  "makeupRecommendations": {
    "lipstick": ["립 색상1 (타입)", "색상2 (타입)", "색상3 (타입)"],
    "eyeshadow": ["아이섀도우1", "색상2", "색상3"],
    "blush": ["블러셔1", "색상2", "색상3"]
  },
  "clothingRecommendations": {
    "colors": ["의류 추천색1", "색상2", "색상3", "색상4", "색상5"],
    "metals": "골드 또는 실버 또는 로즈골드",
    "description": "스타일링 조언 (3문장 이상)"
  },
  "hairColorRecommendation": {
    "colors": ["추천 염색색1", "색상2", "색상3"],
    "avoid": ["피해야 할 염색색"]
  },
  "celebrityExample": "비슷한 톤의 한국 연예인 이름과 스타일링 포인트",
  "explanation": "종합 진단 설명 (5문장 이상, 왜 이 결과인지, 활용법 포함)"
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
  generateResultCard,
  analyzePersonalColor,
  // Health services
  analyzeBodyType,
  analyzeSkin,
  calculateBMI,
};

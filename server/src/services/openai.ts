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
 * Palmistry (수상) prompt template
 */
const PALMISTRY_PROMPT = (hand: 'left' | 'right') => `
당신은 한국의 수상학 전문가입니다. 제공된 손바닥 사진을 분석하여 수상학적 해석을 제공해주세요.

손: ${hand === 'left' ? '왼손' : '오른손'}

다음 항목을 포함하여 상세히 분석해주세요:

1. 손의 형태 분석:
   - 손 모양 (물, 불, 흙, 공기형 중 하나)
   - 손가락 길이와 비율
   - 손바닥 두께와 탄력성
   - 전체적인 인상

2. 주요 손금 7가지 상세 분석:
   - 생명선 (Life Line): 길이, 깊이, 끊김 여부, 방향, 분지
   - 운명선 (Fate Line): 시작점, 끝점, 명확성, 방향
   - 감정선 (Heart Line): 시작점, 끝점, 굴곡, 깊이
   - 지능선 (Head Line): 길이, 방향, 깊이, 굴곡
   - 재물선 (Money Line): 유무, 개수, 명확성
   - 결혼선 (Marriage Line): 위치, 개수, 길이, 끊김
   - 태양선 (Sun Line): 유무, 명확성, 길이

3. 각 선별 운세 해석:
   - 생명선: 건강운, 생명력, 장수
   - 운명선: 직업운, 성공운, 인생의 전환점
   - 감정선: 연애운, 감정 표현, 인간관계
   - 지능선: 사고방식, 재능, 학업운
   - 재물선: 재물 축적 능력, 금전운
   - 결혼선: 결혼 시기, 결혼 횟수, 배우자운
   - 태양선: 명예운, 인기운, 예술성

4. 종합 운세:
   - 성격과 기질
   - 재물운
   - 건강운
   - 연애운 및 결혼운
   - 사업운 및 직업운
   - 행운의 시기
   - 조언 및 주의사항

JSON 형식으로 응답해주세요:
{
  "handShape": {
    "type": "손 모양 타입",
    "description": "손 모양 설명",
    "personality": "성격 특성"
  },
  "majorLines": {
    "lifeLine": {
      "description": "생명선 상세 분석",
      "fortune": "건강운 및 장수",
      "characteristics": ["특징1", "특징2"]
    },
    "fateLine": {
      "description": "운명선 상세 분석",
      "fortune": "직업운 및 성공운",
      "characteristics": ["특징1", "특징2"]
    },
    "heartLine": {
      "description": "감정선 상세 분석",
      "fortune": "연애운 및 감정",
      "characteristics": ["특징1", "특징2"]
    },
    "headLine": {
      "description": "지능선 상세 분석",
      "fortune": "사고력 및 재능",
      "characteristics": ["특징1", "특징2"]
    },
    "moneyLine": {
      "description": "재물선 상세 분석",
      "fortune": "재물 축적 능력",
      "characteristics": ["특징1", "특징2"]
    },
    "marriageLine": {
      "description": "결혼선 상세 분석",
      "fortune": "결혼운 및 시기",
      "characteristics": ["특징1", "특징2"]
    },
    "sunLine": {
      "description": "태양선 상세 분석",
      "fortune": "명예운 및 인기",
      "characteristics": ["특징1", "특징2"]
    }
  },
  "overallFortune": {
    "personality": "종합 성격 분석",
    "wealth": "재물운 종합",
    "health": "건강운 종합",
    "love": "연애 및 결혼운 종합",
    "career": "사업 및 직업운 종합"
  },
  "luckyPeriod": "행운의 시기",
  "advice": ["조언 및 주의사항들"],
  "strengths": ["강점들"],
  "challenges": ["주의할 점들"]
}
`;

/**
 * Horoscope (별자리 운세) prompt template
 */
const HOROSCOPE_PROMPT = (birthDate: string, zodiacSign?: string) => `
당신은 서양 점성술 전문가입니다. 다음 정보를 바탕으로 별자리 운세를 분석해주세요:

생년월일: ${birthDate}
${zodiacSign ? `별자리: ${zodiacSign}` : ''}

다음 항목을 포함하여 상세히 분석해주세요:

1. 별자리 기본 특성:
   - 별자리 이름 및 기간
   - 지배 행성
   - 원소 (불, 흙, 공기, 물)
   - 기본 성격 특성

2. 시기별 운세:
   - 오늘의 운세
   - 이번 주 운세
   - 이번 달 운세
   - 올해 운세

3. 세부 운세:
   - 종합운: 전반적인 운세 흐름
   - 애정운: 연애 및 인간관계
   - 금전운: 재물 및 재테크
   - 직업운: 커리어 및 업무
   - 건강운: 신체 및 정신 건강
   - 행운의 요소: 숫자, 색상, 방향

4. 조언:
   - 강점 활용 방법
   - 주의할 점
   - 이번 달 추천 활동

JSON 형식으로 응답해주세요:
{
  "zodiacSign": {
    "name": "별자리 이름",
    "period": "별자리 기간",
    "planet": "지배 행성",
    "element": "원소",
    "traits": ["기본 성격 특성들"]
  },
  "dailyFortune": "오늘의 운세",
  "weeklyFortune": "이번 주 운세",
  "monthlyFortune": "이번 달 운세",
  "yearlyFortune": "올해 운세",
  "detailedFortune": {
    "overall": "종합운",
    "love": "애정운",
    "money": "금전운",
    "career": "직업운",
    "health": "건강운"
  },
  "luckyElements": {
    "numbers": [행운의 숫자들],
    "colors": ["행운의 색상들"],
    "direction": "행운의 방향",
    "items": ["행운의 아이템들"]
  },
  "advice": {
    "strengths": ["강점 활용법"],
    "warnings": ["주의사항"],
    "recommendations": ["추천 활동"]
  }
}
`;

/**
 * Zodiac (띠 운세) prompt template
 */
const ZODIAC_PROMPT = (birthDate: string) => `
당신은 한국의 십이지 띠 운세 전문가입니다. 다음 생년월일을 바탕으로 띠 운세를 분석해주세요:

생년월일: ${birthDate}

다음 항목을 포함하여 상세히 분석해주세요:

1. 띠 기본 특성:
   - 해당 띠 이름 (쥐, 소, 호랑이, 토끼, 용, 뱀, 말, 양, 원숭이, 닭, 개, 돼지)
   - 띠의 오행 (목, 화, 토, 금, 수)
   - 기본 성격 특성
   - 장점과 단점

2. 올해 운세 (2025년 을사년):
   - 전체 운세 흐름
   - 주요 이벤트 및 전환점
   - 상반기/하반기 운세

3. 월별 운세 요약:
   - 각 월별 핵심 운세 (1월~12월)
   - 좋은 달과 주의할 달
   - 중요한 시기

4. 세부 운세:
   - 재물운: 수입, 지출, 투자운
   - 애정운: 연애, 결혼, 가족관계
   - 직장운: 승진, 이직, 업무 성과
   - 건강운: 주의할 질병, 건강 관리법
   - 학업운: 시험, 학습 효율

5. 조언:
   - 올해 가장 조심해야 할 것
   - 적극적으로 시도할 만한 것
   - 행운을 부르는 방법
   - 궁합이 좋은 띠

JSON 형식으로 응답해주세요:
{
  "zodiac": {
    "animal": "띠 이름",
    "element": "오행",
    "traits": ["성격 특성들"],
    "strengths": ["장점들"],
    "weaknesses": ["단점들"]
  },
  "yearlyFortune": {
    "overall": "올해 전체 운세",
    "firstHalf": "상반기 운세",
    "secondHalf": "하반기 운세",
    "keyEvents": ["주요 이벤트들"]
  },
  "monthlyFortune": [
    {
      "month": 1,
      "summary": "1월 운세 요약"
    }
  ],
  "detailedFortune": {
    "wealth": "재물운 상세",
    "love": "애정운 상세",
    "career": "직장운 상세",
    "health": "건강운 상세",
    "study": "학업운 상세"
  },
  "luckyMonths": [좋은 달들],
  "cautiousMonths": [주의할 달들],
  "advice": {
    "warnings": ["주의사항들"],
    "opportunities": ["기회 요소들"],
    "luckyTips": ["행운 팁들"],
    "compatibleZodiacs": ["궁합 좋은 띠들"]
  }
}
`;

/**
 * Love Compatibility (연애궁합) prompt template
 */
const LOVE_COMPATIBILITY_PROMPT = (person1BirthDate: string, person2BirthDate: string) => `
당신은 한국의 사주 궁합 전문가입니다. 두 사람의 연애 궁합을 분석해주세요:

사람 1 생년월일: ${person1BirthDate}
사람 2 생년월일: ${person2BirthDate}

다음 항목을 포함하여 상세히 분석해주세요:

1. 궁합 점수:
   - 종합 궁합 점수 (0-100점)
   - 평가 등급 (최상, 상, 중상, 중, 하)

2. 사주 오행 궁합:
   - 각자의 오행 분석 (목화토금수)
   - 오행 상생/상극 관계
   - 음양 조화

3. 성격 궁합:
   - 성격 유사성/차이점
   - 장점이 되는 부분
   - 갈등 가능성이 있는 부분

4. 세부 궁합:
   - 감정 소통: 감정 표현 방식 및 이해도
   - 가치관: 인생관, 금전관, 가정관
   - 생활 습관: 일상 패턴의 조화
   - 미래 비전: 목표와 방향성의 일치도

5. 연애 스타일:
   - 각자의 연애 스타일
   - 서로에게 끌리는 이유
   - 관계 발전 가능성

6. 조언:
   - 관계를 발전시키는 방법
   - 주의해야 할 점
   - 갈등 해결 방법
   - 장기적 전망

JSON 형식으로 응답해주세요:
{
  "compatibilityScore": 85,
  "grade": "상",
  "elementAnalysis": {
    "person1Elements": {
      "wood": 2,
      "fire": 1,
      "earth": 3,
      "metal": 2,
      "water": 0
    },
    "person2Elements": {
      "wood": 1,
      "fire": 3,
      "earth": 1,
      "metal": 1,
      "water": 2
    },
    "relationship": "상생/상극 관계 설명",
    "harmony": "음양 조화 분석"
  },
  "personalityMatch": {
    "similarities": ["유사한 점들"],
    "differences": ["차이점들"],
    "strengths": ["장점이 되는 부분"],
    "challenges": ["갈등 가능성"]
  },
  "detailedCompatibility": {
    "communication": "감정 소통 궁합",
    "values": "가치관 궁합",
    "lifestyle": "생활 습관 궁합",
    "vision": "미래 비전 궁합"
  },
  "loveStyle": {
    "person1Style": "사람1의 연애 스타일",
    "person2Style": "사람2의 연애 스타일",
    "attraction": "서로 끌리는 이유",
    "potential": "관계 발전 가능성"
  },
  "advice": {
    "tips": ["관계 발전 방법"],
    "warnings": ["주의사항"],
    "conflictResolution": ["갈등 해결법"],
    "longTerm": "장기적 전망"
  }
}
`;

/**
 * Name Compatibility (이름궁합) prompt template
 */
const NAME_COMPATIBILITY_PROMPT = (name1: string, name2: string) => `
당신은 한국의 성명학 및 이름 궁합 전문가입니다. 두 사람의 이름 궁합을 분석해주세요:

사람 1 이름: ${name1}
사람 2 이름: ${name2}

다음 항목을 포함하여 상세히 분석해주세요:

1. 이름 획수 분석:
   - 각 이름의 총 획수
   - 성씨 획수와 이름 획수
   - 천격, 인격, 지격, 외격, 총격

2. 음양오행 분석:
   - 각 이름의 음양 배치
   - 오행 (목화토금수) 분포
   - 음양오행 조화도

3. 궁합 점수:
   - 종합 이름 궁합 점수 (0-100점)
   - 평가 등급
   - 점수 산출 근거

4. 이름별 특성:
   - 사람 1의 이름이 주는 기운
   - 사람 2의 이름이 주는 기운
   - 두 이름의 조화

5. 관계 해석:
   - 이름으로 본 성격 조화
   - 소통 방식의 조화
   - 에너지 균형

6. 세부 분석:
   - 연애 궁합: 애정 표현 및 감정 교류
   - 사업 궁합: 협력 가능성
   - 우정 궁합: 친구로서의 조화
   - 가족 궁합: 가정 내 조화

7. 조언:
   - 좋은 점을 더 발전시키는 방법
   - 주의할 점
   - 관계 증진 팁

JSON 형식으로 응답해주세요:
{
  "strokeAnalysis": {
    "name1": {
      "name": "이름1",
      "totalStrokes": 20,
      "familyNameStrokes": 5,
      "givenNameStrokes": 15,
      "heavenly": 6,
      "human": 15,
      "earthly": 20,
      "outer": 11,
      "total": 20
    },
    "name2": {
      "name": "이름2",
      "totalStrokes": 18,
      "familyNameStrokes": 3,
      "givenNameStrokes": 15,
      "heavenly": 4,
      "human": 12,
      "earthly": 18,
      "outer": 10,
      "total": 18
    }
  },
  "elementAnalysis": {
    "name1": {
      "yinYang": "음양 배치",
      "elements": "오행 분포",
      "harmony": "조화도"
    },
    "name2": {
      "yinYang": "음양 배치",
      "elements": "오행 분포",
      "harmony": "조화도"
    },
    "combined": "두 이름의 음양오행 조화"
  },
  "compatibilityScore": 82,
  "grade": "상",
  "scoreReason": "점수 산출 근거",
  "nameCharacteristics": {
    "name1Energy": "이름1이 주는 기운",
    "name2Energy": "이름2이 주는 기운",
    "synergy": "두 이름의 시너지"
  },
  "relationshipAnalysis": {
    "personalityHarmony": "성격 조화",
    "communicationStyle": "소통 방식",
    "energyBalance": "에너지 균형"
  },
  "detailedCompatibility": {
    "love": "연애 궁합",
    "business": "사업 궁합",
    "friendship": "우정 궁합",
    "family": "가족 궁합"
  },
  "advice": {
    "strengths": ["강점 활용법"],
    "warnings": ["주의사항"],
    "tips": ["관계 증진 팁"]
  }
}
`;

/**
 * Marriage Compatibility (결혼궁합) prompt template
 */
const MARRIAGE_COMPATIBILITY_PROMPT = (
  person1Name: string,
  person1BirthDate: string,
  person2Name: string,
  person2BirthDate: string
) => `
당신은 한국의 결혼 궁합 전문가입니다. 두 사람의 결혼 궁합을 종합적으로 분석해주세요:

사람 1:
- 이름: ${person1Name}
- 생년월일: ${person1BirthDate}

사람 2:
- 이름: ${person2Name}
- 생년월일: ${person2BirthDate}

다음 항목을 포함하여 상세히 분석해주세요:

1. 종합 결혼 궁합:
   - 총점 (0-100점)
   - 등급 (최상, 상, 중상, 중, 하)
   - 결혼 적합도 평가

2. 사주 궁합 (50점):
   - 오행 상생/상극 (20점)
   - 음양 조화 (15점)
   - 십이지 궁합 (15점)

3. 이름 궁합 (30점):
   - 획수 조화 (15점)
   - 음양오행 배치 (15점)

4. 세부 결혼 궁합 항목:
   - 성격 궁합: 생활 속 성격 조화
   - 금전 궁합: 경제관념 및 재물운
   - 자녀 궁합: 자녀 계획 및 육아관
   - 시댁/처가 궁합: 가족 관계
   - 건강 궁합: 서로의 건강 영향
   - 사회생활 궁합: 사교 및 대인관계

5. 결혼 생활 예측:
   - 신혼기 (1-3년)
   - 안정기 (4-10년)
   - 성숙기 (11년 이상)
   - 주의할 시기

6. 결혼 적기:
   - 가장 좋은 결혼 시기
   - 피해야 할 시기
   - 이유 및 근거

7. 종합 조언:
   - 결혼 후 강점
   - 극복해야 할 과제
   - 행복한 결혼 생활을 위한 조언
   - 위기 극복 방법

JSON 형식으로 응답해주세요:
{
  "overallScore": 88,
  "grade": "상",
  "suitability": "결혼 적합도 종합 평가",
  "sajuCompatibility": {
    "score": 45,
    "maxScore": 50,
    "elementHarmony": {
      "score": 18,
      "maxScore": 20,
      "analysis": "오행 상생상극 분석"
    },
    "yinYangBalance": {
      "score": 14,
      "maxScore": 15,
      "analysis": "음양 조화 분석"
    },
    "zodiacMatch": {
      "score": 13,
      "maxScore": 15,
      "analysis": "십이지 궁합 분석"
    }
  },
  "nameCompatibility": {
    "score": 26,
    "maxScore": 30,
    "strokeHarmony": {
      "score": 13,
      "maxScore": 15,
      "analysis": "획수 조화 분석"
    },
    "elementBalance": {
      "score": 13,
      "maxScore": 15,
      "analysis": "음양오행 배치 분석"
    }
  },
  "detailedAnalysis": {
    "personality": {
      "score": 85,
      "analysis": "성격 궁합 상세"
    },
    "finance": {
      "score": 90,
      "analysis": "금전 궁합 상세"
    },
    "children": {
      "score": 88,
      "analysis": "자녀 궁합 상세"
    },
    "inLaws": {
      "score": 75,
      "analysis": "시댁/처가 궁합 상세"
    },
    "health": {
      "score": 82,
      "analysis": "건강 궁합 상세"
    },
    "social": {
      "score": 87,
      "analysis": "사회생활 궁합 상세"
    }
  },
  "marriageLifePrediction": {
    "honeymoon": "신혼기 (1-3년) 예측",
    "stable": "안정기 (4-10년) 예측",
    "mature": "성숙기 (11년+) 예측",
    "cautiousPeriods": ["주의할 시기들"]
  },
  "bestMarriageTiming": {
    "recommendedPeriods": ["추천 시기들"],
    "avoidPeriods": ["피할 시기들"],
    "reason": "근거 설명"
  },
  "advice": {
    "strengths": ["결혼 후 강점들"],
    "challenges": ["극복해야 할 과제들"],
    "tips": ["행복한 결혼 생활 조언"],
    "crisisManagement": ["위기 극복 방법"]
  }
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
 * Analyze palmistry from hand image (수상)
 * @param imageUrl - URL or base64 of the hand image
 * @param hand - Which hand (left or right)
 */
export async function analyzePalmistry(imageUrl: string, hand: 'left' | 'right' = 'right') {
  try {
    // Validate if base64 image
    if (imageUrl.startsWith('data:image/')) {
      validateImage(imageUrl);
    }

    const prompt = PALMISTRY_PROMPT(hand);

    const response = await client.vision(imageUrl, prompt, {
      temperature: 0.7,
      maxTokens: 2500,
      responseFormat: 'json',
    });

    const analysis = client.parseJSON(response.content);

    return {
      success: true,
      analysis,
      model: 'gpt-4o-mini',
    };
  } catch (error) {
    console.error('OpenAI palmistry error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze horoscope (별자리 운세)
 * @param birthDate - Birth date (YYYY-MM-DD)
 * @param zodiacSign - Optional zodiac sign
 */
export async function analyzeHoroscope(birthDate: string, zodiacSign?: string) {
  try {
    const prompt = HOROSCOPE_PROMPT(birthDate, zodiacSign);

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
    console.error('OpenAI horoscope error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze Chinese zodiac fortune (띠 운세)
 * @param birthDate - Birth date (YYYY-MM-DD)
 */
export async function analyzeZodiac(birthDate: string) {
  try {
    const prompt = ZODIAC_PROMPT(birthDate);

    const response = await client.chat(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        maxTokens: 2500,
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
    console.error('OpenAI zodiac error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze love compatibility (연애궁합)
 * @param person1BirthDate - Person 1's birth date
 * @param person2BirthDate - Person 2's birth date
 */
export async function analyzeLoveCompatibility(person1BirthDate: string, person2BirthDate: string) {
  try {
    const prompt = LOVE_COMPATIBILITY_PROMPT(person1BirthDate, person2BirthDate);

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
    console.error('OpenAI love compatibility error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze name compatibility (이름궁합)
 * @param name1 - Person 1's name
 * @param name2 - Person 2's name
 */
export async function analyzeNameCompatibility(name1: string, name2: string) {
  try {
    const prompt = NAME_COMPATIBILITY_PROMPT(name1, name2);

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
    console.error('OpenAI name compatibility error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze marriage compatibility (결혼궁합)
 * @param person1Name - Person 1's name
 * @param person1BirthDate - Person 1's birth date
 * @param person2Name - Person 2's name
 * @param person2BirthDate - Person 2's birth date
 */
export async function analyzeMarriageCompatibility(
  person1Name: string,
  person1BirthDate: string,
  person2Name: string,
  person2BirthDate: string
) {
  try {
    const prompt = MARRIAGE_COMPATIBILITY_PROMPT(person1Name, person1BirthDate, person2Name, person2BirthDate);

    const response = await client.chat(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        maxTokens: 3000,
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
    console.error('OpenAI marriage compatibility error:', error);
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
  analyzePalmistry,
  analyzeHoroscope,
  analyzeZodiac,
  analyzeLoveCompatibility,
  analyzeNameCompatibility,
  analyzeMarriageCompatibility,
};

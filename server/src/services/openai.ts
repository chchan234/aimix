/**
 * OpenAI API Service
 *
 * Provides vision-based face reading and analysis using GPT-4 Vision
 * Refactored to use centralized OpenAIClient from prompt-engine
 */

import { OpenAIClient } from './prompt-engine/openai-client.js';
import { validateImage } from '../utils/image-validator.js';
import { mbtiQuestions } from '../data/mbti-questions.js';
import { enneagramQuestions } from '../data/enneagram-questions.js';
import { bigFiveQuestions } from '../data/bigfive-questions.js';
import { stressQuestions } from '../data/stress-questions.js';
import { geumjjokiQuestions, GRADE_INFO } from '../data/geumjjoki-questions.js';

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
 * MBTI Analysis prompt template
 */
const MBTI_ANALYSIS_PROMPT = (
  userInputMBTI: string | null,
  testResultMBTI: string,
  axisScores: {
    EI: { E: number; I: number };
    SN: { S: number; N: number };
    TF: { T: number; F: number };
    JP: { J: number; P: number };
  }
) => `
당신은 MBTI 전문가입니다. 사용자의 MBTI를 심층 분석해주세요.

입력 데이터:
- 사용자가 입력한 MBTI: ${userInputMBTI || '없음 (모르겠다고 응답)'}
- 테스트 결과 MBTI: ${testResultMBTI}
- 각 축별 점수:
  * E/I: E ${axisScores.EI.E}% vs I ${axisScores.EI.I}%
  * S/N: S ${axisScores.SN.S}% vs N ${axisScores.SN.N}%
  * T/F: T ${axisScores.TF.T}% vs F ${axisScores.TF.F}%
  * J/P: J ${axisScores.JP.J}% vs P ${axisScores.JP.P}%

다음 항목을 포함하여 상세히 분석해주세요:

1. 결과 비교 분석:
   - 입력 MBTI와 테스트 결과의 일치/불일치 분석
   - 각 축별 일치도 평가
   - 차이가 나는 이유 분석 (상황별 변화, 자기인식 등)

2. 최종 MBTI 결론:
   - 가장 정확한 MBTI 유형
   - 각 축별 선호도 강도 (명확 vs 중간)
   - 경계선에 있는 축이 있다면 설명

3. 성격 특성:
   - 주요 성격 특성 5가지
   - 강점과 재능
   - 약점과 개선 영역

4. 대인관계:
   - 소통 스타일
   - 친구/연인 관계에서의 특징
   - 궁합이 좋은 MBTI 유형

5. 직업 및 진로:
   - 적합한 직업군
   - 업무 스타일
   - 리더십 유형

6. 성장 조언:
   - 개발하면 좋은 부분
   - 주의해야 할 함정
   - 균형잡힌 발전을 위한 조언

7. 일상생활:
   - 스트레스 대처 방식
   - 의사결정 스타일
   - 학습 방법

JSON 형식으로 응답해주세요:
{
  "comparison": {
    "userInput": "사용자 입력 MBTI (또는 null)",
    "testResult": "테스트 결과 MBTI",
    "match": "일치 여부 및 분석",
    "axisDifferences": ["차이나는 축들과 이유"]
  },
  "finalMBTI": {
    "type": "최종 MBTI",
    "confidence": "확신도 (높음/중간/낮음)",
    "axisStrength": {
      "EI": "E/I 선호도 설명",
      "SN": "S/N 선호도 설명",
      "TF": "T/F 선호도 설명",
      "JP": "J/P 선호도 설명"
    }
  },
  "personality": {
    "traits": ["주요 성격 특성 5가지"],
    "strengths": ["강점들"],
    "weaknesses": ["약점들"]
  },
  "relationships": {
    "communicationStyle": "소통 스타일",
    "friendshipStyle": "친구 관계 스타일",
    "loveStyle": "연애 스타일",
    "compatibleTypes": ["궁합 좋은 MBTI 3개"]
  },
  "career": {
    "suitableJobs": ["적합한 직업 5개"],
    "workStyle": "업무 스타일",
    "leadershipStyle": "리더십 유형"
  },
  "growth": {
    "developmentAreas": ["개발 영역들"],
    "pitfalls": ["주의사항들"],
    "balanceTips": ["균형 조언들"]
  },
  "lifestyle": {
    "stressCoping": "스트레스 대처법",
    "decisionMaking": "의사결정 방식",
    "learningStyle": "학습 스타일"
  }
}
`;

/**
 * Enneagram Analysis prompt template
 */
const ENNEAGRAM_ANALYSIS_PROMPT = (
  typeScores: { [key: number]: number },
  mainType: number,
  wingType: number | null
) => `
당신은 에니어그램 전문가입니다. 사용자의 에니어그램 유형을 심층 분석해주세요.

테스트 결과:
- 주 유형: ${mainType}번
- 날개 유형: ${wingType ? `${wingType}번` : '없음'}
- 각 유형별 점수:
${Object.entries(typeScores).map(([type, score]) => `  * ${type}번: ${score}점`).join('\n')}

다음 항목을 포함하여 상세히 분석해주세요:

1. 주 유형 분석:
   - ${mainType}번 유형의 이름과 별명
   - 핵심 동기와 욕구
   - 근본적인 두려움
   - 기본 성격 특성

2. 날개 유형 영향:
   - 날개 유형이 주는 영향
   - 주 유형과 날개의 조합 해석
   - 이 조합의 독특한 특징

3. 건강 수준:
   - 건강한 상태의 모습
   - 보통 상태의 모습
   - 불건강한 상태의 모습
   - 현재 상태 평가 및 조언

4. 성장 방향:
   - 통합 방향 (성장 시 향하는 유형)
   - 분열 방향 (스트레스 시 향하는 유형)
   - 성장을 위한 실천 방법

5. 대인관계:
   - 관계 맺는 방식
   - 갈등 대응 스타일
   - 궁합이 좋은 유형들
   - 관계에서 주의할 점

6. 직업 및 커리어:
   - 적합한 직업과 역할
   - 업무 환경 선호도
   - 리더십 스타일

7. 자기개발:
   - 핵심 개발 과제
   - 극복해야 할 패턴
   - 균형을 위한 조언

8. 일상 생활:
   - 의사결정 방식
   - 스트레스 대처법
   - 감정 관리 방법

JSON 형식으로 응답해주세요:
{
  "mainType": {
    "number": ${mainType},
    "name": "유형 이름",
    "nickname": "별명",
    "coreMotivation": "핵심 동기",
    "coreFear": "근본적 두려움",
    "traits": ["기본 성격 특성들"]
  },
  "wing": {
    "wingType": ${wingType || null},
    "influence": "날개의 영향",
    "combination": "주 유형과 날개의 조합 해석",
    "uniqueTraits": ["독특한 특징들"]
  },
  "healthLevels": {
    "healthy": "건강한 상태",
    "average": "보통 상태",
    "unhealthy": "불건강한 상태",
    "currentAssessment": "현재 상태 평가"
  },
  "growth": {
    "integrationDirection": {
      "toType": "통합 방향 유형 번호",
      "description": "통합 방향 설명"
    },
    "disintegrationDirection": {
      "toType": "분열 방향 유형 번호",
      "description": "분열 방향 설명"
    },
    "practices": ["성장 실천 방법들"]
  },
  "relationships": {
    "style": "관계 맺는 방식",
    "conflictStyle": "갈등 대응 방식",
    "compatibleTypes": [궁합 좋은 유형 번호들],
    "warnings": ["관계에서 주의할 점들"]
  },
  "career": {
    "suitableJobs": ["적합한 직업들"],
    "workEnvironment": "선호 업무 환경",
    "leadershipStyle": "리더십 스타일"
  },
  "development": {
    "keyTasks": ["핵심 개발 과제들"],
    "patternsToBreak": ["극복할 패턴들"],
    "balanceTips": ["균형 조언들"]
  },
  "lifestyle": {
    "decisionMaking": "의사결정 방식",
    "stressCoping": "스트레스 대처법",
    "emotionManagement": "감정 관리 방법"
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
    // Fetch template from DB using PromptManager
    const { PromptManager } = await import('./prompt-engine/prompt-manager.js');
    const promptManager = new PromptManager();

    const template = await promptManager.getTemplate('face-reading');
    if (!template) {
      throw new Error('Face reading prompt template not found');
    }

    // Render prompt with variables
    const birthDateInfo = birthDate ? `생년월일: ${birthDate}` : '';
    const prompt = promptManager.renderPrompt(template.userPromptTemplate, { birthDateInfo });

    const response = await client.vision(imageUrl, prompt, {
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: 'json',
    });

    const analysis = client.parseJSON(response.content);

    // Track performance
    await promptManager.trackPerformance(
      template.id,
      response.usage.totalTokens,
      response.responseTime
    );

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
    // Fetch template from DB using PromptManager
    const { PromptManager } = await import('./prompt-engine/prompt-manager.js');
    const promptManager = new PromptManager();

    const template = await promptManager.getTemplate('saju');
    if (!template) {
      throw new Error('Saju prompt template not found');
    }

    // Render prompt with variables
    const genderKo = gender === 'male' ? '남성' : '여성';
    const prompt = promptManager.renderPrompt(template.userPromptTemplate, {
      birthDate,
      birthTime,
      gender: genderKo
    });

    const response = await client.chat(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        maxTokens: 2000,
        responseFormat: 'json',
      }
    );

    const analysis = client.parseJSON(response.content);

    // Track performance
    await promptManager.trackPerformance(
      template.id,
      response.usage.totalTokens,
      response.responseTime
    );

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
 * Deep Saju Analysis for 2025 - 심층 신년운세 (10,000+ characters)
 * Generates a comprehensive yearly fortune report
 */
export async function analyzeDeepSaju2025(birthDate: string, birthTime: string, gender: 'male' | 'female') {
  try {
    const genderKo = gender === 'male' ? '남성' : '여성';

    const prompt = `당신은 대한민국 최고의 사주 명리학 전문가입니다.
다음 정보를 바탕으로 2025년 심층 신년운세를 작성해주세요.

생년월일: ${birthDate}
태어난 시간: ${birthTime}
성별: ${genderKo}

반드시 10,000자 이상의 매우 상세한 보고서를 작성해주세요.
각 섹션은 최소 1,000자 이상으로 상세하게 작성해야 합니다.

다음 JSON 형식으로 응답해주세요:

{
  "summary": {
    "overallFortune": "2025년 전체 운세 개요 (최소 500자)",
    "yearlyTheme": "올해의 테마와 키워드",
    "luckyColor": "행운의 색상",
    "luckyNumber": "행운의 숫자",
    "luckyDirection": "길한 방향"
  },
  "fourPillars": {
    "year": "연주 분석",
    "month": "월주 분석",
    "day": "일주 분석",
    "time": "시주 분석",
    "interpretation": "사주팔자 종합 해석 (최소 1,000자)"
  },
  "monthlyFortune": {
    "january": {
      "overall": "1월 전체 운세",
      "career": "직업/사업운",
      "love": "연애/결혼운",
      "wealth": "재물운",
      "health": "건강운",
      "advice": "조언",
      "luckyDays": [1, 15, 22],
      "cautionDays": [7, 13]
    },
    "february": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "march": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "april": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "may": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "june": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "july": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "august": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "september": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "october": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "november": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] },
    "december": { "overall": "...", "career": "...", "love": "...", "wealth": "...", "health": "...", "advice": "...", "luckyDays": [], "cautionDays": [] }
  },
  "careerFortune": {
    "overall": "2025년 직업운 전체 분석 (최소 1,500자)",
    "bestMonths": ["3월", "7월", "10월"],
    "cautionMonths": ["5월", "9월"],
    "opportunities": ["기회1", "기회2", "기회3"],
    "challenges": ["도전1", "도전2"],
    "advice": "직업 관련 조언 (최소 500자)"
  },
  "wealthFortune": {
    "overall": "2025년 재물운 전체 분석 (최소 1,500자)",
    "investmentAdvice": "투자 관련 조언",
    "savingsAdvice": "저축 관련 조언",
    "spendingCaution": "지출 주의사항",
    "bestMonths": ["4월", "8월", "11월"],
    "cautionMonths": ["2월", "6월"],
    "luckyNumbers": [3, 7, 12]
  },
  "loveFortune": {
    "overall": "2025년 연애운/결혼운 전체 분석 (최소 1,500자)",
    "single": "미혼자를 위한 조언",
    "relationship": "연애 중인 사람을 위한 조언",
    "married": "기혼자를 위한 조언",
    "bestMonths": ["2월", "5월", "9월"],
    "cautionMonths": ["7월", "12월"]
  },
  "healthFortune": {
    "overall": "2025년 건강운 전체 분석 (최소 1,000자)",
    "weakPoints": ["주의할 신체 부위1", "주의할 신체 부위2"],
    "preventionAdvice": "예방을 위한 조언",
    "exerciseRecommendation": "추천 운동",
    "dietAdvice": "식이 조언"
  },
  "relationshipFortune": {
    "family": "가족 관계 운세 (최소 500자)",
    "friends": "친구/사회 관계 운세 (최소 500자)",
    "colleagues": "직장 내 인간관계 (최소 500자)"
  },
  "spiritualGuidance": {
    "meditation": "명상 및 마음 수양 조언",
    "luckyCharms": ["부적/액세서리 추천"],
    "avoidance": ["피해야 할 것들"],
    "rituals": "길한 의식이나 습관"
  },
  "yearlyAdvice": "2025년을 위한 종합 조언 (최소 1,000자)"
}

각 월별 운세는 반드시 6개 항목(overall, career, love, wealth, health, advice)을 모두 상세하게 작성하세요.
모든 텍스트는 구체적이고 실용적인 조언을 포함해야 합니다.`;

    const response = await client.chat(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.8,
        maxTokens: 8000,
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
    console.error('OpenAI Deep Saju 2025 analysis error:', error);
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

/**
 * Analyze MBTI with user input and test results
 * @param userInputMBTI - User's self-reported MBTI (or null)
 * @param answers - Array of 28 answers (1-5 scale)
 */
export async function analyzeMBTI(userInputMBTI: string | null, answers: number[]) {
  try {
    // Calculate scores for each axis
    const axisScores = calculateMBTIScores(answers);

    // Determine MBTI type from test
    const testResultMBTI = determineMBTIType(axisScores);

    const prompt = MBTI_ANALYSIS_PROMPT(userInputMBTI, testResultMBTI, axisScores);

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
      testResultMBTI,
      axisScores,
      model: 'gpt-4o-mini',
    };
  } catch (error) {
    console.error('OpenAI MBTI analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate MBTI axis scores from answers
 */
function calculateMBTIScores(answers: number[]) {
  const scores = {
    EI: { E: 0, I: 0 },
    SN: { S: 0, N: 0 },
    TF: { T: 0, F: 0 },
    JP: { J: 0, P: 0 },
  };

  answers.forEach((answer, index) => {
    const question = mbtiQuestions[index];
    const { axis, direction } = question;

    // Convert 1-5 scale to score
    // 1 = strongly disagree, 5 = strongly agree
    const score = direction === 'positive' ? answer : (6 - answer);

    if (axis === 'EI') {
      scores.EI.E += score > 3 ? (score - 3) : 0;
      scores.EI.I += score < 3 ? (3 - score) : 0;
    } else if (axis === 'SN') {
      scores.SN.S += score > 3 ? (score - 3) : 0;
      scores.SN.N += score < 3 ? (3 - score) : 0;
    } else if (axis === 'TF') {
      scores.TF.T += score > 3 ? (score - 3) : 0;
      scores.TF.F += score < 3 ? (3 - score) : 0;
    } else if (axis === 'JP') {
      scores.JP.J += score > 3 ? (score - 3) : 0;
      scores.JP.P += score < 3 ? (3 - score) : 0;
    }
  });

  // Convert to percentages
  const normalize = (a: number, b: number) => {
    const total = a + b || 1;
    return {
      first: Math.round((a / total) * 100),
      second: Math.round((b / total) * 100),
    };
  };

  const EI = normalize(scores.EI.E, scores.EI.I);
  const SN = normalize(scores.SN.S, scores.SN.N);
  const TF = normalize(scores.TF.T, scores.TF.F);
  const JP = normalize(scores.JP.J, scores.JP.P);

  return {
    EI: { E: EI.first, I: EI.second },
    SN: { S: SN.first, N: SN.second },
    TF: { T: TF.first, F: TF.second },
    JP: { J: JP.first, P: JP.second },
  };
}

/**
 * Determine MBTI type from axis scores
 */
function determineMBTIType(axisScores: any): string {
  const e_or_i = axisScores.EI.E > axisScores.EI.I ? 'E' : 'I';
  const s_or_n = axisScores.SN.S > axisScores.SN.N ? 'S' : 'N';
  const t_or_f = axisScores.TF.T > axisScores.TF.F ? 'T' : 'F';
  const j_or_p = axisScores.JP.J > axisScores.JP.P ? 'J' : 'P';

  return `${e_or_i}${s_or_n}${t_or_f}${j_or_p}`;
}

/**
 * Analyze Enneagram from test results
 * @param answers - Array of 36 answers (1-5 scale)
 */
export async function analyzeEnneagram(answers: number[]) {
  try {
    // Calculate scores for each type
    const typeScores = calculateEnneagramScores(answers);

    // Determine main type and wing
    const { mainType, wingType } = determineEnneagramType(typeScores);

    const prompt = ENNEAGRAM_ANALYSIS_PROMPT(typeScores, mainType, wingType);

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
      mainType,
      wingType,
      typeScores,
      model: 'gpt-4o-mini',
    };
  } catch (error) {
    console.error('OpenAI Enneagram analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate Enneagram type scores from answers
 */
function calculateEnneagramScores(answers: number[]): { [key: number]: number } {
  const scores: { [key: number]: number } = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };

  answers.forEach((answer, index) => {
    const question = enneagramQuestions[index];
    const { type } = question;

    // Add answer score (1-5) to corresponding type
    scores[type] += answer;
  });

  return scores;
}

/**
 * Determine main type and wing from scores
 */
function determineEnneagramType(typeScores: { [key: number]: number }): { mainType: number; wingType: number | null } {
  // Find main type (highest score)
  const sortedTypes = Object.entries(typeScores)
    .sort(([, a], [, b]) => b - a)
    .map(([type]) => parseInt(type));

  const mainType = sortedTypes[0];

  // Determine wing (adjacent type with higher score)
  const adjacentTypes = [
    mainType === 1 ? 9 : mainType - 1,
    mainType === 9 ? 1 : mainType + 1
  ];

  const wingScores = adjacentTypes.map(type => ({
    type,
    score: typeScores[type]
  }));

  wingScores.sort((a, b) => b.score - a.score);

  // Only consider wing if score is significant (at least 70% of main type score)
  const wingType = wingScores[0].score >= typeScores[mainType] * 0.7
    ? wingScores[0].type
    : null;

  return { mainType, wingType };
}

/**
 * Analyze Big Five Personality Test
 */
export async function analyzeBigFive(answers: number[]): Promise<any> {
  try {
    const { bigFiveQuestions } = await import('../data/bigfive-questions.js');

    if (answers.length !== bigFiveQuestions.length) {
      return { success: false, error: 'Invalid number of answers' };
    }

    // Calculate trait scores
    const traitScores = calculateBigFiveScores(answers);

    // Build prompt for AI analysis
    const prompt = `당신은 전문 심리학자입니다. Big Five 성격 테스트 결과를 분석해주세요.

특성별 점수:
- 개방성 (Openness): ${traitScores.O}점/25점
- 성실성 (Conscientiousness): ${traitScores.C}점/25점
- 외향성 (Extraversion): ${traitScores.E}점/25점
- 친화성 (Agreeableness): ${traitScores.A}점/25점
- 신경성 (Neuroticism): ${traitScores.N}점/25점

다음 형식의 JSON으로 응답해주세요:
{
  "summary": {
    "overview": "종합 성격 분석 (2-3문장)",
    "dominantTraits": ["가장 두드러진 특성 1", "특성 2"],
    "developmentAreas": ["발전이 필요한 영역 1", "영역 2"]
  },
  "traits": {
    "O": {
      "level": "높음/중간/낮음",
      "description": "이 수준의 개방성이 의미하는 바",
      "strengths": ["강점 1", "강점 2"],
      "challenges": ["어려움 1", "어려움 2"]
    },
    "C": {
      "level": "높음/중간/낮음",
      "description": "이 수준의 성실성이 의미하는 바",
      "strengths": ["강점 1", "강점 2"],
      "challenges": ["어려움 1", "어려움 2"]
    },
    "E": {
      "level": "높음/중간/낮음",
      "description": "이 수준의 외향성이 의미하는 바",
      "strengths": ["강점 1", "강점 2"],
      "challenges": ["어려움 1", "어려움 2"]
    },
    "A": {
      "level": "높음/중간/낮음",
      "description": "이 수준의 친화성이 의미하는 바",
      "strengths": ["강점 1", "강점 2"],
      "challenges": ["어려움 1", "어려움 2"]
    },
    "N": {
      "level": "높음/중간/낮음",
      "description": "이 수준의 신경성이 의미하는 바",
      "strengths": ["강점 1", "강점 2"],
      "challenges": ["어려움 1", "어려움 2"]
    }
  },
  "career": {
    "suitableFields": ["적합한 분야 1", "분야 2", "분야 3"],
    "workStyle": "업무 스타일 설명",
    "teamRole": "팀 내 역할"
  },
  "relationships": {
    "interpersonalStyle": "대인관계 스타일",
    "communicationTips": ["의사소통 팁 1", "팁 2"],
    "compatibilityNotes": "궁합 관련 조언"
  },
  "growth": {
    "recommendations": ["성장을 위한 추천사항 1", "추천사항 2", "추천사항 3"],
    "balanceTips": ["균형을 위한 조언 1", "조언 2"]
  }
}`;

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
      traitScores,
      model: 'gpt-4o-mini'
    };
  } catch (error) {
    console.error('Big Five analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculate Big Five trait scores
 */
function calculateBigFiveScores(answers: number[]): { [key: string]: number } {
  const scores: { [key: string]: number } = {
    O: 0, C: 0, E: 0, A: 0, N: 0
  };

  bigFiveQuestions.forEach((q, index) => {
    const answer = answers[index];
    // positive direction: answer as is, negative direction: inverted (6 - answer)
    const score = q.direction === 'positive' ? answer : (6 - answer);
    scores[q.trait] += score;
  });

  return scores;
}

/**
 * Analyze Stress Level
 */
export async function analyzeStress(answers: number[]): Promise<any> {
  try {
    const { stressQuestions } = await import('../data/stress-questions.js');

    if (answers.length !== stressQuestions.length) {
      return { success: false, error: 'Invalid number of answers' };
    }

    // Calculate category scores and overall stress
    const categoryScores = calculateStressScores(answers);
    const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
    const overallStressLevel = Math.round((totalScore / (answers.length * 5)) * 100);

    // Build prompt for AI analysis
    const prompt = `당신은 전문 심리상담사입니다. 스트레스 지수 측정 결과를 분석해주세요.

전체 스트레스 수준: ${overallStressLevel}% (${totalScore}점/${answers.length * 5}점)

영역별 점수:
- 업무/커리어: ${categoryScores.work}점/25점
- 대인관계: ${categoryScores.relationships}점/25점
- 건강: ${categoryScores.health}점/25점
- 일상생활: ${categoryScores.life}점/25점

다음 형식의 JSON으로 응답해주세요:
{
  "overallAssessment": {
    "level": "매우 높음/높음/보통/낮음/매우 낮음",
    "description": "전반적인 스트레스 상태 설명 (2-3문장)",
    "riskFactors": ["주요 위험 요인 1", "요인 2"]
  },
  "categories": {
    "work": {
      "level": "높음/보통/낮음",
      "analysis": "업무 스트레스 분석",
      "concerns": ["우려사항 1", "우려사항 2"],
      "tips": ["대처 방법 1", "방법 2"]
    },
    "relationships": {
      "level": "높음/보통/낮음",
      "analysis": "대인관계 스트레스 분석",
      "concerns": ["우려사항 1", "우려사항 2"],
      "tips": ["대처 방법 1", "방법 2"]
    },
    "health": {
      "level": "높음/보통/낮음",
      "analysis": "건강 관련 스트레스 분석",
      "concerns": ["우려사항 1", "우려사항 2"],
      "tips": ["대처 방법 1", "방법 2"]
    },
    "life": {
      "level": "높음/보통/낮음",
      "analysis": "일상생활 스트레스 분석",
      "concerns": ["우려사항 1", "우려사항 2"],
      "tips": ["대처 방법 1", "방법 2"]
    }
  },
  "management": {
    "immediatePriorities": ["즉시 대처할 사항 1", "사항 2", "사항 3"],
    "copingStrategies": ["대처 전략 1", "전략 2", "전략 3"],
    "relaxationTechniques": ["이완 기법 1", "기법 2"],
    "lifestyleChanges": ["생활습관 개선 1", "개선 2"]
  },
  "resources": {
    "professionalHelp": "전문가 도움이 필요한지 여부와 이유",
    "supportSystems": ["활용 가능한 지원 체계 1", "체계 2"],
    "selfCareActivities": ["자기관리 활동 1", "활동 2", "활동 3"]
  }
}`;

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
      overallStressLevel,
      categoryScores,
      model: 'gpt-4o-mini'
    };
  } catch (error) {
    console.error('Stress analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculate stress scores by category
 */
function calculateStressScores(answers: number[]): { [key: string]: number } {
  const scores: { [key: string]: number } = {
    work: 0,
    relationships: 0,
    health: 0,
    life: 0
  };

  stressQuestions.forEach((q, index) => {
    scores[q.category] += answers[index];
  });

  return scores;
}

/**
 * Analyze Geumjjoki (금쪽이) test
 */
export async function analyzeGeumjjoki(answers: number[]): Promise<any> {
  try {
    const categoryScores = calculateGeumjjokiScores(answers);

    // Calculate total score (0-100)
    const totalAnswers = answers.reduce((sum, answer) => sum + answer, 0);
    const maxScore = answers.length * 5; // 30 questions * 5 max score
    const geumjjokiScore = Math.round((totalAnswers / maxScore) * 100);

    // Determine grade
    const grade = getGeumjjokiGrade(geumjjokiScore);

    const prompt = `당신은 전문 심리학자입니다. "금쪽이 테스트" 결과를 분석해주세요.

금쪽이 테스트는 10-30대가 자신의 일상 속 행동 패턴과 습관을 재미있게 진단하는 테스트입니다.

**금쪽이 지수**: ${geumjjokiScore}점/100점
**등급**: ${grade.name} ${grade.emoji}

**카테고리별 점수**:
- 충동성/자기조절: ${categoryScores.impulse}점/30점
- 집중력/계획성: ${categoryScores.focus}점/30점
- 감정조절/대인관계: ${categoryScores.emotion}점/30점
- 생활습관/책임감: ${categoryScores.lifestyle}점/30점
- 디지털/SNS 습관: ${categoryScores.digital}점/30점

다음 형식의 JSON으로 응답해주세요:
{
  "summary": {
    "gradeDescription": "${grade.description}",
    "mainType": "당신의 금쪽이 유형 (ex: 충동형 금쪽이, 미루기형 금쪽이)",
    "oneLineComment": "재미있고 공감되는 한 줄 코멘트"
  },
  "categoryAnalysis": {
    "impulse": {
      "level": "높음/중간/낮음",
      "characteristics": ["특징1", "특징2", "특징3"],
      "impact": "일상에 미치는 영향"
    },
    "focus": { /* 동일한 구조 */ },
    "emotion": { /* 동일한 구조 */ },
    "lifestyle": { /* 동일한 구조 */ },
    "digital": { /* 동일한 구조 */ }
  },
  "strengths": ["강점1 (긍정적으로)", "강점2", "강점3"],
  "challenges": ["개선이 필요한 습관1", "습관2", "습관3"],
  "improvement": {
    "priority": ["최우선 개선사항 TOP 3"],
    "tips": ["실천 가능한 팁1", "팁2", "팁3"],
    "encouragement": "공감과 위로의 메시지"
  },
  "forOthers": {
    "howTheyFeel": "주변 사람들이 느끼는 점",
    "advice": "주변 사람들을 위한 조언"
  }
}

재미있고 공감되는 톤으로, 하지만 실질적인 도움이 되는 분석을 제공해주세요.`;

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
      geumjjokiScore,
      grade: {
        name: grade.name,
        emoji: grade.emoji,
        description: grade.description
      },
      categoryScores,
      model: 'gpt-4o-mini'
    };
  } catch (error) {
    console.error('Geumjjoki analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculate geumjjoki scores by category
 */
function calculateGeumjjokiScores(answers: number[]): { [key: string]: number } {
  const scores: { [key: string]: number } = {
    impulse: 0,
    focus: 0,
    emotion: 0,
    lifestyle: 0,
    digital: 0
  };

  geumjjokiQuestions.forEach((q, index) => {
    scores[q.category] += answers[index];
  });

  return scores;
}

/**
 * Get grade info based on score
 */
function getGeumjjokiGrade(score: number): { name: string; emoji: string; description: string } {
  for (const [key, gradeInfo] of Object.entries(GRADE_INFO)) {
    const [min, max] = gradeInfo.range;
    if (score >= min && score <= max) {
      return {
        name: gradeInfo.name,
        emoji: gradeInfo.emoji,
        description: gradeInfo.description
      };
    }
  }
  // Default to normal if no match
  return {
    name: GRADE_INFO.normal.name,
    emoji: GRADE_INFO.normal.emoji,
    description: GRADE_INFO.normal.description
  };
}

/**
 * Deep Fortune 2025 - 2025년 심층 신년운세
 * Generates comprehensive year-long fortune reading
 */
export async function analyzeDeepFortune2025(birthDate: string, birthTime?: string, gender?: 'male' | 'female') {
  try {
    const prompt = `당신은 한국의 사주 및 운세 전문가입니다. 2025년(을사년, 뱀띠) 신년을 맞아 상세한 1년 운세를 분석해주세요.

생년월일: ${birthDate}
${birthTime ? `태어난 시간: ${birthTime}` : ''}
${gender ? `성별: ${gender === 'male' ? '남성' : '여성'}` : ''}

다음 내용을 매우 상세하게 분석해주세요 (총 5,000-10,000자 분량):

# 1. 2025년 전체 운세 개관
- 을사년의 기운과 귀하의 사주와의 조화
- 전반적인 운의 흐름 (상승/하강/평탄)
- 올해의 핵심 키워드 3가지
- 가장 주의해야 할 시기와 가장 좋은 시기

# 2. 월별 상세 운세 (1월 ~ 12월)
각 월마다 다음 항목을 포함:
- 해당 월의 전체 운세 흐름
- 주요 이벤트 및 기회
- 주의할 점
- 추천 활동

# 3. 세부 운세 분석

## 3.1 재물운 (財運)
- 수입 전망 및 변동성
- 투자 운세 (부동산, 주식, 사업 등)
- 지출 주의사항
- 재테크 추천 방향
- 큰 돈이 들어오는 시기
- 재물 손실 주의 시기

## 3.2 직장운 / 사업운 (事業運)
- 직장인: 승진, 평가, 이직 운세
- 사업자: 매출, 확장, 계약 운세
- 새로운 프로젝트 시작 길일
- 주의해야 할 갈등 요소
- 협력자 및 동업 운세

## 3.3 연애운 / 결혼운 (戀愛運)
- 솔로: 만남의 기회, 소개팅 운, 최적의 만남 시기
- 연인: 관계 발전, 결혼 타이밍, 갈등 주의 시기
- 기혼: 부부 관계, 가정의 화목, 주의사항
- 이성에게 매력적으로 보이는 시기

## 3.4 건강운 (健康運)
- 전반적인 건강 상태
- 주의해야 할 신체 부위
- 취약한 시기와 관리법
- 권장 운동 및 식습관
- 정기 검진 추천 시기

## 3.5 학업운 / 시험운 (學業運)
- 학습 능률이 오르는 시기
- 시험 운세 (입시, 자격증, 승진시험 등)
- 집중력 향상 방법
- 공부 방향 및 과목 추천

## 3.6 대인관계운 (對人關係運)
- 인간관계 전반의 흐름
- 새로운 인연의 시기
- 갈등 주의 인물 유형
- 귀인운 (도움 받을 사람)
- 네트워킹 최적 시기

# 4. 길방위 및 길일
- 2025년 귀하에게 좋은 방위
- 이사, 여행 길방위
- 중요한 일을 시작하기 좋은 날들
- 피해야 할 흉일

# 5. 행운 요소
- 행운의 숫자
- 행운의 색상
- 행운의 아이템
- 행운을 부르는 습관

# 6. 2025년 실천 조언
- 반드시 해야 할 일 TOP 3
- 절대 해서는 안 될 일 TOP 3
- 균형 잡힌 한 해를 위한 조언
- 영적/정신적 성장 방법

# 7. 10년 운세 맥락
- 지난 2024년 복기
- 2025년의 위치
- 향후 2026-2027년 전망

매우 상세하고 구체적으로 작성해주세요. 추상적인 표현보다는 실질적인 조언을 제공해주세요.

JSON 형식으로 응답해주세요:
{
  "year": 2025,
  "overview": {
    "yearEnergy": "을사년 기운 설명",
    "trend": "상승/하강/평탄",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "bestPeriod": "가장 좋은 시기",
    "cautionPeriod": "주의할 시기"
  },
  "monthlyFortune": [
    {
      "month": 1,
      "overall": "전체 운세",
      "events": ["주요 이벤트"],
      "cautions": ["주의사항"],
      "recommendations": ["추천 활동"]
    }
  ],
  "detailedFortune": {
    "wealth": {
      "income": "수입 전망",
      "investment": "투자 운세",
      "spending": "지출 주의",
      "advice": "재테크 조언",
      "luckyMonths": [좋은 달들],
      "cautiousMonths": [주의할 달들]
    },
    "career": {
      "employee": "직장인 운세",
      "business": "사업자 운세",
      "projectTiming": "프로젝트 시작 시기",
      "conflicts": "갈등 요소",
      "partnership": "협력 운세"
    },
    "love": {
      "single": "솔로 운세",
      "dating": "연인 운세",
      "married": "기혼 운세",
      "bestMonths": [좋은 달들]
    },
    "health": {
      "overall": "전반적 건강",
      "vulnerableAreas": ["주의 부위"],
      "riskPeriods": ["취약 시기"],
      "recommendations": ["권장 사항"],
      "checkupTiming": "검진 추천 시기"
    },
    "study": {
      "productivity": "학습 능률 시기",
      "examLuck": "시험 운세",
      "focus": "집중력 향상법",
      "subjects": ["추천 과목/분야"]
    },
    "relationships": {
      "trend": "인간관계 흐름",
      "newConnections": "새 인연 시기",
      "conflicts": "갈등 주의",
      "benefactors": "귀인운",
      "networking": "네트워킹 시기"
    }
  },
  "luckyDirections": {
    "favorable": ["좋은 방위"],
    "moving": "이사 방위",
    "travel": "여행 방위",
    "avoid": ["피할 방위"]
  },
  "luckyElements": {
    "numbers": [행운 숫자들],
    "colors": ["행운 색상들"],
    "items": ["행운 아이템들"],
    "habits": ["행운 습관들"]
  },
  "actionAdvice": {
    "mustDo": ["해야 할 일 3가지"],
    "mustAvoid": ["피해야 할 일 3가지"],
    "balance": "균형 조언",
    "growth": "성장 방법"
  },
  "decadePerspective": {
    "past2024": "2024년 복기",
    "current2025": "2025년 위치",
    "future": "2026-2027 전망"
  }
}`;

    const result = await client.generateText(prompt, {
      temperature: 0.7,
      max_tokens: 16000, // Allow for very long response
    });

    return {
      success: true,
      analysis: result.content,
      model: 'gpt-4o'
    };
  } catch (error) {
    console.error('Deep Fortune 2025 analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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
  analyzeMBTI,
  analyzeEnneagram,
  analyzeBigFive,
  analyzeStress,
  analyzeGeumjjoki,
  analyzeDeepFortune2025,
};

/**
 * Big Five Personality Test Questions (OCEAN Model)
 * 25 questions - 5 per trait
 */

export interface BigFiveQuestion {
  id: number;
  question: string;
  trait: 'O' | 'C' | 'E' | 'A' | 'N'; // Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
  direction: 'positive' | 'negative'; // positive = trait 높음, negative = trait 낮음
  reverse?: boolean; // if true, reverse the score (5->1, 4->2, 3->3, 2->4, 1->5)
}

export const bigFiveQuestions: BigFiveQuestion[] = [
  // Openness to Experience - 경험에 대한 개방성 (1-5)
  {
    id: 1,
    question: '새로운 아이디어나 관점을 탐구하는 것을 즐긴다',
    trait: 'O',
    direction: 'positive',
    reverse: false
  },
  {
    id: 2,
    question: '예술, 음악, 문학에 관심이 많다',
    trait: 'O',
    direction: 'positive',
    reverse: true // Reverse scoring
  },
  {
    id: 3,
    question: '상상력이 풍부하고 창의적인 편이다',
    trait: 'O',
    direction: 'positive',
    reverse: false
  },
  {
    id: 4,
    question: '익숙하고 검증된 방법을 선호한다',
    trait: 'O',
    direction: 'negative',
    reverse: false
  },
  {
    id: 5,
    question: '추상적이고 철학적인 주제에 대해 생각하는 것을 좋아한다',
    trait: 'O',
    direction: 'positive',
    reverse: false
  },

  // Conscientiousness - 성실성 (6-10)
  {
    id: 6,
    question: '계획을 세우고 그대로 실행하는 것을 중요하게 생각한다',
    trait: 'C',
    direction: 'positive',
    reverse: false
  },
  {
    id: 7,
    question: '일을 미루는 경향이 있다',
    trait: 'C',
    direction: 'negative',
    reverse: true // Reverse scoring
  },
  {
    id: 8,
    question: '세부사항에 주의를 기울이고 꼼꼼하게 확인한다',
    trait: 'C',
    direction: 'positive',
    reverse: false
  },
  {
    id: 9,
    question: '목표를 설정하고 그것을 달성하기 위해 노력한다',
    trait: 'C',
    direction: 'positive',
    reverse: true // Reverse scoring
  },
  {
    id: 10,
    question: '정리정돈을 잘하고 체계적이다',
    trait: 'C',
    direction: 'positive',
    reverse: false
  },

  // Extraversion - 외향성 (11-15)
  {
    id: 11,
    question: '사람들과 함께 있을 때 활력이 넘친다',
    trait: 'E',
    direction: 'positive',
    reverse: false
  },
  {
    id: 12,
    question: '조용하고 차분한 환경을 선호한다',
    trait: 'E',
    direction: 'negative',
    reverse: true // Reverse scoring
  },
  {
    id: 13,
    question: '파티나 모임에서 사람들과 쉽게 친해진다',
    trait: 'E',
    direction: 'positive',
    reverse: false
  },
  {
    id: 14,
    question: '주목받는 것을 편하게 느낀다',
    trait: 'E',
    direction: 'positive',
    reverse: false
  },
  {
    id: 15,
    question: '혼자 있는 시간이 더 편안하다',
    trait: 'E',
    direction: 'negative',
    reverse: false
  },

  // Agreeableness - 친화성 (16-20)
  {
    id: 16,
    question: '다른 사람들에게 공감하고 배려하는 편이다',
    trait: 'A',
    direction: 'positive',
    reverse: false
  },
  {
    id: 17,
    question: '갈등 상황에서 먼저 양보하는 편이다',
    trait: 'A',
    direction: 'positive',
    reverse: true // Reverse scoring
  },
  {
    id: 18,
    question: '사람들을 쉽게 믿는 편이다',
    trait: 'A',
    direction: 'positive',
    reverse: false
  },
  {
    id: 19,
    question: '논쟁에서 이기는 것이 중요하다',
    trait: 'A',
    direction: 'negative',
    reverse: false
  },
  {
    id: 20,
    question: '다른 사람을 돕는 것에서 만족감을 느낀다',
    trait: 'A',
    direction: 'positive',
    reverse: false
  },

  // Neuroticism - 신경성 (21-25)
  {
    id: 21,
    question: '스트레스 상황에서 쉽게 불안해진다',
    trait: 'N',
    direction: 'positive',
    reverse: false
  },
  {
    id: 22,
    question: '기분이 자주 변하는 편이다',
    trait: 'N',
    direction: 'positive',
    reverse: true // Reverse scoring
  },
  {
    id: 23,
    question: '걱정을 많이 하는 편이다',
    trait: 'N',
    direction: 'positive',
    reverse: false
  },
  {
    id: 24,
    question: '대부분의 상황에서 침착함을 유지한다',
    trait: 'N',
    direction: 'negative',
    reverse: false
  },
  {
    id: 25,
    question: '작은 일에도 쉽게 화가 나거나 짜증이 난다',
    trait: 'N',
    direction: 'positive',
    reverse: true // Reverse scoring
  }
];

export const TRAIT_NAMES = {
  O: '개방성',
  C: '성실성',
  E: '외향성',
  A: '친화성',
  N: '신경성'
};

export const TRAIT_DESCRIPTIONS = {
  O: '새로운 경험과 아이디어에 대한 개방성과 창의성',
  C: '목표 지향성, 자기 통제력, 책임감',
  E: '사회적 상호작용에서 얻는 에너지와 활력',
  A: '타인에 대한 배려, 협조성, 친절함',
  N: '정서적 안정성과 스트레스 대응력'
};

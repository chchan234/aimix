/**
 * MBTI Test Questions
 * 28 questions - 7 per axis (E/I, S/N, T/F, J/P)
 */

export interface MBTIQuestion {
  id: number;
  question: string;
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  direction: 'positive' | 'negative'; // positive = first letter, negative = second letter
  reverse?: boolean; // if true, reverse the score (5->1, 4->2, 3->3, 2->4, 1->5)
}

export const mbtiQuestions: MBTIQuestion[] = [
  // E/I - 외향/내향 (1-7)
  {
    id: 1,
    question: '사람들과 어울린 후 에너지가 충전되는 편이다',
    axis: 'EI',
    direction: 'positive', // E
    reverse: false
  },
  {
    id: 2,
    question: '혼자만의 시간이 필요하고 그 시간이 소중하다',
    axis: 'EI',
    direction: 'negative', // I
    reverse: true // Reverse: high score = less introverted
  },
  {
    id: 3,
    question: '새로운 사람들을 만나는 것이 즐겁고 편하다',
    axis: 'EI',
    direction: 'positive', // E
    reverse: false
  },
  {
    id: 4,
    question: '깊은 대화를 나눌 수 있는 소수의 친구를 선호한다',
    axis: 'EI',
    direction: 'negative', // I
    reverse: false
  },
  {
    id: 5,
    question: '여러 활동에 동시에 참여하는 것을 좋아한다',
    axis: 'EI',
    direction: 'positive', // E
    reverse: false
  },
  {
    id: 6,
    question: '생각을 정리한 후에 말하는 편이다',
    axis: 'EI',
    direction: 'negative', // I
    reverse: true // Reverse: high score = less introverted
  },
  {
    id: 7,
    question: '파티나 모임에서 먼저 다가가 대화를 시작한다',
    axis: 'EI',
    direction: 'positive', // E
    reverse: false
  },

  // S/N - 감각/직관 (8-14)
  {
    id: 8,
    question: '현실적이고 실용적인 것을 중요하게 생각한다',
    axis: 'SN',
    direction: 'positive', // S
    reverse: false
  },
  {
    id: 9,
    question: '새로운 가능성과 아이디어에 끌린다',
    axis: 'SN',
    direction: 'negative', // N
    reverse: false
  },
  {
    id: 10,
    question: '경험과 사실을 바탕으로 판단하는 것을 선호한다',
    axis: 'SN',
    direction: 'positive', // S
    reverse: true // Reverse scoring
  },
  {
    id: 11,
    question: '세부사항보다 전체적인 그림을 보는 것을 좋아한다',
    axis: 'SN',
    direction: 'negative', // N
    reverse: false
  },
  {
    id: 12,
    question: '현재에 집중하고 지금 이 순간을 중요하게 여긴다',
    axis: 'SN',
    direction: 'positive', // S
    reverse: false
  },
  {
    id: 13,
    question: '미래의 가능성과 잠재력에 대해 자주 생각한다',
    axis: 'SN',
    direction: 'negative', // N
    reverse: true // Reverse scoring
  },
  {
    id: 14,
    question: '구체적이고 명확한 지시사항을 선호한다',
    axis: 'SN',
    direction: 'positive', // S
    reverse: false
  },

  // T/F - 사고/감정 (15-21)
  {
    id: 15,
    question: '결정을 내릴 때 논리와 분석을 우선한다',
    axis: 'TF',
    direction: 'positive', // T
    reverse: false
  },
  {
    id: 16,
    question: '다른 사람의 감정을 먼저 고려하는 편이다',
    axis: 'TF',
    direction: 'negative', // F
    reverse: false
  },
  {
    id: 17,
    question: '객관적인 사실과 원칙이 중요하다',
    axis: 'TF',
    direction: 'positive', // T
    reverse: true // Reverse scoring
  },
  {
    id: 18,
    question: '조화와 공감이 중요하다고 생각한다',
    axis: 'TF',
    direction: 'negative', // F
    reverse: false
  },
  {
    id: 19,
    question: '비판적으로 분석하고 문제점을 찾는 것을 잘한다',
    axis: 'TF',
    direction: 'positive', // T
    reverse: false
  },
  {
    id: 20,
    question: '칭찬과 격려를 자주 하는 편이다',
    axis: 'TF',
    direction: 'negative', // F
    reverse: true // Reverse scoring
  },
  {
    id: 21,
    question: '효율성과 합리성을 중요하게 생각한다',
    axis: 'TF',
    direction: 'positive', // T
    reverse: false
  },

  // J/P - 판단/인식 (22-28)
  {
    id: 22,
    question: '계획을 세우고 그대로 실행하는 것을 선호한다',
    axis: 'JP',
    direction: 'positive', // J
    reverse: false
  },
  {
    id: 23,
    question: '즉흥적이고 유연하게 대처하는 것을 좋아한다',
    axis: 'JP',
    direction: 'negative', // P
    reverse: false
  },
  {
    id: 24,
    question: '마감 전에 미리 일을 끝내는 편이다',
    axis: 'JP',
    direction: 'positive', // J
    reverse: true // Reverse scoring
  },
  {
    id: 25,
    question: '여러 가능성을 열어두고 결정을 미루는 편이다',
    axis: 'JP',
    direction: 'negative', // P
    reverse: true // Reverse scoring
  },
  {
    id: 26,
    question: '정리정돈이 잘 되어 있는 환경을 선호한다',
    axis: 'JP',
    direction: 'positive', // J
    reverse: false
  },
  {
    id: 27,
    question: '새로운 정보에 따라 계획을 바꾸는 것이 편하다',
    axis: 'JP',
    direction: 'negative', // P
    reverse: false
  },
  {
    id: 28,
    question: '체계적이고 조직적인 것을 중요하게 생각한다',
    axis: 'JP',
    direction: 'positive', // J
    reverse: false
  },
];

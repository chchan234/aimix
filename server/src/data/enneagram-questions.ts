/**
 * Enneagram Test Questions
 * 36 questions - 4 per type (1-9)
 */

export interface EnneagramQuestion {
  id: number;
  question: string;
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export const enneagramQuestions: EnneagramQuestion[] = [
  // Type 1 - 개혁가 (완벽주의자)
  {
    id: 1,
    question: '옳고 그름에 대한 분명한 기준이 있다',
    type: 1
  },
  {
    id: 2,
    question: '실수나 잘못된 것을 보면 바로잡고 싶다',
    type: 1
  },
  {
    id: 3,
    question: '나 자신에게 엄격하고 높은 기준을 적용한다',
    type: 1
  },
  {
    id: 4,
    question: '원칙과 규칙을 지키는 것이 중요하다',
    type: 1
  },

  // Type 2 - 조력가 (돕는 사람)
  {
    id: 5,
    question: '다른 사람을 돕는 것에서 보람을 느낀다',
    type: 2
  },
  {
    id: 6,
    question: '상대방이 필요로 하는 것을 먼저 알아차린다',
    type: 2
  },
  {
    id: 7,
    question: '사람들과의 관계에서 인정받는 것이 중요하다',
    type: 2
  },
  {
    id: 8,
    question: '나의 필요보다 타인의 필요를 먼저 생각한다',
    type: 2
  },

  // Type 3 - 성취자 (성공 지향)
  {
    id: 9,
    question: '목표를 달성하고 성공하는 것이 중요하다',
    type: 3
  },
  {
    id: 10,
    question: '효율적이고 생산적인 것을 좋아한다',
    type: 3
  },
  {
    id: 11,
    question: '다른 사람들에게 좋은 인상을 주고 싶다',
    type: 3
  },
  {
    id: 12,
    question: '경쟁에서 이기고 인정받는 것이 동기부여가 된다',
    type: 3
  },

  // Type 4 - 예술가 (개인주의자)
  {
    id: 13,
    question: '나만의 독특함과 개성이 중요하다',
    type: 4
  },
  {
    id: 14,
    question: '감정이 풍부하고 깊이 느끼는 편이다',
    type: 4
  },
  {
    id: 15,
    question: '남들과 다른 특별한 존재가 되고 싶다',
    type: 4
  },
  {
    id: 16,
    question: '아름다움과 의미 있는 것에 끌린다',
    type: 4
  },

  // Type 5 - 사색가 (관찰자)
  {
    id: 17,
    question: '혼자만의 시간과 공간이 꼭 필요하다',
    type: 5
  },
  {
    id: 18,
    question: '지식을 쌓고 이해하는 것을 좋아한다',
    type: 5
  },
  {
    id: 19,
    question: '감정 표현보다 이성적 분석을 선호한다',
    type: 5
  },
  {
    id: 20,
    question: '에너지와 자원을 아껴 쓰는 편이다',
    type: 5
  },

  // Type 6 - 충성가 (의심하는 사람)
  {
    id: 21,
    question: '안전과 안정이 매우 중요하다',
    type: 6
  },
  {
    id: 22,
    question: '최악의 상황을 미리 대비하는 편이다',
    type: 6
  },
  {
    id: 23,
    question: '신뢰할 수 있는 사람과 조직에 충성한다',
    type: 6
  },
  {
    id: 24,
    question: '의심이 많고 신중하게 결정한다',
    type: 6
  },

  // Type 7 - 열정가 (낙천주의자)
  {
    id: 25,
    question: '새롭고 재미있는 경험을 추구한다',
    type: 7
  },
  {
    id: 26,
    question: '긍정적이고 낙관적인 편이다',
    type: 7
  },
  {
    id: 27,
    question: '지루함을 참지 못하고 자극을 원한다',
    type: 7
  },
  {
    id: 28,
    question: '여러 가지 일을 동시에 하는 것을 좋아한다',
    type: 7
  },

  // Type 8 - 도전자 (지도자)
  {
    id: 29,
    question: '강하고 독립적인 사람이 되고 싶다',
    type: 8
  },
  {
    id: 30,
    question: '불의와 부당함을 참지 못한다',
    type: 8
  },
  {
    id: 31,
    question: '주도권을 잡고 통제하는 것을 선호한다',
    type: 8
  },
  {
    id: 32,
    question: '약한 모습을 보이기 싫어한다',
    type: 8
  },

  // Type 9 - 평화주의자 (중재자)
  {
    id: 33,
    question: '평화와 조화를 유지하는 것이 중요하다',
    type: 9
  },
  {
    id: 34,
    question: '갈등과 충돌을 피하고 싶다',
    type: 9
  },
  {
    id: 35,
    question: '다른 사람의 의견에 쉽게 동의하는 편이다',
    type: 9
  },
  {
    id: 36,
    question: '편안하고 안정적인 일상을 선호한다',
    type: 9
  },
];

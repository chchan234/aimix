/**
 * Stress Level Assessment Questions
 * 20 questions across 4 categories
 */

export interface StressQuestion {
  id: number;
  question: string;
  category: 'work' | 'relationships' | 'health' | 'life'; // 업무, 대인관계, 건강, 일상생활
}

export const stressQuestions: StressQuestion[] = [
  // Work/Career - 업무/커리어 (1-5)
  {
    id: 1,
    question: '업무량이 과도하거나 시간에 쫓긴다고 느낀다',
    category: 'work'
  },
  {
    id: 2,
    question: '직장이나 학교에서의 성과나 평가에 대해 불안하다',
    category: 'work'
  },
  {
    id: 3,
    question: '업무나 학업 관련 결정을 내리는 것이 어렵다',
    category: 'work'
  },
  {
    id: 4,
    question: '직장이나 학교 동료들과의 관계에서 스트레스를 받는다',
    category: 'work'
  },
  {
    id: 5,
    question: '현재 하는 일이나 공부에 대한 의욕이 떨어진다',
    category: 'work'
  },

  // Relationships - 대인관계 (6-10)
  {
    id: 6,
    question: '가족이나 가까운 사람들과의 관계에서 갈등이 있다',
    category: 'relationships'
  },
  {
    id: 7,
    question: '다른 사람들의 기대를 충족시키지 못할까 걱정된다',
    category: 'relationships'
  },
  {
    id: 8,
    question: '외로움을 느끼거나 사회적으로 고립되어 있다고 느낀다',
    category: 'relationships'
  },
  {
    id: 9,
    question: '대인관계에서 오해나 갈등이 자주 발생한다',
    category: 'relationships'
  },
  {
    id: 10,
    question: '사람들과의 만남이나 사교 활동이 부담스럽다',
    category: 'relationships'
  },

  // Health - 건강 (11-15)
  {
    id: 11,
    question: '수면 문제(불면증, 과다 수면 등)를 겪고 있다',
    category: 'health'
  },
  {
    id: 12,
    question: '두통, 소화불량 등 신체적 불편함이 자주 있다',
    category: 'health'
  },
  {
    id: 13,
    question: '피로감이나 무기력함을 자주 느낀다',
    category: 'health'
  },
  {
    id: 14,
    question: '식욕이 떨어지거나 과식을 하는 경향이 있다',
    category: 'health'
  },
  {
    id: 15,
    question: '운동이나 건강관리를 할 여유가 없다',
    category: 'health'
  },

  // Daily Life - 일상생활 (16-20)
  {
    id: 16,
    question: '재정적인 문제나 경제적 불안감이 있다',
    category: 'life'
  },
  {
    id: 17,
    question: '일상적인 일들을 처리하는 것이 벅차게 느껴진다',
    category: 'life'
  },
  {
    id: 18,
    question: '미래에 대한 불확실성 때문에 불안하다',
    category: 'life'
  },
  {
    id: 19,
    question: '여가 시간이나 취미 활동을 즐길 여유가 없다',
    category: 'life'
  },
  {
    id: 20,
    question: '집중력이 떨어지고 일을 완수하기 어렵다',
    category: 'life'
  }
];

export const CATEGORY_NAMES = {
  work: '업무/커리어',
  relationships: '대인관계',
  health: '건강',
  life: '일상생활'
};

export const CATEGORY_DESCRIPTIONS = {
  work: '업무량, 성과, 동료 관계 등 직장/학업 관련 스트레스',
  relationships: '가족, 친구, 연인 등 대인관계에서 발생하는 스트레스',
  health: '수면, 피로, 신체 증상 등 건강 관련 스트레스',
  life: '재정, 미래, 일상 관리 등 생활 전반의 스트레스'
};

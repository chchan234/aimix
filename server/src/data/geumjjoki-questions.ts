/**
 * 금쪽이 테스트 질문 (10-30대 자가진단)
 * 총 30문항, 5개 카테고리
 */

export interface GeumjjokiQuestion {
  id: number;
  question: string;
  category: 'impulse' | 'focus' | 'emotion' | 'lifestyle' | 'digital';
  reverse?: boolean; // if true, reverse the score (5->1, 4->2, 3->3, 2->4, 1->5)
}

export const geumjjokiQuestions: GeumjjokiQuestion[] = [
  // 충동성/자기조절 (6문항)
  {
    id: 1,
    question: '하고 싶은 말을 참지 못하고 바로 내뱉는 편이다',
    category: 'impulse',
    reverse: false
  },
  {
    id: 2,
    question: '계획 없이 충동구매를 자주 한다',
    category: 'impulse',
    reverse: true // Reverse scoring
  },
  {
    id: 3,
    question: '화가 나면 참지 못하고 즉시 표현한다',
    category: 'impulse',
    reverse: false
  },
  {
    id: 4,
    question: '다이어트나 운동 결심을 해도 며칠 만에 포기한다',
    category: 'impulse',
    reverse: true // Reverse scoring
  },
  {
    id: 5,
    question: '새벽까지 게임이나 유튜브를 보다가 후회한다',
    category: 'impulse',
    reverse: false
  },
  {
    id: 6,
    question: '하기 싫은 일은 계속 미루고 미룬다',
    category: 'impulse',
    reverse: false
  },

  // 집중력/계획성 (6문항)
  {
    id: 7,
    question: '한 가지 일에 오래 집중하지 못하고 자꾸 딴짓을 한다',
    category: 'focus',
    reverse: false
  },
  {
    id: 8,
    question: '약속 시간을 자주 어기거나 늦는다',
    category: 'focus',
    reverse: true // Reverse scoring
  },
  {
    id: 9,
    question: '여러 일을 동시에 벌려놓고 다 못 끝낸다',
    category: 'focus',
    reverse: false
  },
  {
    id: 10,
    question: '중요한 물건(지갑, 열쇠, 폰 등)을 자주 잃어버린다',
    category: 'focus',
    reverse: false
  },
  {
    id: 11,
    question: '계획을 세워도 실천하지 못하고 흐지부지된다',
    category: 'focus',
    reverse: true // Reverse scoring
  },
  {
    id: 12,
    question: '숙제나 업무를 마감 직전에 몰아서 한다',
    category: 'focus',
    reverse: false
  },

  // 감정조절/대인관계 (6문항)
  {
    id: 13,
    question: 'SNS에서 논쟁이 생기면 참지 못하고 끼어든다',
    category: 'emotion',
    reverse: false
  },
  {
    id: 14,
    question: '기분에 따라 말투와 행동이 180도 달라진다',
    category: 'emotion',
    reverse: true // Reverse scoring
  },
  {
    id: 15,
    question: '한번 삐지면 오래 간다',
    category: 'emotion',
    reverse: false
  },
  {
    id: 16,
    question: '친구들과 싸우고 연락 끊는 일이 잦다',
    category: 'emotion',
    reverse: true // Reverse scoring
  },
  {
    id: 17,
    question: '남의 말을 끝까지 듣지 못하고 끊거나 끼어든다',
    category: 'emotion',
    reverse: false
  },
  {
    id: 18,
    question: '칭찬받지 못하면 삐지거나 불만이 생긴다',
    category: 'emotion',
    reverse: false
  },

  // 생활습관/책임감 (6문항)
  {
    id: 19,
    question: '방 청소를 한 달에 한 번도 안 한다',
    category: 'lifestyle',
    reverse: false
  },
  {
    id: 20,
    question: '건강검진이나 병원 예약을 계속 미룬다',
    category: 'lifestyle',
    reverse: true // Reverse scoring
  },
  {
    id: 21,
    question: '공과금이나 카드값 납부를 자주 잊어버린다',
    category: 'lifestyle',
    reverse: false
  },
  {
    id: 22,
    question: '식사를 자주 거르거나 야식을 매일 먹는다',
    category: 'lifestyle',
    reverse: false
  },
  {
    id: 23,
    question: '약속을 쉽게 하고 쉽게 어긴다',
    category: 'lifestyle',
    reverse: true // Reverse scoring
  },
  {
    id: 24,
    question: '빌린 돈이나 물건을 자주 까먹는다',
    category: 'lifestyle',
    reverse: false
  },

  // 디지털/SNS 습관 (6문항)
  {
    id: 25,
    question: '스마트폰이 없으면 불안하고 계속 찾게 된다',
    category: 'digital',
    reverse: false
  },
  {
    id: 26,
    question: 'SNS 댓글이나 좋아요 개수에 민감하다',
    category: 'digital',
    reverse: true // Reverse scoring
  },
  {
    id: 27,
    question: '밤에 스마트폰을 보다가 새벽 3시를 넘기는 일이 잦다',
    category: 'digital',
    reverse: false
  },
  {
    id: 28,
    question: '단톡방에서 즉답이 안 오면 불안하거나 짜증난다',
    category: 'digital',
    reverse: true // Reverse scoring
  },
  {
    id: 29,
    question: '게임이나 넷플릭스를 시작하면 멈출 수 없다',
    category: 'digital',
    reverse: false
  },
  {
    id: 30,
    question: '실시간 검색어나 커뮤니티를 수시로 확인한다',
    category: 'digital',
    reverse: false
  }
];

export const CATEGORY_NAMES = {
  impulse: '충동성/자기조절',
  focus: '집중력/계획성',
  emotion: '감정조절/대인관계',
  lifestyle: '생활습관/책임감',
  digital: '디지털/SNS 습관'
};

export const GRADE_INFO = {
  angel: {
    name: '천사',
    range: [0, 20],
    emoji: '😇',
    description: '자기관리가 완벽한 모범생'
  },
  good: {
    name: '순한 아이',
    range: [21, 40],
    emoji: '😊',
    description: '가끔 실수하지만 전반적으로 괜찮음'
  },
  normal: {
    name: '보통 금쪽이',
    range: [41, 60],
    emoji: '😅',
    description: '현대인의 평균, MZ세대의 일반적 모습'
  },
  serious: {
    name: '진성 금쪽이',
    range: [61, 80],
    emoji: '🤪',
    description: '주변 사람들이 좀 힘들어함'
  },
  legend: {
    name: '전설의 금쪽이',
    range: [81, 100],
    emoji: '🔥',
    description: '오은영 박사님이 필요한 레벨'
  }
};

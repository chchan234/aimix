import { useState } from 'react';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ 데이터
  const faqs: FAQ[] = [
    {
      id: 1,
      category: 'credits',
      question: '크레딧은 어떻게 구매하나요?',
      answer:
        '상단 메뉴의 "크레딧 구매" 또는 사이드바의 "크레딧 구매"를 클릭하여 원하는 패키지를 선택하고 결제하시면 됩니다. 결제 후 즉시 크레딧이 충전됩니다.',
    },
    {
      id: 2,
      category: 'credits',
      question: '크레딧 환불이 가능한가요?',
      answer:
        '구매일로부터 7일 이내, 사용하지 않은 크레딧에 한하여 환불이 가능합니다. 환불 요청은 고객센터를 통해 접수해 주세요.',
    },
    {
      id: 3,
      category: 'credits',
      question: '크레딧 유효기간이 있나요?',
      answer: '아니요, 크레딧은 유효기간 없이 영구적으로 사용 가능합니다.',
    },
    {
      id: 4,
      category: 'service',
      question: '어떤 AI 서비스를 이용할 수 있나요?',
      answer:
        '운세/점술, 이미지 편집, 엔터테인먼트, 건강/웰빙 등 4가지 카테고리에 걸쳐 30여 개의 AI 서비스를 제공하고 있습니다. 각 서비스는 최신 AI 기술을 활용하여 정확하고 빠른 결과를 제공합니다.',
    },
    {
      id: 5,
      category: 'service',
      question: '서비스 이용 시 크레딧은 얼마나 필요한가요?',
      answer:
        '서비스마다 필요한 크레딧이 다릅니다. 일반적으로 간단한 서비스는 50-100 크레딧, 복잡한 서비스는 150-300 크레딧이 필요합니다. 각 서비스 페이지에서 정확한 크레딧을 확인하실 수 있습니다.',
    },
    {
      id: 6,
      category: 'service',
      question: '결과물은 어디서 확인할 수 있나요?',
      answer:
        '서비스 이용 후 생성된 결과물은 "내 결과물" 페이지에서 확인하실 수 있습니다. 결과물은 다운로드, 공유, 삭제가 가능합니다.',
    },
    {
      id: 7,
      category: 'account',
      question: '계정은 어떻게 만드나요?',
      answer:
        '우측 상단의 "회원가입" 버튼을 클릭하여 이메일로 가입하거나, Google, Kakao 계정으로 간편 가입이 가능합니다.',
    },
    {
      id: 8,
      category: 'account',
      question: '비밀번호를 잊어버렸어요',
      answer:
        '로그인 페이지에서 "비밀번호를 잊으셨나요?" 링크를 클릭하여 비밀번호 재설정 이메일을 받으실 수 있습니다.',
    },
    {
      id: 9,
      category: 'account',
      question: '계정 정보는 어떻게 수정하나요?',
      answer:
        '프로필 페이지에서 사용자명을 수정할 수 있으며, 설정 페이지에서 비밀번호, 언어, 알림 설정 등을 변경하실 수 있습니다.',
    },
    {
      id: 10,
      category: 'technical',
      question: '서비스 오류가 발생했어요',
      answer:
        '페이지를 새로고침하거나 다시 로그인해 보세요. 문제가 계속되면 고객센터로 문의해 주시면 신속히 도와드리겠습니다.',
    },
    {
      id: 11,
      category: 'technical',
      question: '결과가 마음에 들지 않아요',
      answer:
        'AI 서비스는 데이터와 알고리즘을 기반으로 결과를 생성합니다. 같은 서비스를 다시 이용하시면 다른 결과를 얻으실 수 있습니다. 크레딧은 결과 생성 시 차감되므로 신중하게 이용해 주세요.',
    },
  ];

  const categories = [
    { id: 'all', name: '전체', icon: 'apps' },
    { id: 'credits', name: '크레딧', icon: 'toll' },
    { id: 'service', name: '서비스', icon: 'star' },
    { id: 'account', name: '계정', icon: 'person' },
    { id: 'technical', name: '기술지원', icon: 'build' },
  ];

  // 필터링
  const filteredFaqs = faqs
    .filter((faq) => selectedCategory === 'all' || faq.category === selectedCategory)
    .filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="text-white text-4xl font-bold mb-3">도움말 센터</h1>
        <p className="text-[#ab9eb7] text-lg">무엇을 도와드릴까요?</p>
      </div>

      {/* 검색 */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="궁금한 내용을 검색해보세요..."
            className="w-full bg-[#1a1625] text-white px-6 py-4 pr-12 rounded-2xl border border-white/10 focus:border-primary focus:outline-none"
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#ab9eb7] text-2xl">
            search
          </span>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
              selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'bg-[#1a1625] text-[#ab9eb7] hover:bg-[#2a2436] border border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* FAQ 목록 */}
      <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10 mb-8">
        <h2 className="text-white text-2xl font-bold mb-6">자주 묻는 질문</h2>

        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-[#2a2436] rounded-lg border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#3a3446] transition"
                >
                  <span className="text-white font-semibold pr-4">{faq.question}</span>
                  <span
                    className={`material-symbols-outlined text-primary transition-transform ${
                      openFaq === faq.id ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {openFaq === faq.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/10">
                    <p className="text-[#ab9eb7] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">search_off</span>
            </div>
            <p className="text-[#ab9eb7]">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* 가이드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 시작하기 */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-400 text-2xl">
                rocket_launch
              </span>
            </div>
            <h3 className="text-white text-xl font-bold">시작하기</h3>
          </div>
          <p className="text-[#ab9eb7] text-sm mb-4">
            AI Platform을 처음 사용하시나요? 기본 사용법을 확인해보세요
          </p>
          <button className="text-purple-400 hover:text-purple-300 transition font-medium flex items-center gap-1">
            가이드 보기
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* 서비스 가이드 */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-2xl">menu_book</span>
            </div>
            <h3 className="text-white text-xl font-bold">서비스 가이드</h3>
          </div>
          <p className="text-[#ab9eb7] text-sm mb-4">
            각 AI 서비스의 상세한 이용 방법을 알아보세요
          </p>
          <button className="text-blue-400 hover:text-blue-300 transition font-medium flex items-center gap-1">
            가이드 보기
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* 문의하기 */}
      <div className="bg-[#1a1625] rounded-2xl p-8 border border-white/10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
        </div>
        <h3 className="text-white text-2xl font-bold mb-2">궁금한 점이 있으신가요?</h3>
        <p className="text-[#ab9eb7] mb-6">
          FAQ에서 답을 찾지 못하셨다면 고객센터로 문의해주세요
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">email</span>
            이메일 문의
          </button>
          <button className="px-6 py-3 bg-[#2a2436] text-white rounded-lg hover:bg-[#3a3446] transition font-medium flex items-center justify-center gap-2 border border-white/10">
            <span className="material-symbols-outlined">chat</span>
            1:1 채팅
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-[#ab9eb7] text-sm">
            운영시간: 평일 09:00 - 18:00 | support@aiplatform.com
          </p>
        </div>
      </div>
    </div>
  );
}

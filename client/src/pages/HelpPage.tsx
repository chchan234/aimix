import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GettingStartedGuideModal from '../components/GettingStartedGuideModal';
import ServiceGuideModal from '../components/ServiceGuideModal';
import ContactFormModal from '../components/ContactFormModal';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export default function HelpPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 모달 상태
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(false);
  const [isServiceGuideOpen, setIsServiceGuideOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactType, setContactType] = useState<'email' | 'chat'>('email');

  // FAQ 데이터
  const faqs: FAQ[] = [
    {
      id: 1,
      category: 'credits',
      question: t('help.faq.questions.credits1.q'),
      answer: t('help.faq.questions.credits1.a'),
    },
    {
      id: 2,
      category: 'credits',
      question: t('help.faq.questions.credits2.q'),
      answer: t('help.faq.questions.credits2.a'),
    },
    {
      id: 3,
      category: 'credits',
      question: t('help.faq.questions.credits3.q'),
      answer: t('help.faq.questions.credits3.a'),
    },
    {
      id: 4,
      category: 'service',
      question: t('help.faq.questions.service1.q'),
      answer: t('help.faq.questions.service1.a'),
    },
    {
      id: 5,
      category: 'service',
      question: t('help.faq.questions.service2.q'),
      answer: t('help.faq.questions.service2.a'),
    },
    {
      id: 6,
      category: 'service',
      question: t('help.faq.questions.service3.q'),
      answer: t('help.faq.questions.service3.a'),
    },
    {
      id: 7,
      category: 'account',
      question: t('help.faq.questions.account1.q'),
      answer: t('help.faq.questions.account1.a'),
    },
    {
      id: 8,
      category: 'account',
      question: t('help.faq.questions.account2.q'),
      answer: t('help.faq.questions.account2.a'),
    },
    {
      id: 9,
      category: 'account',
      question: t('help.faq.questions.account3.q'),
      answer: t('help.faq.questions.account3.a'),
    },
    {
      id: 10,
      category: 'technical',
      question: t('help.faq.questions.technical1.q'),
      answer: t('help.faq.questions.technical1.a'),
    },
    {
      id: 11,
      category: 'technical',
      question: t('help.faq.questions.technical2.q'),
      answer: t('help.faq.questions.technical2.a'),
    },
  ];

  const categories = [
    { id: 'all', name: t('help.categories.all'), icon: 'apps' },
    { id: 'credits', name: t('help.categories.credits'), icon: 'toll' },
    { id: 'service', name: t('help.categories.service'), icon: 'star' },
    { id: 'account', name: t('help.categories.account'), icon: 'person' },
    { id: 'technical', name: t('help.categories.technical'), icon: 'build' },
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
        <h1 className="text-white text-4xl font-bold mb-3">{t('help.title')}</h1>
        <p className="text-[#ab9eb7] text-lg">{t('help.subtitle')}</p>
      </div>

      {/* 검색 */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('help.search.placeholder')}
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
        <h2 className="text-white text-2xl font-bold mb-6">{t('help.faq.title')}</h2>

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
            <p className="text-[#ab9eb7]">{t('help.noResults')}</p>
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
            <h3 className="text-white text-xl font-bold">{t('help.guides.gettingStarted.title')}</h3>
          </div>
          <p className="text-[#ab9eb7] text-sm mb-4">
            {t('help.guides.gettingStarted.description')}
          </p>
          <button
            onClick={() => setIsGettingStartedOpen(true)}
            className="text-purple-400 hover:text-purple-300 transition font-medium flex items-center gap-1"
          >
            {t('help.guides.gettingStarted.button')}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* 서비스 가이드 */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-2xl">menu_book</span>
            </div>
            <h3 className="text-white text-xl font-bold">{t('help.guides.serviceGuide.title')}</h3>
          </div>
          <p className="text-[#ab9eb7] text-sm mb-4">
            {t('help.guides.serviceGuide.description')}
          </p>
          <button
            onClick={() => setIsServiceGuideOpen(true)}
            className="text-blue-400 hover:text-blue-300 transition font-medium flex items-center gap-1"
          >
            {t('help.guides.serviceGuide.button')}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* 문의하기 */}
      <div className="bg-[#1a1625] rounded-2xl p-8 border border-white/10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
        </div>
        <h3 className="text-white text-2xl font-bold mb-2">{t('help.contact.title')}</h3>
        <p className="text-[#ab9eb7] mb-6">
          {t('help.contact.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setContactType('email');
              setIsContactFormOpen(true);
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">email</span>
            {t('help.contact.buttons.email')}
          </button>
          <button
            onClick={() => {
              setContactType('chat');
              setIsContactFormOpen(true);
            }}
            className="px-6 py-3 bg-[#2a2436] text-white rounded-lg hover:bg-[#3a3446] transition font-medium flex items-center justify-center gap-2 border border-white/10"
          >
            <span className="material-symbols-outlined">chat</span>
            {t('help.contact.buttons.chat')}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-[#ab9eb7] text-sm">
            {t('help.contact.hours')}
          </p>
        </div>
      </div>

      {/* 모달들 */}
      <GettingStartedGuideModal isOpen={isGettingStartedOpen} onClose={() => setIsGettingStartedOpen(false)} />
      <ServiceGuideModal isOpen={isServiceGuideOpen} onClose={() => setIsServiceGuideOpen(false)} />
      <ContactFormModal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        contactType={contactType}
      />
    </div>
  );
}

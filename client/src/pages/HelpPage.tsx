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
      category: 'service',
      question: t('help.faq.questions.service4.q'),
      answer: t('help.faq.questions.service4.a'),
    },
    {
      id: 8,
      category: 'account',
      question: t('help.faq.questions.account1.q'),
      answer: t('help.faq.questions.account1.a'),
    },
    {
      id: 9,
      category: 'account',
      question: t('help.faq.questions.account2.q'),
      answer: t('help.faq.questions.account2.a'),
    },
    {
      id: 10,
      category: 'account',
      question: t('help.faq.questions.account3.q'),
      answer: t('help.faq.questions.account3.a'),
    },
    {
      id: 11,
      category: 'technical',
      question: t('help.faq.questions.technical1.q'),
      answer: t('help.faq.questions.technical1.a'),
    },
    {
      id: 12,
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
        <h1 className="text-foreground text-4xl font-serif font-bold mb-3">{t('help.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('help.subtitle')}</p>
      </div>

      {/* 검색 */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('help.search.placeholder')}
            className="w-full glass-panel text-foreground px-6 py-4 pr-12 rounded-2xl border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-2xl">
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
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition ${selectedCategory === category.id
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg shadow-pink-300/50'
                : 'bg-white/70 text-muted-foreground hover:bg-pink-50/80 border border-pink-100/50'
              }`}
          >
            <span className="material-symbols-outlined text-xl">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* FAQ 목록 */}
      <div className="glass-panel rounded-2xl p-6 mb-8">
        <h2 className="text-foreground text-2xl font-serif font-bold mb-6">{t('help.faq.title')}</h2>

        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white/40 rounded-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/60 transition"
                >
                  <span className="text-foreground font-semibold pr-4">{faq.question}</span>
                  <span
                    className={`material-symbols-outlined text-primary transition-transform ${openFaq === faq.id ? 'rotate-180' : ''
                      }`}
                  >
                    expand_more
                  </span>
                </button>

                {openFaq === faq.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-border">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-pink-600 text-3xl">search_off</span>
          </div>
            <p className="text-muted-foreground">{t('help.noResults')}</p>
          </div>
        )}
      </div>

      {/* 가이드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 시작하기 */}
        <div className="bg-gradient-to-br from-pink-100/80 to-purple-100/80 rounded-2xl p-6 border border-pink-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-xl flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-2xl">
                rocket_launch
              </span>
            </div>
            <h3 className="text-foreground text-xl font-serif font-bold">{t('help.guides.gettingStarted.title')}</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            {t('help.guides.gettingStarted.description')}
          </p>
          <button
            onClick={() => setIsGettingStartedOpen(true)}
            className="text-pink-600 hover:text-pink-700 transition font-medium flex items-center gap-1"
          >
            {t('help.guides.gettingStarted.button')}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* 서비스 가이드 */}
        <div className="bg-gradient-to-br from-blue-100/80 to-cyan-100/80 rounded-2xl p-6 border border-blue-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-xl flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-2xl">menu_book</span>
            </div>
            <h3 className="text-foreground text-xl font-serif font-bold">{t('help.guides.serviceGuide.title')}</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            {t('help.guides.serviceGuide.description')}
          </p>
          <button
            onClick={() => setIsServiceGuideOpen(true)}
            className="text-blue-600 hover:text-blue-500 transition font-medium flex items-center gap-1"
          >
            {t('help.guides.serviceGuide.button')}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* 문의하기 */}
      <div className="glass-panel rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="material-symbols-outlined text-white text-3xl">support_agent</span>
        </div>
        <h3 className="text-foreground text-2xl font-serif font-bold mb-2">{t('help.contact.title')}</h3>
        <p className="text-muted-foreground mb-6">
          {t('help.contact.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setContactType('email');
              setIsContactFormOpen(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl hover:from-pink-500 hover:to-purple-500 transition font-medium flex items-center justify-center gap-2 shadow-lg shadow-pink-300/50"
          >
            <span className="material-symbols-outlined">email</span>
            {t('help.contact.buttons.email')}
          </button>
          <button
            onClick={() => {
              setContactType('chat');
              setIsContactFormOpen(true);
            }}
            className="px-6 py-3 bg-white/50 text-foreground rounded-lg hover:bg-white/80 transition font-medium flex items-center justify-center gap-2 border border-border"
          >
            <span className="material-symbols-outlined">chat</span>
            {t('help.contact.buttons.chat')}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-muted-foreground text-sm">
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

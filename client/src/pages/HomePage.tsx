import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // 카테고리 → 경로 매핑
  const getCategoryPath = (categoryKey: string): string => {
    const categoryMap: Record<string, string> = {
      fortune: '/fortune',
      image: '/image',
      entertainment: '/entertainment',
      health: '/health',
    };
    return categoryMap[categoryKey] || '/';
  };

  // 모든 서비스 목록 (번역 적용)
  const allServices = useMemo(() => [
    // 운세/점술
    {
      title: t('services.fortune.saju.title'),
      description: t('services.fortune.saju.description'),
      icon: 'calendar_today',
      color: 'purple',
      category: 'fortune',
    },
    {
      title: t('services.fortune.faceReading.title'),
      description: t('services.fortune.faceReading.description'),
      icon: 'face',
      color: 'blue',
      category: 'fortune',
    },
    {
      title: t('services.fortune.palmistry.title'),
      description: t('services.fortune.palmistry.description'),
      icon: 'back_hand',
      color: 'green',
      category: 'fortune',
    },
    {
      title: t('services.fortune.horoscope.title'),
      description: t('services.fortune.horoscope.description'),
      icon: 'star',
      color: 'yellow',
      category: 'fortune',
    },
    {
      title: t('services.fortune.zodiac.title'),
      description: t('services.fortune.zodiac.description'),
      icon: 'pets',
      color: 'orange',
      category: 'fortune',
    },
    {
      title: t('services.fortune.loveCompatibility.title'),
      description: t('services.fortune.loveCompatibility.description'),
      icon: 'favorite',
      color: 'pink',
      category: 'fortune',
    },
    {
      title: t('services.fortune.nameCompatibility.title'),
      description: t('services.fortune.nameCompatibility.description'),
      icon: 'edit',
      color: 'indigo',
      category: 'fortune',
    },
    {
      title: t('services.fortune.marriageCompatibility.title'),
      description: t('services.fortune.marriageCompatibility.description'),
      icon: 'family_restroom',
      color: 'red',
      category: 'fortune',
    },
    // 이미지 편집
    {
      title: t('services.image.profileGenerator.title'),
      description: t('services.image.profileGenerator.description'),
      icon: 'account_circle',
      color: 'cyan',
      category: 'image',
    },
    {
      title: t('services.image.caricature.title'),
      description: t('services.image.caricature.description'),
      icon: 'draw',
      color: 'purple',
      category: 'image',
    },
    {
      title: t('services.image.idPhoto.title'),
      description: t('services.image.idPhoto.description'),
      icon: 'badge',
      color: 'blue',
      category: 'image',
    },
    {
      title: t('services.image.faceSwap.title'),
      description: t('services.image.faceSwap.description'),
      icon: 'swap_horiz',
      color: 'pink',
      category: 'image',
    },
    {
      title: t('services.image.ageTransform.title'),
      description: t('services.image.ageTransform.description'),
      icon: 'schedule',
      color: 'orange',
      category: 'image',
    },
    {
      title: t('services.image.genderSwap.title'),
      description: t('services.image.genderSwap.description'),
      icon: 'wc',
      color: 'indigo',
      category: 'image',
    },
    {
      title: t('services.image.colorization.title'),
      description: t('services.image.colorization.description'),
      icon: 'palette',
      color: 'green',
      category: 'image',
    },
    {
      title: t('services.image.backgroundRemoval.title'),
      description: t('services.image.backgroundRemoval.description'),
      icon: 'layers',
      color: 'yellow',
      category: 'image',
    },
    {
      title: t('services.image.hairstyle.title'),
      description: t('services.image.hairstyle.description'),
      icon: 'face_retouching_natural',
      color: 'red',
      category: 'image',
    },
    {
      title: t('services.image.tattoo.title'),
      description: t('services.image.tattoo.description'),
      icon: 'auto_awesome',
      color: 'purple',
      category: 'image',
    },
    // 엔터테인먼트
    {
      title: t('services.entertainment.mbti.title'),
      description: t('services.entertainment.mbti.description'),
      icon: 'psychology',
      color: 'purple',
      category: 'entertainment',
    },
    {
      title: t('services.entertainment.enneagram.title'),
      description: t('services.entertainment.enneagram.description'),
      icon: 'hub',
      color: 'blue',
      category: 'entertainment',
    },
    {
      title: t('services.entertainment.bigFive.title'),
      description: t('services.entertainment.bigFive.description'),
      icon: 'workspaces',
      color: 'green',
      category: 'entertainment',
    },
    {
      title: t('services.entertainment.stress.title'),
      description: t('services.entertainment.stress.description'),
      icon: 'spa',
      color: 'cyan',
      category: 'entertainment',
    },
    {
      title: t('services.entertainment.lookalike.title'),
      description: t('services.entertainment.lookalike.description'),
      icon: 'compare',
      color: 'pink',
      category: 'entertainment',
    },
    {
      title: t('services.entertainment.goldenChild.title'),
      description: t('services.entertainment.goldenChild.description'),
      icon: 'child_care',
      color: 'orange',
      category: 'entertainment',
    },
    // 건강/웰빙
    {
      title: t('services.health.bodyType.title'),
      description: t('services.health.bodyType.description'),
      icon: 'accessibility',
      color: 'blue',
      category: 'health',
    },
    {
      title: t('services.health.bmi.title'),
      description: t('services.health.bmi.description'),
      icon: 'monitor_weight',
      color: 'green',
      category: 'health',
    },
    {
      title: t('services.health.skinAnalysis.title'),
      description: t('services.health.skinAnalysis.description'),
      icon: 'face_6',
      color: 'pink',
      category: 'health',
    },
  ], [t]);

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
    pink: 'bg-pink-500/20 text-pink-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    red: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  // 랜덤으로 6개 선택
  const randomServices = useMemo(() => {
    const shuffled = [...allServices].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, [allServices]);

  // 이번주 인기 서비스 (추후 좋아요 기능으로 대체)
  const popularServices = useMemo(() => [
    {
      title: t('services.fortune.saju.title'),
      description: t('services.fortune.saju.description'),
      icon: 'calendar_today',
      color: 'purple',
      category: 'fortune',
      rating: 4.9,
      users: 3245,
    },
    {
      title: t('services.image.profileGenerator.title'),
      description: t('services.image.profileGenerator.description'),
      icon: 'account_circle',
      color: 'cyan',
      category: 'image',
      rating: 4.8,
      users: 2876,
    },
    {
      title: t('services.entertainment.mbti.title'),
      description: t('services.entertainment.mbti.description'),
      icon: 'psychology',
      color: 'purple',
      category: 'entertainment',
      rating: 4.7,
      users: 2654,
    },
    {
      title: t('services.fortune.faceReading.title'),
      description: t('services.fortune.faceReading.description'),
      icon: 'face',
      color: 'blue',
      category: 'fortune',
      rating: 4.6,
      users: 1987,
    },
    {
      title: t('services.image.faceSwap.title'),
      description: t('services.image.faceSwap.description'),
      icon: 'swap_horiz',
      color: 'pink',
      category: 'image',
      rating: 4.8,
      users: 1756,
    },
    {
      title: t('services.entertainment.lookalike.title'),
      description: t('services.entertainment.lookalike.description'),
      icon: 'compare',
      color: 'pink',
      category: 'entertainment',
      rating: 4.5,
      users: 1543,
    },
  ], [t]);

  // 순위 뱃지 아이콘
  const getRankBadge = (rank: number) => {
    const badges = ['🥇', '🥈', '🥉', '4', '5', '6'];
    return badges[rank - 1];
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Image */}
      <div className="w-full">
        <div
          className="bg-cover bg-center flex flex-col items-center justify-center overflow-hidden rounded-xl min-h-[140px]"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="flex flex-col items-center gap-2 p-6">
            {/* Weekly Update Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-1">
              <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
              <span className="text-white text-sm font-medium">
                {t('home.weeklyUpdate')}
              </span>
            </div>
            <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight text-center">
              The Essential AI Platform
            </h1>
          </div>
        </div>
      </div>

      {/* Popular This Week */}
      <div>
        <div className="px-4 pb-3 pt-5">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
            {t('home.popularThisWeek')}
          </h2>
          <p className="text-[#ab9eb7] text-sm mt-1">
            {t('home.popularSubtitle')}
          </p>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-3">
            {popularServices.map((service, index) => (
              <div
                key={index}
                onClick={() => setLocation(getCategoryPath(service.category))}
                className="relative flex flex-col gap-3 p-4 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer min-w-[160px] max-w-[160px]"
              >
                {/* 순위 뱃지 */}
                <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full">
                  <span className="text-lg">{getRankBadge(index + 1)}</span>
                </div>

                <div
                  className={`flex items-center justify-center w-12 h-12 ${
                    colorClasses[service.color]
                  } rounded-lg`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {service.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-white text-sm font-semibold leading-tight">
                    {service.title}
                  </p>
                  <p className="text-[#ab9eb7] text-xs font-normal leading-normal">
                    {service.description}
                  </p>
                  <p className="text-primary text-xs font-medium leading-normal mt-1">
                    {t(`home.categories.${service.category}`)}
                  </p>
                  {/* 평점 및 사용자 수 */}
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="flex items-center gap-0.5 text-yellow-400">
                      <span className="material-symbols-outlined text-sm">star</span>
                      {service.rating}
                    </span>
                    <span className="text-[#ab9eb7]">•</span>
                    <span className="text-[#ab9eb7]">
                      {service.users.toLocaleString()} {t('home.users')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {popularServices.map((service, index) => (
            <div
              key={index}
              onClick={() => setLocation(getCategoryPath(service.category))}
              className="relative flex flex-col gap-3 p-4 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* 순위 뱃지 */}
              <div className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 bg-primary/20 rounded-full">
                <span className="text-xl">{getRankBadge(index + 1)}</span>
              </div>

              <div
                className={`flex items-center justify-center w-12 h-12 ${
                  colorClasses[service.color]
                } rounded-lg`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white text-sm font-semibold leading-tight">
                  {service.title}
                </p>
                <p className="text-[#ab9eb7] text-xs font-normal leading-normal">
                  {service.description}
                </p>
                <p className="text-primary text-xs font-medium leading-normal mt-1">
                  {t(`home.categories.${service.category}`)}
                </p>
                {/* 평점 및 사용자 수 */}
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="flex items-center gap-0.5 text-yellow-400">
                    <span className="material-symbols-outlined text-sm">star</span>
                    {service.rating}
                  </span>
                  <span className="text-[#ab9eb7]">•</span>
                  <span className="text-[#ab9eb7]">
                    {service.users.toLocaleString()} {t('home.users')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Random Services */}
      <div>
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          {t('home.quickStart')}
        </h2>
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-3">
            {randomServices.map((service, index) => (
              <div
                key={index}
                onClick={() => setLocation(getCategoryPath(service.category))}
                className="flex flex-col gap-3 p-4 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer min-w-[160px] max-w-[160px]"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 ${
                    colorClasses[service.color]
                  } rounded-lg`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {service.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-white text-sm font-semibold leading-tight">
                    {service.title}
                  </p>
                  <p className="text-[#ab9eb7] text-xs font-normal leading-normal">
                    {service.description}
                  </p>
                  <p className="text-primary text-xs font-medium leading-normal mt-1">
                    {t(`home.categories.${service.category}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {randomServices.map((service, index) => (
            <div
              key={index}
              onClick={() => setLocation(getCategoryPath(service.category))}
              className="flex flex-col gap-3 p-4 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div
                className={`flex items-center justify-center w-12 h-12 ${
                  colorClasses[service.color]
                } rounded-lg`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white text-sm font-semibold leading-tight">
                  {service.title}
                </p>
                <p className="text-[#ab9eb7] text-xs font-normal leading-normal">
                  {service.description}
                </p>
                <p className="text-primary text-xs font-medium leading-normal mt-1">
                  {t(`home.categories.${service.category}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

export default function EntertainmentPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const services = useMemo(() => ({
    psychology: [
      {
        title: t('services.entertainment.mbti.title'),
        description: t('services.entertainment.mbti.description'),
        icon: 'psychology',
        color: 'purple',
        path: '/services/mbti-analysis',
      },
      {
        title: t('services.entertainment.enneagram.title'),
        description: t('services.entertainment.enneagram.description'),
        icon: 'hub',
        color: 'blue',
        path: '/services/enneagram-test',
      },
      {
        title: t('services.entertainment.bigFive.title'),
        description: t('services.entertainment.bigFive.description'),
        icon: 'workspaces',
        color: 'green',
        path: '/services/bigfive-test',
      },
      {
        title: t('services.entertainment.stress.title'),
        description: t('services.entertainment.stress.description'),
        icon: 'spa',
        color: 'cyan',
        path: '/services/stress-test',
      },
      {
        title: t('services.entertainment.geumjjoki.title'),
        description: t('services.entertainment.geumjjoki.description'),
        icon: 'celebration',
        color: 'orange',
        path: '/services/geumjjoki-test',
      },
    ],
    fun: [
      {
        title: t('services.entertainment.lookalike.title'),
        description: t('services.entertainment.lookalike.description'),
        icon: 'compare',
        color: 'pink',
        path: '/services/lookalike',
      },
      {
        title: 'AI 반려동물 소울메이트',
        description: '우리 아이의 전생과 MBTI 분석',
        icon: 'pets',
        color: 'orange',
        path: '/services/pet-soulmate',
      },
      {
        title: '2세 얼굴 예측',
        description: '미래 아이의 얼굴 예측',
        icon: 'child_care',
        color: 'pink',
        path: '/services/baby-face',
      },
    ],
  }), [t]);

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-200/60 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    blue: 'bg-blue-200/60 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    green: 'bg-emerald-200/60 text-emerald-600 dark:bg-green-500/20 dark:text-green-400',
    cyan: 'bg-cyan-200/60 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    pink: 'bg-pink-200/60 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
    orange: 'bg-orange-200/60 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-foreground text-3xl font-serif font-bold mb-2">
          {t('pages.entertainment.title')}
        </h1>
        <p className="text-muted-foreground text-base">
          {t('pages.entertainment.subtitle')}
        </p>
      </div>

      {/* Psychology Tests */}
      <div>
        <h2 className="text-foreground text-xl font-serif font-bold px-4 pb-4">{t('pages.entertainment.sections.psychology')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.psychology.map((service, index) => (
            <div
              key={index}
              onClick={() => service.path && setLocation(service.path)}
              className="flex flex-col aspect-square gap-3 p-4 rounded-2xl bg-white/80 dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-purple-950/60 hover:shadow-2xl hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30 transition cursor-pointer justify-center items-center text-center"
            >
              <div
                className={`flex items-center justify-center w-16 h-16 ${
                  colorClasses[service.color]
                } rounded-lg`}
              >
                <span className="material-symbols-outlined text-4xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-foreground text-lg font-semibold font-serif">
                  {service.title}
                </p>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fun/Challenge */}
      <div>
        <h2 className="text-foreground text-xl font-serif font-bold px-4 pb-4">{t('pages.entertainment.sections.fun')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.fun.map((service, index) => (
            <div
              key={index}
              onClick={() => service.path && setLocation(service.path)}
              className="flex flex-col aspect-square gap-3 p-4 rounded-2xl bg-white/80 dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-purple-950/60 hover:shadow-2xl hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30 transition cursor-pointer justify-center items-center text-center"
            >
              <div
                className={`flex items-center justify-center w-16 h-16 ${
                  colorClasses[service.color]
                } rounded-lg`}
              >
                <span className="material-symbols-outlined text-4xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-foreground text-lg font-semibold font-serif">
                  {service.title}
                </p>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

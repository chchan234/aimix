import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

export default function HealthPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const services = useMemo(() => ({
    health: [
      {
        title: t('services.health.bodyType.title'),
        description: t('services.health.bodyType.description'),
        icon: 'accessibility',
        color: 'blue',
      },
      {
        title: t('services.health.bmi.title'),
        description: t('services.health.bmi.description'),
        icon: 'monitor_weight',
        color: 'green',
      },
      {
        title: t('services.health.skinAnalysis.title'),
        description: t('services.health.skinAnalysis.description'),
        icon: 'face_6',
        color: 'pink',
      },
      {
        title: '퍼스널 컬러 진단',
        description: '나에게 어울리는 색 찾기',
        icon: 'palette',
        color: 'purple',
        path: '/services/personal-color',
      },
    ],
  }), [t]);

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-200/60 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    green: 'bg-emerald-200/60 text-emerald-600 dark:bg-green-500/20 dark:text-green-400',
    pink: 'bg-pink-200/60 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
    purple: 'bg-purple-200/60 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-foreground text-3xl font-serif font-bold mb-2">
          {t('pages.health.title')}
        </h1>
        <p className="text-muted-foreground text-base">
          {t('pages.health.subtitle')}
        </p>
      </div>

      {/* Health Analysis */}
      <div>
        <h2 className="text-foreground text-xl font-serif font-bold px-4 pb-4">{t('pages.health.sections.analysis')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.health.map((service, index) => (
            <div
              key={index}
              onClick={() => (service as any).path && setLocation((service as any).path)}
              className="flex flex-col gap-4 p-6 rounded-2xl glass-panel hover:bg-white/90 dark:hover:bg-purple-950/60 hover:shadow-2xl hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30 transition cursor-pointer"
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

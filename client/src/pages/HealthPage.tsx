import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function HealthPage() {
  const { t } = useTranslation();

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
    ],
  }), [t]);

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    pink: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-white text-3xl font-bold mb-2">
          {t('pages.health.title')}
        </h1>
        <p className="text-[#ab9eb7] text-base">
          {t('pages.health.subtitle')}
        </p>
      </div>

      {/* Health Analysis */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">{t('pages.health.sections.analysis')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.health.map((service, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-6 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 transition cursor-pointer"
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
                <p className="text-white text-lg font-semibold">
                  {service.title}
                </p>
                <p className="text-[#ab9eb7] text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

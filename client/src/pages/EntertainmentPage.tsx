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
      },
    ],
  }), [t]);

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    pink: 'bg-pink-500/20 text-pink-400',
    orange: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-white text-3xl font-bold mb-2">
          {t('pages.entertainment.title')}
        </h1>
        <p className="text-[#ab9eb7] text-base">
          {t('pages.entertainment.subtitle')}
        </p>
      </div>

      {/* Psychology Tests */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">{t('pages.entertainment.sections.psychology')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.psychology.map((service, index) => (
            <div
              key={index}
              onClick={() => service.path && setLocation(service.path)}
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

      {/* Fun/Challenge */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">{t('pages.entertainment.sections.fun')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.fun.map((service, index) => (
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

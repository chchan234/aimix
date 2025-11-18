import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

export default function FortunePage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const services = useMemo(() => ({
    traditional: [
      {
        title: t('services.fortune.saju.title'),
        description: t('services.fortune.saju.description'),
        icon: 'calendar_today',
        color: 'purple',
        path: '/services/saju',
      },
      {
        title: t('services.fortune.faceReading.title'),
        description: t('services.fortune.faceReading.description'),
        icon: 'face',
        color: 'blue',
        path: '/services/face-reading',
      },
      {
        title: t('services.fortune.palmistry.title'),
        description: t('services.fortune.palmistry.description'),
        icon: 'back_hand',
        color: 'green',
        path: '/services/palmistry',
      },
    ],
    western: [
      {
        title: t('services.fortune.horoscope.title'),
        description: t('services.fortune.horoscope.description'),
        icon: 'star',
        color: 'yellow',
        path: '/services/horoscope',
      },
      {
        title: t('services.fortune.zodiac.title'),
        description: t('services.fortune.zodiac.description'),
        icon: 'pets',
        color: 'orange',
        path: '/services/zodiac',
      },
    ],
    compatibility: [
      {
        title: t('services.fortune.loveCompatibility.title'),
        description: t('services.fortune.loveCompatibility.description'),
        icon: 'favorite',
        color: 'pink',
        path: '/services/love-compatibility',
      },
      {
        title: t('services.fortune.nameCompatibility.title'),
        description: t('services.fortune.nameCompatibility.description'),
        icon: 'edit',
        color: 'indigo',
        path: '/services/name-compatibility',
      },
      {
        title: t('services.fortune.marriageCompatibility.title'),
        description: t('services.fortune.marriageCompatibility.description'),
        icon: 'family_restroom',
        color: 'red',
        path: '/services/marriage-compatibility',
      },
    ],
  }), [t]);

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
    pink: 'bg-pink-500/20 text-pink-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-white text-3xl font-bold mb-2">{t('pages.fortune.title')}</h1>
        <p className="text-[#ab9eb7] text-base">
          {t('pages.fortune.subtitle')}
        </p>
      </div>

      {/* Traditional Fortune */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">{t('pages.fortune.sections.traditional')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.traditional.map((service, index) => (
            <div
              key={index}
              onClick={() => service.path && setLocation(service.path)}
              className={`flex flex-col gap-4 p-6 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 transition ${
                service.path ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
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
                {!service.path && (
                  <span className="text-xs text-yellow-500">준비 중</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Western Fortune */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">{t('pages.fortune.sections.western')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.western.map((service, index) => (
            <div
              key={index}
              onClick={() => service.path && setLocation(service.path)}
              className={`flex flex-col gap-4 p-6 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 transition ${
                service.path ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
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
                {!service.path && (
                  <span className="text-xs text-yellow-500">준비 중</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compatibility */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">{t('pages.fortune.sections.compatibility')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.compatibility.map((service, index) => (
            <div
              key={index}
              onClick={() => service.path && setLocation(service.path)}
              className={`flex flex-col gap-4 p-6 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 transition ${
                service.path ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
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
                {!service.path && (
                  <span className="text-xs text-yellow-500">준비 중</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

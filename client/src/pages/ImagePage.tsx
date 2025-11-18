import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

export default function ImagePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const services = useMemo(() => ({
    avatar: [
      {
        title: t('services.image.profileGenerator.title'),
        description: t('services.image.profileGenerator.description'),
        icon: 'account_circle',
        color: 'cyan',
        path: '/services/profile-generator',
      },
      {
        title: t('services.image.caricature.title'),
        description: t('services.image.caricature.description'),
        icon: 'draw',
        color: 'purple',
        path: '/services/caricature',
      },
      {
        title: t('services.image.idPhoto.title'),
        description: t('services.image.idPhoto.description'),
        icon: 'badge',
        color: 'blue',
        path: '/services/id-photo',
      },
    ],
    editing: [
      {
        title: t('services.image.ageTransform.title'),
        description: t('services.image.ageTransform.description'),
        icon: 'schedule',
        color: 'orange',
        path: '/services/age-transform',
      },
      {
        title: t('services.image.genderSwap.title'),
        description: t('services.image.genderSwap.description'),
        icon: 'wc',
        color: 'indigo',
        path: '/services/gender-swap',
      },
      {
        title: t('services.image.colorization.title'),
        description: t('services.image.colorization.description'),
        icon: 'palette',
        color: 'green',
        path: '/services/colorization',
      },
    ],
    creative: [
      {
        title: t('services.image.backgroundRemoval.title'),
        description: t('services.image.backgroundRemoval.description'),
        icon: 'layers',
        color: 'yellow',
        path: '/services/background-removal',
      },
      {
        title: t('services.image.hairstyle.title'),
        description: t('services.image.hairstyle.description'),
        icon: 'face_retouching_natural',
        color: 'red',
        path: '/services/hairstyle',
      },
      {
        title: t('services.image.tattoo.title'),
        description: t('services.image.tattoo.description'),
        icon: 'auto_awesome',
        color: 'teal',
        path: '/services/tattoo',
      },
    ],
  }), [t]);

  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/20 text-cyan-400',
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    pink: 'bg-pink-500/20 text-pink-400',
    orange: 'bg-orange-500/20 text-orange-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
    teal: 'bg-teal-500/20 text-teal-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-white text-3xl font-bold mb-2">
          {t('pages.image.title')}
        </h1>
        <p className="text-[#ab9eb7] text-base">
          {t('pages.image.subtitle')}
        </p>
      </div>

      {/* AI Avatar/Profile */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">
          {t('pages.image.sections.avatar')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.avatar.map((service, index) => (
            <div
              key={index}
              onClick={() => setLocation(service.path)}
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

      {/* Photo Editing/Restoration */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">
          {t('pages.image.sections.editing')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.editing.map((service, index) => (
            <div
              key={index}
              onClick={() => setLocation(service.path)}
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

      {/* Creative Generation */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">{t('pages.image.sections.creative')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.creative.map((service, index) => (
            <div
              key={index}
              onClick={() => setLocation(service.path)}
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

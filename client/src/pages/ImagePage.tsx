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
    cyan: 'bg-cyan-200/60 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    purple: 'bg-purple-200/60 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    blue: 'bg-blue-200/60 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    pink: 'bg-pink-200/60 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
    orange: 'bg-orange-200/60 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    indigo: 'bg-indigo-200/60 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    green: 'bg-emerald-200/60 text-emerald-600 dark:bg-green-500/20 dark:text-green-400',
    yellow: 'bg-amber-200/60 text-amber-600 dark:bg-yellow-500/20 dark:text-yellow-400',
    red: 'bg-rose-200/60 text-rose-600 dark:bg-red-500/20 dark:text-red-400',
    teal: 'bg-teal-200/60 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-foreground text-3xl font-serif font-bold mb-2">
          {t('pages.image.title')}
        </h1>
        <p className="text-muted-foreground text-base">
          {t('pages.image.subtitle')}
        </p>
      </div>

      {/* AI Avatar/Profile */}
      <div>
        <h2 className="text-foreground text-xl font-serif font-bold px-4 pb-4">
          {t('pages.image.sections.avatar')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4">
          {services.avatar.map((service, index) => (
            <div
              key={index}
              onClick={() => setLocation(service.path)}
              className="flex flex-col gap-2 p-3 rounded-xl bg-white/80 dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-purple-950/60 hover:shadow-xl hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30 transition cursor-pointer"
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

      {/* Photo Editing/Restoration */}
      <div>
        <h2 className="text-foreground text-xl font-serif font-bold px-4 pb-4">
          {t('pages.image.sections.editing')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4">
          {services.editing.map((service, index) => (
            <div
              key={index}
              onClick={() => setLocation(service.path)}
              className="flex flex-col gap-2 p-3 rounded-xl bg-white/80 dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-purple-950/60 hover:shadow-xl hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30 transition cursor-pointer"
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

      {/* Creative Generation */}
      <div>
        <h2 className="text-foreground text-xl font-serif font-bold px-4 pb-4">{t('pages.image.sections.creative')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4">
          {services.creative.map((service, index) => (
            <div
              key={index}
              onClick={() => setLocation(service.path)}
              className="flex flex-col gap-2 p-3 rounded-xl bg-white/80 dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-purple-950/60 hover:shadow-xl hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30 transition cursor-pointer"
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

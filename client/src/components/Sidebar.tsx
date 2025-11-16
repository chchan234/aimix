import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', icon: 'home', label: t('sidebar.home') },
    { path: '/fortune', icon: 'auto_awesome', label: t('sidebar.fortune') },
    { path: '/image', icon: 'image', label: t('sidebar.image') },
    { path: '/entertainment', icon: 'sports_esports', label: t('sidebar.entertainment') },
    { path: '/health', icon: 'favorite', label: t('sidebar.health') },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar-dark p-4 flex-col justify-between hidden lg:flex">
      <div className="flex flex-col gap-8">
        {/* Navigation */}
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                    location === item.path
                      ? 'bg-primary'
                      : 'hover:bg-primary/20'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      location === item.path ? 'fill text-white' : 'text-white'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <p className="text-white text-sm font-medium leading-normal">
                    {item.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/20 cursor-pointer">
          <span className="material-symbols-outlined text-white text-2xl">settings</span>
          <p className="text-white text-sm font-medium leading-normal">{t('sidebar.settings')}</p>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/20 cursor-pointer">
          <span className="material-symbols-outlined text-white text-2xl">help</span>
          <p className="text-white text-sm font-medium leading-normal">{t('sidebar.help')}</p>
        </div>
      </div>
    </aside>
  );
}

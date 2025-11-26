import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { isAdmin } from '../services/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [exploreOpen, setExploreOpen] = useState(false);

  // 탐색 서브메뉴 항목들
  const exploreItems = [
    { path: '/fortune', icon: 'auto_awesome', label: t('sidebar.fortune') },
    { path: '/image', icon: 'image', label: t('sidebar.image') },
    { path: '/entertainment', icon: 'sports_esports', label: t('sidebar.entertainment') },
    { path: '/health', icon: 'favorite', label: t('sidebar.health') },
  ];

  // 현재 경로가 탐색 서브메뉴에 속하는지 확인
  const isExplorePath = exploreItems.some(item => item.path === location);

  // 메뉴 항목 클릭 시 사이드바 닫기
  const handleLinkClick = () => {
    onClose();
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 flex-shrink-0 bg-gray-50 dark:bg-sidebar-dark p-4 flex flex-col justify-between
          fixed top-0 left-0 h-full z-50 border-r border-gray-200 dark:border-transparent
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* 닫기 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-primary/20 transition"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-gray-700 dark:text-white text-2xl">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {/* Navigation */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              {/* 홈 */}
              <Link href="/" onClick={handleLinkClick}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                    location === '/'
                      ? 'bg-primary'
                      : 'hover:bg-primary/20'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      location === '/' ? 'fill text-white' : 'text-gray-700 dark:text-white'
                    }`}
                  >
                    home
                  </span>
                  <p className={`text-sm font-medium leading-normal ${
                    location === '/' ? 'text-white' : 'text-gray-700 dark:text-white'
                  }`}>
                    {t('sidebar.home')}
                  </p>
                </div>
              </Link>

              {/* 탐색 (아코디언) */}
              <div>
                <div
                  onClick={() => setExploreOpen(!exploreOpen)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                    isExplorePath && !exploreOpen
                      ? 'bg-primary'
                      : 'hover:bg-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        isExplorePath && !exploreOpen ? 'fill text-white' : 'text-gray-700 dark:text-white'
                      }`}
                    >
                      explore
                    </span>
                    <p className={`text-sm font-medium leading-normal ${
                      isExplorePath && !exploreOpen ? 'text-white' : 'text-gray-700 dark:text-white'
                    }`}>
                      {t('sidebar.explore')}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-gray-700 dark:text-white text-xl transition-transform" style={{ transform: exploreOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </div>

                {/* 탐색 서브메뉴 */}
                {exploreOpen && (
                  <div className="flex flex-col gap-1 mt-1 ml-6 pl-3 border-l-2 border-gray-300 dark:border-white/10">
                    {exploreItems.map((item) => (
                      <Link key={item.path} href={item.path} onClick={handleLinkClick}>
                        <div
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                            location === item.path
                              ? 'bg-primary'
                              : 'hover:bg-primary/20'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-xl ${
                              location === item.path ? 'fill text-white' : 'text-gray-700 dark:text-white'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <p className={`text-sm font-medium leading-normal ${
                            location === item.path ? 'text-white' : 'text-gray-700 dark:text-white'
                          }`}>
                            {item.label}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 내 결과물 */}
              <Link href="/my-results" onClick={handleLinkClick}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                    location === '/my-results'
                      ? 'bg-primary'
                      : 'hover:bg-primary/20'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      location === '/my-results' ? 'fill text-white' : 'text-gray-700 dark:text-white'
                    }`}
                  >
                    palette
                  </span>
                  <p className={`text-sm font-medium leading-normal ${
                    location === '/my-results' ? 'text-white' : 'text-gray-700 dark:text-white'
                  }`}>
                    {t('sidebar.myResults')}
                  </p>
                </div>
              </Link>

              {/* 크레딧 구매 */}
              <Link href="/buy-credits" onClick={handleLinkClick}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                    location === '/buy-credits'
                      ? 'bg-primary'
                      : 'hover:bg-primary/20'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      location === '/buy-credits' ? 'fill text-white' : 'text-gray-700 dark:text-white'
                    }`}
                  >
                    store
                  </span>
                  <p className={`text-sm font-medium leading-normal ${
                    location === '/buy-credits' ? 'text-white' : 'text-gray-700 dark:text-white'
                  }`}>
                    {t('sidebar.buyCredits')}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-1">
          {/* Admin menu - only visible for admin users */}
          {isAdmin() && (
            <Link href="/admin" onClick={handleLinkClick}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                location === '/admin'
                  ? 'bg-primary'
                  : 'hover:bg-primary/20'
              }`}>
                <span className={`material-symbols-outlined text-2xl ${
                  location === '/admin' ? 'fill text-white' : 'text-gray-700 dark:text-white'
                }`}>admin_panel_settings</span>
                <p className={`text-sm font-medium leading-normal ${
                  location === '/admin' ? 'text-white' : 'text-gray-700 dark:text-white'
                }`}>운영 페이지</p>
              </div>
            </Link>
          )}

          <Link href="/settings" onClick={handleLinkClick}>
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
              location === '/settings'
                ? 'bg-primary'
                : 'hover:bg-primary/20'
            }`}>
              <span className={`material-symbols-outlined text-2xl ${
                location === '/settings' ? 'fill text-white' : 'text-gray-700 dark:text-white'
              }`}>settings</span>
              <p className={`text-sm font-medium leading-normal ${
                location === '/settings' ? 'text-white' : 'text-gray-700 dark:text-white'
              }`}>{t('sidebar.settings')}</p>
            </div>
          </Link>
          <Link href="/help" onClick={handleLinkClick}>
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
              location === '/help'
                ? 'bg-primary'
                : 'hover:bg-primary/20'
            }`}>
              <span className={`material-symbols-outlined text-2xl ${
                location === '/help' ? 'fill text-white' : 'text-gray-700 dark:text-white'
              }`}>help</span>
              <p className={`text-sm font-medium leading-normal ${
                location === '/help' ? 'text-white' : 'text-gray-700 dark:text-white'
              }`}>{t('sidebar.help')}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

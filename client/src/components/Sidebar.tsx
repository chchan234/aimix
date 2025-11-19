import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

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
          w-64 flex-shrink-0 glass-panel m-4 rounded-2xl flex flex-col justify-between
          fixed top-0 left-0 h-[calc(100%-2rem)] z-50
          transition-transform duration-500 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'}
        `}
      >
        {/* 닫기 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-primary/10 transition text-foreground/60 hover:text-primary"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-2xl font-light">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {/* Navigation */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              {/* 홈 */}
              <Link href="/" onClick={handleLinkClick}>
                <div
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${location === '/'
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg shadow-pink-300/50'
                      : 'hover:bg-pink-100/60 text-foreground/80 hover:text-pink-600'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl font-light ${location === '/' ? 'fill' : ''
                      }`}
                  >
                    home
                  </span>
                  <p className={`text-base font-medium tracking-wide ${location === '/' ? 'font-serif' : 'font-sans'
                    }`}>
                    {t('sidebar.home')}
                  </p>
                </div>
              </Link>

              {/* 탐색 (아코디언) */}
              <div>
                <div
                  onClick={() => setExploreOpen(!exploreOpen)}
                  className={`flex items-center justify-between gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${isExplorePath && !exploreOpen
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg shadow-pink-300/50'
                      : 'hover:bg-pink-100/60 text-foreground/80 hover:text-pink-600'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`material-symbols-outlined text-2xl font-light ${isExplorePath ? 'fill' : ''
                        }`}
                    >
                      explore
                    </span>
                    <p className={`text-base font-medium tracking-wide ${isExplorePath ? 'font-serif' : 'font-sans'
                      }`}>
                      {t('sidebar.explore')}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-xl font-light transition-transform duration-300" style={{ transform: exploreOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </div>

                {/* 탐색 서브메뉴 */}
                {exploreOpen && (
                  <div className="flex flex-col gap-1 mt-2 ml-8 pl-4 border-l border-border/50">
                    {exploreItems.map((item) => (
                      <Link key={item.path} href={item.path} onClick={handleLinkClick}>
                        <div
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${location === item.path
                              ? 'text-pink-600 font-semibold bg-pink-100/60'
                              : 'text-foreground/70 hover:text-pink-600 hover:bg-pink-50/60'
                            }`}
                        >
                          <span
                            className={`material-symbols-outlined text-lg font-light ${location === item.path ? 'fill' : ''
                              }`}
                          >
                            {item.icon}
                          </span>
                          <p className="text-sm leading-normal">
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
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${location === '/my-results'
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg shadow-pink-300/50'
                      : 'hover:bg-pink-100/60 text-foreground/80 hover:text-pink-600'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl font-light ${location === '/my-results' ? 'fill' : ''
                      }`}
                  >
                    palette
                  </span>
                  <p className={`text-base font-medium tracking-wide ${location === '/my-results' ? 'font-serif' : 'font-sans'
                    }`}>
                    {t('sidebar.myResults')}
                  </p>
                </div>
              </Link>

              {/* 크레딧 구매 */}
              <Link href="/buy-credits" onClick={handleLinkClick}>
                <div
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${location === '/buy-credits'
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg shadow-pink-300/50'
                      : 'hover:bg-pink-100/60 text-foreground/80 hover:text-pink-600'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl font-light ${location === '/buy-credits' ? 'fill' : ''
                      }`}
                  >
                    store
                  </span>
                  <p className={`text-base font-medium tracking-wide ${location === '/buy-credits' ? 'font-serif' : 'font-sans'
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
          <Link href="/settings" onClick={handleLinkClick}>
            <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${location === '/settings'
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg shadow-pink-300/50'
                : 'hover:bg-pink-100/60 text-foreground/80 hover:text-pink-600'
              }`}>
              <span className={`material-symbols-outlined text-2xl font-light ${location === '/settings' ? 'fill' : ''
                }`}>settings</span>
              <p className={`text-base font-medium tracking-wide ${location === '/settings' ? 'font-serif' : 'font-sans'
                }`}>{t('sidebar.settings')}</p>
            </div>
          </Link>
          <Link href="/help" onClick={handleLinkClick}>
            <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${location === '/help'
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg shadow-pink-300/50'
                : 'hover:bg-pink-100/60 text-foreground/80 hover:text-pink-600'
              }`}>
              <span className={`material-symbols-outlined text-2xl font-light ${location === '/help' ? 'fill' : ''
                }`}>help</span>
              <p className={`text-base font-medium tracking-wide ${location === '/help' ? 'font-serif' : 'font-sans'
                }`}>{t('sidebar.help')}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

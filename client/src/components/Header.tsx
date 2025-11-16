import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credits, _setCredits] = useState(1200);
  const [username, setUsername] = useState('사용자');

  // 드롭다운 상태
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // 언어 상태
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  // 드롭다운 외부 클릭 감지를 위한 ref
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 설정 불러오기
  useEffect(() => {
    // 로그인 상태
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedUsername = localStorage.getItem('username') || '사용자';
    setIsLoggedIn(loggedIn);
    setUsername(savedUsername);

    // 언어 설정
    const savedLanguage = localStorage.getItem('language') as 'ko' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 언어 드롭다운 외부 클릭 시 닫기
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
      // 프로필 드롭다운 외부 클릭 시 닫기
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setProfileDropdownOpen(false);
    // 페이지 새로고침으로 모든 컴포넌트 상태 초기화
    window.location.href = '/';
  };

  const changeLanguage = (lang: 'ko' | 'en') => {
    setLanguage(lang);
    setLanguageDropdownOpen(false);

    // localStorage에 저장
    localStorage.setItem('language', lang);

    // i18n 언어 변경
    i18n.changeLanguage(lang);
  };

  return (
    <header className="h-16 bg-sidebar-dark border-b border-white/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      {/* Left: Hamburger Menu + Logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-primary/20 transition"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-white text-2xl">menu</span>
        </button>

        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-primary text-2xl">hub</span>
            <h1 className="text-white text-lg font-bold">AI Platform</h1>
          </div>
        </Link>
      </div>

      {/* Center: 검색 (나중에 추가 가능) */}
      <div className="flex-1 max-w-xl mx-auto hidden md:block">
        {/* 검색 기능 추가 예정 */}
      </div>

      {/* Right: 글로벌 설정 + 로그인 전/후 UI */}
      <div className="flex items-center gap-2">
        {/* 언어 선택 버튼 */}
        <div className="relative" ref={languageDropdownRef}>
          <button
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            className="p-2 rounded-full hover:bg-primary/20 transition"
            title={t('header.languageSelect')}
          >
            <span className="material-symbols-outlined text-white text-xl">
              language
            </span>
          </button>

          {/* 언어 드롭다운 */}
          {languageDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-sidebar-dark border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={() => changeLanguage('ko')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/20 transition ${
                  language === 'ko' ? 'bg-primary/10 text-primary' : 'text-white'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/20 transition ${
                  language === 'en' ? 'bg-primary/10 text-primary' : 'text-white'
                }`}
              >
                English
              </button>
            </div>
          )}
        </div>

        {isLoggedIn ? (
          <>
            {/* 알림 아이콘 */}
            <button className="p-2 rounded-full hover:bg-primary/20 transition relative">
              <span className="material-symbols-outlined text-white text-xl">
                notifications
              </span>
              {/* 알림 뱃지 */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 크레딧 표시 */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-lg">
              <span className="material-symbols-outlined text-primary text-lg">toll</span>
              <span className="text-white text-sm font-semibold">{credits.toLocaleString()}</span>
            </div>

            {/* 프로필 드롭다운 */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 hover:bg-primary/20 px-2 py-1.5 rounded-lg transition"
              >
                <div
                  className="w-8 h-8 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=AIplatform")',
                  }}
                ></div>
                <span className="text-white text-sm font-medium hidden md:block">{username}</span>
                <span className="material-symbols-outlined text-white text-sm hidden md:block">
                  {profileDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* 프로필 드롭다운 메뉴 */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-sidebar-dark border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                  {/* 사용자 정보 */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white text-sm font-semibold">{username}</p>
                    <p className="text-[#ab9eb7] text-xs">test@aiplatform.com</p>
                  </div>

                  {/* 크레딧 잔액 카드 */}
                  <div className="p-4">
                    <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-6 shadow-lg shadow-purple-500/30">
                      {/* 헤더 */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/90 text-sm font-medium">
                          {t('header.creditBalance')}
                        </p>
                        <span className="material-symbols-outlined text-white/60 text-2xl">
                          toll
                        </span>
                      </div>

                      {/* 크레딧 숫자 */}
                      <div className="mb-4">
                        <p className="text-white text-5xl font-bold">
                          {credits.toLocaleString()}
                        </p>
                      </div>

                      {/* 충전 버튼 */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setLocation('/buy-credits');
                        }}
                        className="w-full bg-white text-[#7C3AED] font-semibold py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-98"
                      >
                        {t('header.rechargeCredits')}
                      </button>
                    </div>
                  </div>

                  {/* 메뉴 항목들 */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setLocation('/profile');
                    }}
                    className="w-full px-4 py-2 text-left text-white text-sm hover:bg-primary/20 transition flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">person</span>
                    {t('header.profile')}
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setLocation('/settings');
                    }}
                    className="w-full px-4 py-2 text-left text-white text-sm hover:bg-primary/20 transition flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">settings</span>
                    {t('header.settings')}
                  </button>
                  <div className="border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-400 text-sm hover:bg-primary/20 transition flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      {t('header.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 로그인 전 */}
            <button
              onClick={() => setLocation('/login')}
              className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition"
            >
              {t('header.login')}
            </button>
            <button
              onClick={() => setLocation('/signup')}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition"
            >
              {t('header.signup')}
            </button>
          </>
        )}
      </div>
    </header>
  );
}

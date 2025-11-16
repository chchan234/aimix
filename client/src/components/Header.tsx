import { useState } from 'react';
import { Link } from 'wouter';

export default function Header() {
  // 임시 로그인 상태 (나중에 전역 상태관리로 변경)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credits, setCredits] = useState(1200);

  return (
    <header className="h-16 bg-sidebar-dark border-b border-white/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      {/* Left: Logo (모바일에서만 표시) */}
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer lg:hidden">
          <span className="material-symbols-outlined text-primary text-2xl">hub</span>
          <h1 className="text-white text-lg font-bold">AIMix</h1>
        </div>
      </Link>

      {/* Center: 검색 (나중에 추가 가능) */}
      <div className="flex-1 max-w-xl mx-auto hidden md:block">
        {/* 검색 기능 추가 예정 */}
      </div>

      {/* Right: 로그인 전/후 UI */}
      <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2 cursor-pointer hover:bg-primary/20 px-2 py-1.5 rounded-lg transition">
              <div
                className="w-8 h-8 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=AIMix")',
                }}
              ></div>
              <span className="text-white text-sm font-medium hidden md:block">사용자</span>
            </div>
          </>
        ) : (
          <>
            {/* 로그인 전 */}
            <button
              onClick={() => setIsLoggedIn(true)}
              className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition"
            >
              로그인
            </button>
            <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition">
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  );
}

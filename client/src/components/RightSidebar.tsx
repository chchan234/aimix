import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function RightSidebar() {
  const { t } = useTranslation();
  // 로그인 상태 (localStorage에서 확인)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 사이드바 열림/닫힘 상태 (기본: 닫힘)
  const [isOpen, setIsOpen] = useState(false);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const recentActivities = [
    {
      icon: 'image',
      title: t('rightSidebar.activities.faceReading'),
      time: t('rightSidebar.timeAgo.minutes', { count: 2 }),
    },
    {
      icon: 'auto_awesome',
      title: t('rightSidebar.activities.dreamInterpretation'),
      time: t('rightSidebar.timeAgo.hours', { count: 1 }),
    },
    {
      icon: 'image',
      title: t('rightSidebar.activities.tarotReading'),
      time: t('rightSidebar.timeAgo.hours', { count: 5 }),
    },
    {
      icon: 'star',
      title: t('rightSidebar.activities.saju'),
      time: t('rightSidebar.timeAgo.yesterday'),
    },
  ];

  // 로그인하지 않았으면 아무것도 표시하지 않음
  if (!isLoggedIn) {
    return null;
  }

  // 닫힌 상태: 토글 버튼만 표시
  if (!isOpen) {
    return (
      <aside className="flex-shrink-0 bg-sidebar-dark p-4 flex-col items-center justify-start hidden xl:flex">
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
          title={t('rightSidebar.openActivity')}
        >
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>
      </aside>
    );
  }

  // 열린 상태: 전체 사이드바 표시
  return (
    <aside className="w-80 flex-shrink-0 bg-sidebar-dark p-6 flex-col gap-6 hidden xl:flex">
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-bold">{t('rightSidebar.recentActivity')}</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
          title={t('rightSidebar.closeActivity')}
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-4">
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <span className="material-symbols-outlined text-primary">
                {activity.icon}
              </span>
            </div>
            <div className="flex flex-col">
              <p className="text-white text-sm font-medium">{activity.title}</p>
              <p className="text-[#ab9eb7] text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('사용자');
  const [email] = useState('test@aiplatform.com');
  const [joinDate] = useState('2024.01.15');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');

  // 통계 데이터
  const [stats] = useState({
    totalCreditsUsed: 3450,
    servicesUsed: 12,
    lastActivity: '2024.03.15',
  });

  // 최근 활동 데이터
  const [recentActivities] = useState([
    {
      id: 1,
      serviceName: 'AI 관상',
      category: 'fortune',
      credits: 100,
      date: '2024.03.15',
    },
    {
      id: 2,
      serviceName: 'AI 프로필 생성',
      category: 'image',
      credits: 200,
      date: '2024.03.14',
    },
    {
      id: 3,
      serviceName: 'MBTI 정밀 분석',
      category: 'entertainment',
      credits: 150,
      date: '2024.03.13',
    },
  ]);

  const getCategoryColor = (category: string) => {
    const colors = {
      fortune: 'bg-purple-500/20 text-purple-400',
      image: 'bg-blue-500/20 text-blue-400',
      entertainment: 'bg-pink-500/20 text-pink-400',
      health: 'bg-green-500/20 text-green-400',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getCategoryName = (category: string) => {
    return t(`myResults.categories.${category}`);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      localStorage.setItem('username', editedUsername);
      setUsername(editedUsername);
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-2">{t('profile.title')}</h1>
        <p className="text-[#ab9eb7] text-sm">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로필 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <div className="flex items-start gap-6">
              {/* 프로필 사진 */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition">
                  <span className="material-symbols-outlined text-white text-sm">edit</span>
                </button>
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1">
                {/* 사용자명 */}
                <div className="mb-4">
                  <label className="text-[#ab9eb7] text-sm mb-2 block">{t('profile.username')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="bg-[#2a2436] text-white px-4 py-2 rounded-lg border border-white/10 focus:border-primary focus:outline-none w-full"
                      placeholder={username}
                    />
                  ) : (
                    <p className="text-white text-lg font-semibold">{username}</p>
                  )}
                </div>

                {/* 이메일 */}
                <div className="mb-4">
                  <label className="text-[#ab9eb7] text-sm mb-2 block">{t('profile.email')}</label>
                  <p className="text-white">{email}</p>
                </div>

                {/* 가입일 */}
                <div className="mb-4">
                  <label className="text-[#ab9eb7] text-sm mb-2 block">{t('profile.joinDate')}</label>
                  <p className="text-white">{joinDate}</p>
                </div>

                {/* 수정 버튼 */}
                <button
                  onClick={handleEditToggle}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isEditing ? 'check' : 'edit'}
                  </span>
                  {isEditing ? t('common.save') : t('common.edit')}
                </button>
              </div>
            </div>
          </div>

          {/* 이용 통계 */}
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-6">{t('profile.stats.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#2a2436] rounded-xl p-4">
                <p className="text-[#ab9eb7] text-sm mb-2">{t('profile.stats.totalCreditsUsed')}</p>
                <p className="text-primary text-3xl font-bold">
                  {stats.totalCreditsUsed.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#2a2436] rounded-xl p-4">
                <p className="text-[#ab9eb7] text-sm mb-2">{t('profile.stats.servicesUsed')}</p>
                <p className="text-blue-400 text-3xl font-bold">{stats.servicesUsed}</p>
              </div>
              <div className="bg-[#2a2436] rounded-xl p-4">
                <p className="text-[#ab9eb7] text-sm mb-2">{t('profile.stats.lastActivity')}</p>
                <p className="text-green-400 text-xl font-bold">{stats.lastActivity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4">{t('profile.recentActivities')}</h2>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="bg-[#2a2436] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-semibold text-sm">{activity.serviceName}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(activity.category)}`}
                    >
                      {getCategoryName(activity.category)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#ab9eb7]">{activity.date}</span>
                    <span className="text-primary font-semibold">-{activity.credits}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

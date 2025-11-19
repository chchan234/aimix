import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
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
      fortune: 'bg-purple-200/60 text-purple-700',
      image: 'bg-blue-200/60 text-blue-600',
      entertainment: 'bg-pink-200/60 text-pink-600',
      health: 'bg-emerald-200/60 text-emerald-600',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-200/60 text-gray-600';
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
        <h1 className="text-foreground text-3xl font-serif font-bold mb-2">{t('profile.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로필 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 프로필 카드 */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-start gap-6">
              {/* 프로필 사진 */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-300/50">
                  <span className="text-white text-3xl font-serif font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white text-primary border border-border rounded-full flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1">
                {/* 사용자명 */}
                <div className="mb-4">
                  <label className="text-muted-foreground text-sm mb-2 block">{t('profile.username')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="bg-white/50 text-foreground px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none w-full focus:ring-1 focus:ring-primary/50"
                      placeholder={username}
                    />
                  ) : (
                    <p className="text-foreground text-lg font-semibold">{username}</p>
                  )}
                </div>

                {/* 이메일 */}
                <div className="mb-4">
                  <label className="text-muted-foreground text-sm mb-2 block">{t('profile.email')}</label>
                  <p className="text-foreground">{email}</p>
                </div>

                {/* 가입일 */}
                <div className="mb-4">
                  <label className="text-muted-foreground text-sm mb-2 block">{t('profile.joinDate')}</label>
                  <p className="text-foreground">{joinDate}</p>
                </div>

                {/* 수정 버튼 */}
                <button
                  onClick={handleEditToggle}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium flex items-center gap-2 shadow-sm"
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
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-foreground text-xl font-serif font-bold mb-6">{t('profile.stats.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-200/50 shadow-sm">
                <p className="text-muted-foreground text-sm mb-2">{t('profile.stats.totalCreditsUsed')}</p>
                <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-3xl font-bold">
                  {stats.totalCreditsUsed.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200/50 shadow-sm">
                <p className="text-muted-foreground text-sm mb-2">{t('profile.stats.servicesUsed')}</p>
                <p className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent text-3xl font-bold">{stats.servicesUsed}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50 shadow-sm">
                <p className="text-muted-foreground text-sm mb-2">{t('profile.stats.lastActivity')}</p>
                <p className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent text-xl font-bold">{stats.lastActivity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-foreground text-xl font-serif font-bold mb-4">{t('profile.recentActivities')}</h2>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="bg-gradient-to-br from-white to-pink-50/50 rounded-xl p-4 border border-pink-100/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-foreground font-semibold text-sm">{activity.serviceName}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(activity.category)}`}
                    >
                      {getCategoryName(activity.category)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{activity.date}</span>
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

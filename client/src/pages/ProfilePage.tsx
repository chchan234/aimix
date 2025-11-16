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
    { id: 1, service: 'AI 관상', category: 'fortune', date: '2024.03.15', credits: 100 },
    { id: 2, service: 'AI 프로필 생성', category: 'image', date: '2024.03.14', credits: 200 },
    { id: 3, service: 'MBTI 정밀 분석', category: 'entertainment', date: '2024.03.13', credits: 150 },
    { id: 4, service: 'AI 체형 분석', category: 'health', date: '2024.03.12', credits: 100 },
  ]);

  useEffect(() => {
    const savedUsername = localStorage.getItem('username') || '사용자';
    setUsername(savedUsername);
    setEditedUsername(savedUsername);
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // 저장
      localStorage.setItem('username', editedUsername);
      setUsername(editedUsername);
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setEditedUsername(username);
    setIsEditing(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fortune: 'bg-purple-500/20 text-purple-400',
      image: 'bg-blue-500/20 text-blue-400',
      entertainment: 'bg-pink-500/20 text-pink-400',
      health: 'bg-green-500/20 text-green-400',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-2">{t('header.profile')}</h1>
        <p className="text-[#ab9eb7] text-sm">내 프로필 정보를 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 프로필 정보 카드 */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            {/* 프로필 사진 */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-32 h-32 rounded-full bg-cover bg-center mb-4 ring-4 ring-primary/30"
                style={{
                  backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=AIplatform")',
                }}
              ></div>
              <button className="text-primary text-sm hover:underline">
                프로필 사진 변경
              </button>
            </div>

            {/* 사용자 정보 */}
            <div className="space-y-4">
              {/* 사용자명 */}
              <div>
                <label className="text-[#ab9eb7] text-xs mb-1 block">사용자명</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    className="w-full bg-[#2a2436] text-white px-3 py-2 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                  />
                ) : (
                  <p className="text-white font-medium">{username}</p>
                )}
              </div>

              {/* 이메일 */}
              <div>
                <label className="text-[#ab9eb7] text-xs mb-1 block">이메일</label>
                <p className="text-white">{email}</p>
              </div>

              {/* 가입일 */}
              <div>
                <label className="text-[#ab9eb7] text-xs mb-1 block">가입일</label>
                <p className="text-white">{joinDate}</p>
              </div>
            </div>

            {/* 편집 버튼 */}
            <div className="mt-6 flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-[#2a2436] text-white py-2 rounded-lg hover:bg-[#3a3446] transition"
                  >
                    취소
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  프로필 수정
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 통계 및 활동 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 통계 카드 */}
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4">이용 통계</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 총 크레딧 사용량 */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-400 text-2xl">toll</span>
                  <p className="text-[#ab9eb7] text-sm">총 사용 크레딧</p>
                </div>
                <p className="text-white text-3xl font-bold">{stats.totalCreditsUsed.toLocaleString()}</p>
              </div>

              {/* 이용한 서비스 수 */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-400 text-2xl">apps</span>
                  <p className="text-[#ab9eb7] text-sm">이용 서비스</p>
                </div>
                <p className="text-white text-3xl font-bold">{stats.servicesUsed}</p>
              </div>

              {/* 마지막 활동일 */}
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-400 text-2xl">calendar_today</span>
                  <p className="text-[#ab9eb7] text-sm">마지막 활동</p>
                </div>
                <p className="text-white text-lg font-bold">{stats.lastActivity}</p>
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">최근 활동</h2>
              <button
                onClick={() => setLocation('/my-results')}
                className="text-primary text-sm hover:underline"
              >
                전체보기
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-[#2a2436] rounded-lg p-4 hover:bg-[#3a3446] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{activity.service}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(activity.category)}`}>
                          {activity.category === 'fortune' && '운세'}
                          {activity.category === 'image' && '이미지'}
                          {activity.category === 'entertainment' && '엔터'}
                          {activity.category === 'health' && '건강'}
                        </span>
                      </div>
                      <p className="text-[#ab9eb7] text-sm">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-semibold">-{activity.credits}</p>
                      <p className="text-[#ab9eb7] text-xs">크레딧</p>
                    </div>
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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken } from '../services/auth';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  credits: number;
  profileImageUrl: string | null;
  provider: string;
  createdAt: string;
}

interface ServiceResult {
  id: string;
  serviceId: string;
  serviceType: string;
  resultData: any;
  createdAt: string;
}

interface UserStats {
  totalCreditsUsed: number;
  servicesUsed: number;
  lastActivity: string | null;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalCreditsUsed: 0,
    servicesUsed: 0,
    lastActivity: null,
  });
  const [recentActivities, setRecentActivities] = useState<ServiceResult[]>([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      // Fetch user profile
      const profileResponse = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.user);
      }

      // Fetch user stats
      const statsResponse = await fetch('/api/auth/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent results
      const resultsResponse = await fetch('/api/results?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setRecentActivities(resultsData.results || []);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromServiceType = (serviceType: string): string => {
    const fortuneServices = ['face-reading', 'saju', 'deep-saju-2026', 'zodiac', 'palmistry', 'name-compatibility', 'horoscope'];
    const imageServices = ['baby-face', 'age-transform', 'gender-swap', 'profile-generator', 'caricature', 'hairstyle', 'tattoo', 'id-photo', 'makeup'];
    const entertainmentServices = ['mbti-analysis', 'enneagram-test', 'bigfive-test', 'geumjjoki-test', 'stress-test', 'pet-soulmate', 'celebrity-match'];
    const healthServices = ['skin-analysis', 'body-analysis', 'bmi-calculator', 'personal-color'];

    if (fortuneServices.includes(serviceType)) return 'fortune';
    if (imageServices.includes(serviceType)) return 'image';
    if (entertainmentServices.includes(serviceType)) return 'entertainment';
    if (healthServices.includes(serviceType)) return 'health';
    return 'other';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      fortune: 'bg-purple-500/20 text-purple-400',
      image: 'bg-blue-500/20 text-blue-400',
      entertainment: 'bg-pink-500/20 text-pink-400',
      health: 'bg-green-500/20 text-green-400',
      other: 'bg-gray-500/20 text-gray-400',
    };
    return colors[category] || colors.other;
  };

  const getCategoryName = (category: string) => {
    return t(`myResults.categories.${category}`);
  };

  const getServiceDisplayName = (serviceType: string) => {
    const names: Record<string, string> = {
      'face-reading': 'AI 관상',
      'saju': '사주팔자',
      'deep-saju-2026': '2026 운세',
      'zodiac': '별자리 운세',
      'palmistry': '손금 분석',
      'name-compatibility': '이름 궁합',
      'horoscope': '오늘의 운세',
      'baby-face': '아기 얼굴',
      'age-transform': '나이 변환',
      'gender-swap': '성별 변환',
      'profile-generator': '프로필 생성',
      'caricature': '캐리커처',
      'hairstyle': '헤어스타일',
      'tattoo': '타투 시뮬',
      'id-photo': '증명사진',
      'makeup': '메이크업',
      'mbti-analysis': 'MBTI 분석',
      'enneagram-test': '에니어그램',
      'bigfive-test': 'Big Five',
      'geumjjoki-test': '금쪽이 테스트',
      'stress-test': '스트레스 테스트',
      'pet-soulmate': '펫 소울메이트',
      'celebrity-match': '닮은꼴 연예인',
      'skin-analysis': '피부 분석',
      'body-analysis': '체형 분석',
      'bmi-calculator': 'BMI 계산기',
      'personal-color': '퍼스널 컬러',
    };
    return names[serviceType] || serviceType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">프로필을 불러올 수 없습니다.</div>
      </div>
    );
  }

  const displayName = profile.username || profile.email.split('@')[0];

  return (
    <div className="max-w-5xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold mb-2">{t('profile.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로필 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-6 border border-gray-200 dark:border-white/10">
            <div className="flex items-start gap-6">
              {/* 프로필 사진 */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1">
                {/* 사용자명 */}
                <div className="mb-4">
                  <label className="text-muted-foreground text-sm mb-2 block">{t('profile.username')}</label>
                  <p className="text-foreground text-lg font-semibold">{displayName}</p>
                </div>

                {/* 이메일 */}
                <div className="mb-4">
                  <label className="text-muted-foreground text-sm mb-2 block">{t('profile.email')}</label>
                  <p className="text-foreground">{profile.email}</p>
                </div>

                {/* 가입일 */}
                <div className="mb-4">
                  <label className="text-muted-foreground text-sm mb-2 block">{t('profile.joinDate')}</label>
                  <p className="text-foreground">{formatDate(profile.createdAt)}</p>
                </div>

                {/* 로그인 방식 */}
                <div className="mb-4">
                  <label className="text-muted-foreground text-sm mb-2 block">로그인 방식</label>
                  <p className="text-foreground capitalize">{profile.provider}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 이용 통계 */}
          <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-6 border border-gray-200 dark:border-white/10">
            <h2 className="text-foreground text-xl font-bold mb-6">{t('profile.stats.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-100 dark:bg-[#2a2436] rounded-xl p-4">
                <p className="text-muted-foreground text-sm mb-2">{t('profile.stats.totalCreditsUsed')}</p>
                <p className="text-primary text-3xl font-bold">
                  {stats.totalCreditsUsed.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-[#2a2436] rounded-xl p-4">
                <p className="text-muted-foreground text-sm mb-2">{t('profile.stats.servicesUsed')}</p>
                <p className="text-blue-400 text-3xl font-bold">{stats.servicesUsed}</p>
              </div>
              <div className="bg-gray-100 dark:bg-[#2a2436] rounded-xl p-4">
                <p className="text-muted-foreground text-sm mb-2">{t('profile.stats.lastActivity')}</p>
                <p className="text-green-400 text-xl font-bold">
                  {stats.lastActivity ? formatDate(stats.lastActivity) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-6 border border-gray-200 dark:border-white/10">
            <h2 className="text-foreground text-xl font-bold mb-4">{t('profile.recentActivities')}</h2>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const category = getCategoryFromServiceType(activity.serviceType);
                  return (
                    <div key={activity.id} className="bg-gray-100 dark:bg-[#2a2436] rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-foreground font-semibold text-sm">
                          {getServiceDisplayName(activity.serviceType)}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(category)}`}
                        >
                          {getCategoryName(category)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{formatDate(activity.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  최근 활동이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

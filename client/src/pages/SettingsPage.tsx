import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  // 개인 설정
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [timezone, setTimezone] = useState('Asia/Seoul');

  // 알림 설정
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // 크레딧 설정
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState(5000);
  const [autoRechargeThreshold, setAutoRechargeThreshold] = useState(1000);

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // 저장된 설정 불러오기
    const savedLanguage = localStorage.getItem('language') as 'ko' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTimezone(settings.timezone || 'Asia/Seoul');
      setEmailNotifications(settings.emailNotifications ?? true);
      setPushNotifications(settings.pushNotifications ?? true);
      setMarketingEmails(settings.marketingEmails ?? false);
      setAutoRecharge(settings.autoRecharge ?? false);
      setAutoRechargeAmount(settings.autoRechargeAmount || 5000);
      setAutoRechargeThreshold(settings.autoRechargeThreshold || 1000);
    }
  }, []);

  const handleLanguageChange = (lang: 'ko' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  const handleSaveSettings = () => {
    const settings = {
      timezone,
      emailNotifications,
      pushNotifications,
      marketingEmails,
      autoRecharge,
      autoRechargeAmount,
      autoRechargeThreshold,
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    alert('설정이 저장되었습니다.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    // TODO: 실제 API 호출
    alert('비밀번호가 변경되었습니다.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    );
    if (confirmed) {
      // TODO: 실제 API 호출
      alert('계정 삭제 요청이 접수되었습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-2">{t('header.settings')}</h1>
        <p className="text-[#ab9eb7] text-sm">서비스 이용 환경을 설정하세요</p>
      </div>

      <div className="space-y-6">
        {/* 개인 설정 */}
        <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            개인 설정
          </h2>

          <div className="space-y-4">
            {/* 언어 선택 */}
            <div>
              <label className="text-white text-sm font-medium mb-2 block">언어</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLanguageChange('ko')}
                  className={`py-3 px-4 rounded-lg border transition ${
                    language === 'ko'
                      ? 'bg-primary border-primary text-white'
                      : 'bg-[#2a2436] border-white/10 text-[#ab9eb7] hover:border-primary/50'
                  }`}
                >
                  한국어
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`py-3 px-4 rounded-lg border transition ${
                    language === 'en'
                      ? 'bg-primary border-primary text-white'
                      : 'bg-[#2a2436] border-white/10 text-[#ab9eb7] hover:border-primary/50'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* 시간대 */}
            <div>
              <label className="text-white text-sm font-medium mb-2 block">시간대</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
              >
                <option value="Asia/Seoul">서울 (GMT+9)</option>
                <option value="America/New_York">뉴욕 (GMT-5)</option>
                <option value="Europe/London">런던 (GMT+0)</option>
                <option value="Asia/Tokyo">도쿄 (GMT+9)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            알림 설정
          </h2>

          <div className="space-y-4">
            {/* 이메일 알림 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">이메일 알림</p>
                <p className="text-[#ab9eb7] text-sm">중요한 업데이트를 이메일로 받습니다</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-14 h-8 rounded-full transition ${
                  emailNotifications ? 'bg-primary' : 'bg-[#2a2436]'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            {/* 푸시 알림 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">푸시 알림</p>
                <p className="text-[#ab9eb7] text-sm">브라우저 푸시 알림을 받습니다</p>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative w-14 h-8 rounded-full transition ${
                  pushNotifications ? 'bg-primary' : 'bg-[#2a2436]'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    pushNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            {/* 마케팅 이메일 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">마케팅 수신 동의</p>
                <p className="text-[#ab9eb7] text-sm">이벤트 및 프로모션 정보를 받습니다</p>
              </div>
              <button
                onClick={() => setMarketingEmails(!marketingEmails)}
                className={`relative w-14 h-8 rounded-full transition ${
                  marketingEmails ? 'bg-primary' : 'bg-[#2a2436]'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    marketingEmails ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        {/* 크레딧 설정 */}
        <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">toll</span>
            크레딧 설정
          </h2>

          <div className="space-y-4">
            {/* 자동 충전 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">자동 충전</p>
                <p className="text-[#ab9eb7] text-sm">크레딧이 부족하면 자동으로 충전합니다</p>
              </div>
              <button
                onClick={() => setAutoRecharge(!autoRecharge)}
                className={`relative w-14 h-8 rounded-full transition ${
                  autoRecharge ? 'bg-primary' : 'bg-[#2a2436]'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    autoRecharge ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            {autoRecharge && (
              <>
                {/* 충전 금액 */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">충전 금액</label>
                  <select
                    value={autoRechargeAmount}
                    onChange={(e) => setAutoRechargeAmount(Number(e.target.value))}
                    className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                  >
                    <option value={1000}>1,000 크레딧</option>
                    <option value={5000}>5,000 크레딧</option>
                    <option value={10000}>10,000 크레딧</option>
                    <option value={30000}>30,000 크레딧</option>
                  </select>
                </div>

                {/* 충전 기준 */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    충전 기준 (잔액이 이 값 이하일 때)
                  </label>
                  <select
                    value={autoRechargeThreshold}
                    onChange={(e) => setAutoRechargeThreshold(Number(e.target.value))}
                    className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                  >
                    <option value={500}>500 크레딧</option>
                    <option value={1000}>1,000 크레딧</option>
                    <option value={2000}>2,000 크레딧</option>
                    <option value={5000}>5,000 크레딧</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 보안 */}
        <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lock</span>
            보안
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">현재 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                placeholder="8자 이상의 새 비밀번호"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                placeholder="새 비밀번호를 다시 입력하세요"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-medium"
            >
              비밀번호 변경
            </button>
          </form>
        </div>

        {/* 계정 관리 */}
        <div className="bg-[#1a1625] rounded-2xl p-6 border border-red-500/20">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">warning</span>
            계정 관리
          </h2>

          <div className="space-y-4">
            <p className="text-[#ab9eb7] text-sm">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-500/10 text-red-500 border border-red-500/30 py-3 rounded-lg hover:bg-red-500/20 transition font-medium"
            >
              계정 삭제
            </button>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
}

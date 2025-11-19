import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  // 설정 상태
  const [language, setLanguage] = useState(i18n.language);
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState('10000');
  const [autoRechargeThreshold, setAutoRechargeThreshold] = useState('100');

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
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
    alert(t('settings.settingsSaved'));
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(t('settings.account.deleteWarning'));
    if (confirmed) {
      alert('Account deletion is not implemented yet.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-serif font-bold mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* 개인 설정 */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-foreground text-xl font-serif font-bold mb-6">{t('settings.personal.title')}</h2>

          {/* 언어 */}
          <div className="mb-6">
            <label className="text-foreground font-semibold mb-3 block">{t('settings.personal.language')}</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-white/50 text-foreground px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* 시간대 */}
          <div>
            <label className="text-foreground font-semibold mb-3 block">{t('settings.personal.timezone')}</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-white/50 text-foreground px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="Asia/Seoul">Seoul (UTC+9)</option>
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="Europe/London">London (UTC+0)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
            </select>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-foreground text-xl font-serif font-bold mb-6">{t('settings.notifications.title')}</h2>

          {/* 이메일 알림 */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-foreground font-semibold mb-1">{t('settings.notifications.email')}</p>
              <p className="text-muted-foreground text-sm">{t('settings.notifications.emailDesc')}</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative w-14 h-8 rounded-full transition ${emailNotifications ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${emailNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
              ></span>
            </button>
          </div>

          {/* 푸시 알림 */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-foreground font-semibold mb-1">{t('settings.notifications.push')}</p>
              <p className="text-muted-foreground text-sm">{t('settings.notifications.pushDesc')}</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative w-14 h-8 rounded-full transition ${pushNotifications ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${pushNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
              ></span>
            </button>
          </div>

          {/* 마케팅 정보 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-semibold mb-1">{t('settings.notifications.marketing')}</p>
              <p className="text-muted-foreground text-sm">{t('settings.notifications.marketingDesc')}</p>
            </div>
            <button
              onClick={() => setMarketingEmails(!marketingEmails)}
              className={`relative w-14 h-8 rounded-full transition ${marketingEmails ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${marketingEmails ? 'translate-x-6' : 'translate-x-0'
                  }`}
              ></span>
            </button>
          </div>
        </div>

        {/* 크레딧 설정 */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-foreground text-xl font-serif font-bold mb-6">{t('settings.credits.title')}</h2>

          {/* 자동 충전 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-foreground font-semibold mb-1">{t('settings.credits.autoRecharge')}</p>
              <p className="text-muted-foreground text-sm">{t('settings.credits.autoRechargeDesc')}</p>
            </div>
            <button
              onClick={() => setAutoRecharge(!autoRecharge)}
              className={`relative w-14 h-8 rounded-full transition ${autoRecharge ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${autoRecharge ? 'translate-x-6' : 'translate-x-0'
                  }`}
              ></span>
            </button>
          </div>

          {/* 자동 충전 상세 설정 */}
          {autoRecharge && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <div>
                <label className="text-foreground font-semibold mb-3 block">{t('settings.credits.rechargeAmount')}</label>
                <select
                  value={autoRechargeAmount}
                  onChange={(e) => setAutoRechargeAmount(e.target.value)}
                  className="w-full bg-white/50 text-foreground px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="5000">₩5,000</option>
                  <option value="10000">₩10,000</option>
                  <option value="30000">₩30,000</option>
                  <option value="50000">₩50,000</option>
                </select>
              </div>
              <div>
                <label className="text-foreground font-semibold mb-3 block">{t('settings.credits.rechargeThreshold')}</label>
                <select
                  value={autoRechargeThreshold}
                  onChange={(e) => setAutoRechargeThreshold(e.target.value)}
                  className="w-full bg-white/50 text-foreground px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="50">50 {t('settings.credits.threshold')}</option>
                  <option value="100">100 {t('settings.credits.threshold')}</option>
                  <option value="200">200 {t('settings.credits.threshold')}</option>
                  <option value="500">500 {t('settings.credits.threshold')}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 보안 설정 */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-foreground text-xl font-serif font-bold mb-6">{t('settings.security.title')}</h2>

          <div className="space-y-4">
            <div>
              <label className="text-foreground font-semibold mb-2 block">{t('settings.security.currentPassword')}</label>
              <input
                type="password"
                className="w-full bg-white/50 text-foreground px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-foreground font-semibold mb-2 block">{t('settings.security.newPassword')}</label>
              <input
                type="password"
                className="w-full bg-white/50 text-foreground px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-foreground font-semibold mb-2 block">{t('settings.security.confirmPassword')}</label>
              <input
                type="password"
                className="w-full bg-white/50 text-foreground px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-xl hover:from-pink-500 hover:to-purple-500 transition font-medium shadow-lg shadow-pink-300/50">
              {t('settings.security.changePassword')}
            </button>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-foreground text-xl font-serif font-bold mb-6">{t('settings.account.title')}</h2>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              <div>
                <p className="text-red-600 font-semibold mb-2">{t('settings.account.deleteAccount')}</p>
                <p className="text-red-500/80 text-sm">{t('settings.account.deleteWarning')}</p>
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-white/50 text-red-500 py-3 rounded-lg hover:bg-red-50 transition font-medium border border-red-200"
            >
              {t('settings.account.deleteButton')}
            </button>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSaveSettings}
          className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-pink-500 hover:via-purple-500 hover:to-pink-600 transition shadow-xl shadow-pink-300/50"
        >
          {t('settings.saveSettings')}
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { getToken, logout } from '../services/auth';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);

  // 설정 상태
  const [language, setLanguage] = useState(i18n.language);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify({}));
    alert(t('settings.settingsSaved'));
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t('settings.account.deleteWarning'));
    if (!confirmed) return;

    // Double confirmation for safety
    const doubleConfirmed = window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!doubleConfirmed) return;

    setIsDeleting(true);

    try {
      const token = getToken();
      const response = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('계정이 삭제되었습니다.');
        logout();
        setLocation('/');
      } else {
        alert(data.error || '계정 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      alert('계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* 개인 설정 */}
        <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-6 border border-gray-200 dark:border-white/10">
          <h2 className="text-foreground text-xl font-bold mb-6">{t('settings.personal.title')}</h2>

          {/* 언어 */}
          <div>
            <label className="text-foreground font-semibold mb-3 block">{t('settings.personal.language')}</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#2a2436] text-foreground px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-6 border border-gray-200 dark:border-white/10">
          <h2 className="text-foreground text-xl font-bold mb-6">{t('settings.account.title')}</h2>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-red-400 text-2xl">warning</span>
              <div>
                <p className="text-red-400 font-semibold mb-2">{t('settings.account.deleteAccount')}</p>
                <p className="text-muted-foreground text-sm">{t('settings.account.deleteWarning')}</p>
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full bg-red-500/20 text-red-400 py-3 rounded-lg hover:bg-red-500/30 transition font-medium border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? '삭제 중...' : t('settings.account.deleteButton')}
            </button>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSaveSettings}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition"
        >
          {t('settings.saveSettings')}
        </button>
      </div>
    </div>
  );
}

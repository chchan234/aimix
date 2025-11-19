import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { login, loginWithKakao, initKakao, saveAuthData } from '../services/auth';

export default function LoginPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize Kakao SDK
  useEffect(() => {
    initKakao();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call login API
      const response = await login(formData.email, formData.password);

      // Save auth data
      saveAuthData(response.token, response.user);

      // Redirect to home
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    try {
      // Redirect to Kakao OAuth page
      loginWithKakao();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.kakaoLoginError'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-sidebar-dark rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-transparent">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-foreground text-3xl font-bold mb-2">{t('login.title')}</h1>
            <p className="text-muted-foreground text-sm">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">{t('login.emailOrId')}</label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-3 bg-gray-100 dark:bg-background-dark text-foreground rounded-lg border border-gray-300 dark:border-white/10 focus:border-primary focus:outline-none transition"
                placeholder={t('login.emailPlaceholder')}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">{t('login.password')}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="px-4 py-3 bg-gray-100 dark:bg-background-dark text-foreground rounded-lg border border-gray-300 dark:border-white/10 focus:border-primary focus:outline-none transition"
                placeholder={t('login.passwordPlaceholder')}
                required
                disabled={isLoading}
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-primary text-sm hover:underline"
                disabled={isLoading}
              >
                {t('login.forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? t('login.logging') : t('login.loginButton')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
            <span className="text-muted-foreground text-sm">{t('login.or')}</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="px-6 py-3 bg-[#FEE500] text-[#191919] font-semibold rounded-lg hover:bg-[#FDD835] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <span className="material-symbols-outlined">chat</span>
              {isLoading ? t('login.logging') : t('login.kakaoLogin')}
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              {t('login.noAccount')}{' '}
              <button
                onClick={handleKakaoLogin}
                className="text-primary font-semibold hover:underline"
                disabled={isLoading}
              >
                카카오로 10초만에 가입
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

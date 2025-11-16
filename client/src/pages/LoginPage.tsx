import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 테스트 계정 확인
    if (formData.email === 'test' && formData.password === 'test') {
      // 로그인 성공
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', 'Test User');
      localStorage.setItem('userEmail', 'test@aiplatform.com');

      // 홈으로 리다이렉트
      setLocation('/');

      // 페이지 새로고침으로 헤더 상태 업데이트
      window.location.href = '/';
    } else {
      // 로그인 실패
      alert(t('login.loginError'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md">
        <div className="bg-sidebar-dark rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">{t('login.title')}</h1>
            <p className="text-[#ab9eb7] text-sm">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">{t('login.emailOrId')}</label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-3 bg-background-dark text-white rounded-lg border border-white/10 focus:border-primary focus:outline-none transition"
                placeholder="test"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">{t('login.password')}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="px-4 py-3 bg-background-dark text-white rounded-lg border border-white/10 focus:border-primary focus:outline-none transition"
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-primary text-sm hover:underline"
              >
                {t('login.forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
            >
              {t('login.loginButton')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[#ab9eb7] text-sm">{t('login.or')}</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3">
            <button className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">mail</span>
              {t('login.googleLogin')}
            </button>
            <button className="px-6 py-3 bg-[#03C75A] text-white font-semibold rounded-lg hover:bg-[#02b350] transition-all duration-300 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">chat</span>
              {t('login.kakaoLogin')}
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-[#ab9eb7] text-sm">
              {t('login.noAccount')}{' '}
              <button
                onClick={() => setLocation('/signup')}
                className="text-primary font-semibold hover:underline"
              >
                {t('login.signupLink')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

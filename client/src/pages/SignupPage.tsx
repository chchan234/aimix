import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { initKakao, loginWithKakao, register, saveAuthData } from '../services/auth';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation state
  const isPasswordLongEnough = formData.password.length >= 8;
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  // Initialize Kakao SDK
  useEffect(() => {
    initKakao();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // Password validation
    if (!isPasswordLongEnough) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // Call register API (name is optional, use email prefix as default)
      const defaultName = formData.email.split('@')[0];
      const response = await register(formData.email, formData.password, defaultName);

      // Save auth data
      saveAuthData(response.token, response.user);

      // Redirect to home immediately
      window.location.href = '/';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      // Handle various error messages
      if (errorMessage.includes('Email already registered') || errorMessage.includes('이미 등록된 이메일')) {
        setError('이미 등록된 이메일입니다.');
      } else if (errorMessage.includes('Validation failed')) {
        setError('입력값이 올바르지 않습니다. 이메일 형식과 비밀번호를 확인해주세요.');
      } else if (errorMessage.includes('Registration failed') || errorMessage.includes('회원가입에 실패')) {
        setError('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    try {
      // Redirect to Kakao OAuth page
      loginWithKakao();
    } catch (err) {
      console.error('Kakao login error:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-sidebar-dark rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-transparent">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-foreground text-3xl font-bold mb-2">회원가입</h1>
            <p className="text-muted-foreground text-sm">
              이메일과 비밀번호만으로 간편하게 가입하세요
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-3 bg-gray-100 dark:bg-background-dark text-foreground rounded-lg border border-gray-300 dark:border-white/10 focus:border-primary focus:outline-none transition"
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="px-4 py-3 bg-gray-100 dark:bg-background-dark text-foreground rounded-lg border border-gray-300 dark:border-white/10 focus:border-primary focus:outline-none transition"
                placeholder="비밀번호 입력"
                required
                disabled={isLoading}
              />
              {/* Password length indicator */}
              <div className="flex items-center gap-2 mt-1">
                {formData.password.length > 0 ? (
                  isPasswordLongEnough ? (
                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                  )
                ) : (
                  <span className="material-symbols-outlined text-gray-400 text-lg">radio_button_unchecked</span>
                )}
                <span className={`text-xs ${
                  formData.password.length === 0
                    ? 'text-gray-400'
                    : isPasswordLongEnough
                      ? 'text-green-500'
                      : 'text-red-500'
                }`}>
                  8자 이상 {formData.password.length > 0 && `(${formData.password.length}자)`}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">비밀번호 확인</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="px-4 py-3 bg-gray-100 dark:bg-background-dark text-foreground rounded-lg border border-gray-300 dark:border-white/10 focus:border-primary focus:outline-none transition"
                placeholder="비밀번호 재입력"
                required
                disabled={isLoading}
              />
              {/* Password match indicator */}
              {formData.confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  {doPasswordsMatch ? (
                    <>
                      <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                      <span className="text-xs text-green-500">비밀번호가 일치합니다</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                      <span className="text-xs text-red-500">비밀번호가 일치하지 않습니다</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !isPasswordLongEnough || !doPasswordsMatch}
            >
              {isLoading ? '회원가입 중...' : '회원가입'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
            <span className="text-muted-foreground text-sm">또는</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="px-6 py-3 bg-[#FEE500] text-[#191919] font-semibold rounded-lg hover:bg-[#FDD835] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">chat</span>
              카카오로 가입
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => setLocation('/login')}
                className="text-primary font-semibold hover:underline"
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

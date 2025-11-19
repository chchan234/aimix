import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { initKakao, loginWithKakao, register, saveAuthData } from '../services/auth';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Initialize Kakao SDK
  useEffect(() => {
    initKakao();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // Call register API
      const response = await register(formData.email, formData.password, formData.name);

      // Save auth data
      saveAuthData(response.token, response.user);

      // Show verification message if email is not verified
      if (!response.user.emailVerified) {
        setRegisteredEmail(formData.email);
        setShowVerificationMessage(true);
      } else {
        // Redirect to home for verified users (OAuth users)
        window.location.href = '/';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
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
        <div className="bg-sidebar-dark rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">회원가입</h1>
            <p className="text-[#ab9eb7] text-sm">
              AI PORT에서 다양한 AI 서비스를 무료로 이용하세요
            </p>
          </div>

          {/* Verification Success Message */}
          {showVerificationMessage && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-400 text-2xl">
                  mark_email_read
                </span>
                <div className="flex-1">
                  <h3 className="text-green-400 font-semibold mb-2">회원가입 완료!</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    <strong>{registeredEmail}</strong>로 인증 이메일을 보냈습니다.
                  </p>
                  <p className="text-gray-400 text-xs">
                    이메일을 확인하여 인증을 완료해주세요. (링크 유효기간: 24시간)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 bg-background-dark text-white rounded-lg border border-white/10 focus:border-primary focus:outline-none transition"
                placeholder="홍길동"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-3 bg-background-dark text-white rounded-lg border border-white/10 focus:border-primary focus:outline-none transition"
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="px-4 py-3 bg-background-dark text-white rounded-lg border border-white/10 focus:border-primary focus:outline-none transition"
                placeholder="8자 이상 입력하세요"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">비밀번호 확인</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="px-4 py-3 bg-background-dark text-white rounded-lg border border-white/10 focus:border-primary focus:outline-none transition"
                placeholder="비밀번호를 다시 입력하세요"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? '회원가입 중...' : '회원가입'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[#ab9eb7] text-sm">또는</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="px-6 py-3 bg-[#FEE500] text-[#191919] font-semibold rounded-lg hover:bg-[#FDD835] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">chat</span>
              카카오 10초 가입
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-[#ab9eb7] text-sm">
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

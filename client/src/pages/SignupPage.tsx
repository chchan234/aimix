import { useState } from 'react';
import { useLocation } from 'wouter';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase 회원가입 로직 구현
    console.log('회원가입 데이터:', formData);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md">
        <div className="bg-sidebar-dark rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">회원가입</h1>
            <p className="text-[#ab9eb7] text-sm">
              AI Platform에서 다양한 AI 서비스를 무료로 이용하세요
            </p>
          </div>

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
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
            >
              회원가입
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
            <button className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">mail</span>
              Google로 계속하기
            </button>
            <button className="px-6 py-3 bg-[#03C75A] text-white font-semibold rounded-lg hover:bg-[#02b350] transition-all duration-300 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">chat</span>
              Kakao로 계속하기
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

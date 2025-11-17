import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Mail, CheckCircle, XCircle, Loader, Home } from 'lucide-react';

function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_verified'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('유효하지 않은 인증 링크입니다.');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          if (data.alreadyVerified) {
            setStatus('already_verified');
            setMessage(data.message);
          } else {
            setStatus('success');
            setMessage(data.message);
          }
        } else {
          setStatus('error');
          setMessage(data.error || '이메일 인증에 실패했습니다.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('이메일 인증 중 오류가 발생했습니다.');
      }
    };

    verifyEmail();
  }, []);

  const handleGoHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1C1C1E] rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="w-16 h-16 text-purple-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">이메일 인증</h1>
        </div>

        {/* Status Display */}
        <div className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-3 py-8">
              <Loader className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-gray-300 text-center">이메일을 인증하는 중입니다...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-3 py-8">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <p className="text-xl font-semibold text-green-400">{message}</p>
              <p className="text-gray-300 text-center">
                이제 모든 기능을 사용하실 수 있습니다.
              </p>
            </div>
          )}

          {status === 'already_verified' && (
            <div className="flex flex-col items-center space-y-3 py-8">
              <CheckCircle className="w-16 h-16 text-blue-500" />
              <p className="text-xl font-semibold text-blue-400">{message}</p>
              <p className="text-gray-300 text-center">
                이미 인증이 완료된 계정입니다.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-3 py-8">
              <XCircle className="w-16 h-16 text-red-500" />
              <p className="text-xl font-semibold text-red-400">인증 실패</p>
              <p className="text-gray-300 text-center">{message}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {status !== 'loading' && (
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              홈으로 이동
            </button>

            {status === 'error' && (
              <p className="text-sm text-gray-400 text-center">
                문제가 계속되면{' '}
                <a href="/help" className="text-purple-400 hover:text-purple-300 underline">
                  고객 지원
                </a>
                에 문의해주세요.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;

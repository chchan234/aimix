import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { isLoggedIn } from '../services/auth';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  name: string;
}

export default function CreditPurchasePage() {
  const [, setLocation] = useLocation();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLocation('/login');
      return;
    }

    fetchPackages();
  }, [setLocation]);

  // Auth state monitoring - redirect if logged out
  useEffect(() => {
    const checkAuth = () => {
      if (!isLoggedIn()) {
        setLocation('/login');
      }
    };

    window.addEventListener('focus', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, [setLocation]);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/payments/packages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }

      const data = await response.json();
      setPackages(data.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      alert('크레딧 패키지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedPackage(pkg);

    try {
      // 1. 결제 준비 - orderId 받기
      const prepareResponse = await fetch('/api/payments/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ packageType: pkg.id }),
      });

      if (!prepareResponse.ok) {
        throw new Error('Failed to prepare payment');
      }

      const { orderId, amount, orderName, clientKey } = await prepareResponse.json();

      // 2. 토스페이먼츠 SDK 로드
      const tossPayments = await loadTossPayments(clientKey);

      // 3. 결제창 띄우기
      await tossPayments.requestPayment({
        method: 'CARD', // 카드 결제
        amount: {
          currency: 'KRW',
          value: amount,
        },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: '고객',
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.code !== 'USER_CANCEL') {
        alert('결제 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            크레딧 충전
          </h1>
          <p className="text-lg text-gray-600">
            AI 서비스 이용을 위한 크레딧을 구매하세요
          </p>
        </div>

        {/* 패키지 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`
                bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300
                ${selectedPackage?.id === pkg.id ? 'border-indigo-600 shadow-2xl scale-105' : 'border-transparent hover:border-indigo-300 hover:shadow-xl'}
                ${pkg.id === 'premium' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
              `}
            >
              {pkg.id === 'premium' && (
                <div className="bg-indigo-600 text-white text-xs font-bold py-1 px-3 rounded-full inline-block mb-4">
                  인기
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {pkg.name}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-indigo-600">
                  {pkg.credits.toLocaleString()}
                </span>
                <span className="text-gray-600 ml-2">크레딧</span>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₩{pkg.price.toLocaleString()}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-6">
                크레딧당 ₩{Math.round(pkg.price / pkg.credits)}
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                disabled={isProcessing}
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300
                  ${pkg.id === 'premium'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isProcessing && selectedPackage?.id === pkg.id ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    처리 중...
                  </span>
                ) : (
                  '구매하기'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 안내 사항 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            이용 안내
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>크레딧은 AI 서비스 이용 시 사용됩니다.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>서비스별로 필요한 크레딧이 다르니 확인 후 이용해주세요.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>구매한 크레딧은 환불되지 않습니다.</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>결제는 토스페이먼츠를 통해 안전하게 처리됩니다.</span>
            </li>
          </ul>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="text-center mt-8">
          <button
            onClick={() => setLocation('/mypage')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← 마이페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

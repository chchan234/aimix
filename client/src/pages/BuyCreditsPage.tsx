import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { getCredits } from '../services/ai';
import { isLoggedIn } from '../services/auth';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  name: string;
  popular?: boolean;
}

interface PurchaseHistory {
  id: string;
  orderId: string;
  orderName: string;
  totalAmount: number;
  creditsGranted: number;
  approvedAt: string;
  method: string;
}

export default function BuyCreditsPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [currentCredits, setCurrentCredits] = useState(0);
  const [thisMonthUsed, setThisMonthUsed] = useState(0);
  const [totalCharged, setTotalCharged] = useState(0);
  const [totalUsed, setTotalUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);

  // 크레딧 정보 가져오기
  useEffect(() => {
    if (!isLoggedIn()) {
      setLocation('/login');
      return;
    }

    const fetchCredits = async () => {
      try {
        const response = await getCredits();
        if (response.success) {
          setCurrentCredits(response.credits);
          if (response.stats) {
            setThisMonthUsed(response.stats.thisMonthUsed);
            setTotalCharged(response.stats.totalCharged);
            setTotalUsed(response.stats.totalUsed);
          }
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPurchaseHistory = async () => {
      try {
        const response = await fetch('/api/payments/history?limit=5', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPurchaseHistory(data.payments);
        }
      } catch (error) {
        console.error('Failed to fetch purchase history:', error);
      }
    };

    fetchCredits();
    fetchPurchaseHistory();
  }, [setLocation]);

  // Auth state monitoring
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

  // 크레딧 패키지 (토스페이먼츠 연동)
  const packages: CreditPackage[] = [
    { id: 'starter', credits: 10, price: 990, name: '스타터 패키지' },
    { id: 'lite', credits: 50, price: 4900, name: '라이트 패키지' },
    { id: 'basic', credits: 100, price: 9900, name: '베이직 패키지', popular: true },
    { id: 'standard', credits: 300, price: 26900, name: '스탠다드 패키지' },
    { id: 'premium', credits: 500, price: 39900, name: '프리미엄 패키지' },
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) {
      alert(t('buyCredits.alerts.selectPackage'));
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn()) {
      alert('로그인이 필요합니다.');
      setLocation('/login');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const pkg = packages.find((p) => p.id === selectedPackage);
      if (!pkg) return;

      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        setLocation('/login');
        return;
      }

      // 1. 결제 준비 - orderId 받기
      const prepareResponse = await fetch('/api/payments/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ packageType: selectedPackage }),
      });

      if (!prepareResponse.ok) {
        const errorData = await prepareResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to prepare payment');
      }

      const { orderId, amount, orderName, clientKey, customerKey } = await prepareResponse.json();

      console.log('Payment prepare response:', { orderId, amount, orderName, clientKey, customerKey });

      // 2. 토스페이먼츠 SDK v2 로드
      console.log('Loading TossPayments SDK with clientKey:', clientKey);
      console.log('CustomerKey from server:', customerKey);
      const tossPayments = await loadTossPayments(clientKey);
      console.log('TossPayments SDK loaded successfully');

      // 3. 결제창 객체 생성 (비회원 결제로 변경 - ANONYMOUS 사용)
      // 참고: tossPayments.payment()는 API 개별 연동 키가 필요합니다
      // 결제위젯 연동 키를 사용하면 에러가 발생합니다
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      // 4. 결제창 띄우기 (v2 SDK 문법)
      console.log('Requesting payment with params:', {
        method: 'CARD',
        orderId,
        orderName,
        amount,
      });

      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: amount,
        },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: 'customer@example.com',
        customerName: '고객',
        // 카드 결제에 필요한 정보 (SDK v2 필수)
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT', // 통합결제창
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      if (error.code !== 'USER_CANCEL') {
        alert(`결제 처리 중 오류가 발생했습니다: ${error.message || error.code || '알 수 없는 오류'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-serif font-bold mb-2">{t('buyCredits.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('buyCredits.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 현재 크레딧 & 패키지 선택 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 현재 크레딧 */}
          <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 rounded-2xl p-6 shadow-lg shadow-pink-300/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/90 text-sm font-medium">{t('buyCredits.current.title')}</p>
              <span className="material-symbols-outlined text-white/60 text-2xl">toll</span>
            </div>
            <p className="text-white text-5xl font-bold mb-4">
              {loading ? '...' : currentCredits.toLocaleString()}
            </p>
            <div className="grid grid-cols-3 gap-4 text-white/80 text-sm">
              <div>
                <p className="text-white/60 text-xs mb-1">{t('buyCredits.stats.thisMonth')}</p>
                <p className="font-semibold">{loading ? '...' : thisMonthUsed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">{t('buyCredits.stats.totalCharged')}</p>
                <p className="font-semibold">{loading ? '...' : totalCharged.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">{t('buyCredits.stats.totalUsed')}</p>
                <p className="font-semibold">{loading ? '...' : totalUsed.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 크레딧 패키지 */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-foreground text-xl font-serif font-bold mb-4">{t('buyCredits.selectPackage')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition ${
                    selectedPackage === pkg.id
                      ? 'border-pink-400 bg-pink-50/80 dark:bg-pink-900/20 shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30'
                      : 'border-pink-100/50 dark:border-purple-500/30 bg-white/60 dark:bg-[#1a1625] hover:border-pink-300 hover:bg-white/80 dark:hover:bg-[#2a2436]'
                  }`}
                >
                  {/* 인기 뱃지 */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                        {t('buyCredits.packages.popular')}
                      </span>
                    </div>
                  )}

                  {/* 패키지 이름 */}
                  <div className="mb-3">
                    <p className="text-foreground text-lg font-bold">{pkg.name}</p>
                  </div>

                  {/* 크레딧 */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-foreground text-3xl font-bold">{pkg.credits.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm">크레딧</p>
                  </div>

                  {/* 가격 */}
                  <div className="pt-3 border-t border-pink-100/50">
                    <p className="text-foreground text-2xl font-bold">₩{pkg.price.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      크레딧당 ₩{Math.round(pkg.price / pkg.credits)}
                    </p>
                  </div>

                  {/* 선택 표시 */}
                  {selectedPackage === pkg.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 구매 버튼 */}
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
            className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-pink-500 hover:via-purple-500 hover:to-pink-600 transition shadow-xl shadow-pink-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                처리 중...
              </span>
            ) : selectedPackage && packages.find((p) => p.id === selectedPackage) ? (
              `₩${packages.find((p) => p.id === selectedPackage)!.price.toLocaleString()} ${t('buyCredits.purchase.button')}`
            ) : (
              t('buyCredits.purchase.selectPackage')
            )}
          </button>
        </div>

        {/* 오른쪽: 구매 내역 & 안내 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 구매 내역 */}
          <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-6 border border-gray-200 dark:border-white/10">
            <h2 className="text-foreground text-xl font-serif font-bold mb-4">{t('buyCredits.history.title')}</h2>
            <div className="space-y-3">
              {purchaseHistory.length > 0 ? (
                purchaseHistory.map((history) => (
                  <div key={history.id} className="bg-gray-50 dark:bg-[#2a2436] rounded-xl p-4 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold text-lg">
                        +{history.creditsGranted.toLocaleString()}
                      </p>
                      <span className="text-xs text-muted-foreground bg-pink-100/60 dark:bg-pink-900/30 px-2 py-1 rounded">
                        {history.method === 'CARD' ? '카드' : history.method}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <p className="text-muted-foreground text-xs">{history.orderName}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-muted-foreground">{new Date(history.approvedAt).toLocaleDateString()}</p>
                      <p className="text-foreground font-semibold">₩{history.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  구매 내역이 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 크레딧 안내 */}
          <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-6 border border-gray-200 dark:border-white/10">
            <h3 className="text-foreground text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-pink-500">info</span>
              {t('buyCredits.guide.title')}
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-pink-500 text-sm mt-0.5">
                  check_circle
                </span>
                <span>{t('buyCredits.guide.item1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-pink-500 text-sm mt-0.5">
                  check_circle
                </span>
                <span>{t('buyCredits.guide.item2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-pink-500 text-sm mt-0.5">
                  check_circle
                </span>
                <span>{t('buyCredits.guide.item3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-pink-500 text-sm mt-0.5">
                  check_circle
                </span>
                <span>{t('buyCredits.guide.item4')}</span>
              </li>
            </ul>
          </div>

          {/* 문의하기 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-500/30">
            <p className="text-foreground font-semibold mb-2">{t('buyCredits.support.title')}</p>
            <p className="text-muted-foreground text-sm mb-4">
              {t('buyCredits.support.description')}
            </p>
            <button className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white py-2 rounded-xl hover:from-blue-500 hover:to-cyan-500 transition font-medium shadow-md">
              {t('buyCredits.support.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

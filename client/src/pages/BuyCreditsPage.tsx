import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCredits } from '../services/ai';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

interface PurchaseHistory {
  id: number;
  credits: number;
  price: number;
  date: string;
  method: string;
}

export default function BuyCreditsPage() {
  const { t } = useTranslation();

  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [currentCredits, setCurrentCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  // 크레딧 정보 가져오기
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await getCredits();
        if (response.success) {
          setCurrentCredits(response.credits);
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      } finally {
        setLoading(false);
      }
    };

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      fetchCredits();
    } else {
      setLoading(false);
    }
  }, []);

  // 크레딧 패키지
  const packages: CreditPackage[] = [
    { id: 'small', credits: 1000, price: 9900, bonus: 0 },
    { id: 'medium', credits: 5000, price: 39000, bonus: 500, popular: true },
    { id: 'large', credits: 10000, price: 69000, bonus: 2000 },
    { id: 'premium', credits: 30000, price: 179000, bonus: 10000 },
  ];

  // 구매 내역 (TODO: API에서 가져오기)
  const [purchaseHistory] = useState<PurchaseHistory[]>([]);

  const handlePurchase = () => {
    if (!selectedPackage) {
      alert(t('buyCredits.alerts.selectPackage'));
      return;
    }
    if (!paymentMethod) {
      alert('결제 방법을 선택해주세요.');
      return;
    }

    const pkg = packages.find((p) => p.id === selectedPackage);
    if (pkg) {
      alert(
        `${(pkg.credits + pkg.bonus).toLocaleString()} 크레딧을 ₩${pkg.price.toLocaleString()}에 구매합니다.\n결제 방법: ${paymentMethod}`
      );
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
                <p className="font-semibold">850</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">{t('buyCredits.stats.totalCharged')}</p>
                <p className="font-semibold">15,000</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">{t('buyCredits.stats.totalUsed')}</p>
                <p className="font-semibold">13,800</p>
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

                  {/* 크레딧 */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-foreground text-3xl font-bold">{pkg.credits.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm">{t('buyCredits.packages.credits')}</p>
                  </div>

                  {/* 보너스 */}
                  {pkg.bonus > 0 && (
                    <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-sm font-semibold mb-3">
                      + {pkg.bonus.toLocaleString()} {t('buyCredits.packages.bonus')}
                    </p>
                  )}

                  {/* 가격 */}
                  <div className="pt-3 border-t border-pink-100/50">
                    <p className="text-foreground text-2xl font-bold">₩{pkg.price.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {t('buyCredits.packages.perCredit')} ₩{(pkg.price / (pkg.credits + pkg.bonus)).toFixed(1)}
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

          {/* 결제 방법 */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-foreground text-xl font-serif font-bold mb-4">{t('buyCredits.selectPayment')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['카드결제', '카카오페이', '토스페이'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-xl border-2 transition ${
                    paymentMethod === method
                      ? 'border-pink-400 bg-pink-50/80 dark:bg-pink-900/20 shadow-md'
                      : 'border-pink-100/50 dark:border-purple-500/30 bg-white/60 dark:bg-[#1a1625] hover:border-pink-300 hover:bg-white/80 dark:hover:bg-[#2a2436]'
                  }`}
                >
                  <p className="text-foreground font-medium">{method}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 구매 버튼 */}
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || !paymentMethod}
            className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-pink-500 hover:via-purple-500 hover:to-pink-600 transition shadow-xl shadow-pink-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedPackage && packages.find((p) => p.id === selectedPackage)
              ? `₩${packages.find((p) => p.id === selectedPackage)!.price.toLocaleString()} ${t('buyCredits.purchase.button')}`
              : t('buyCredits.purchase.selectPackage')}
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
                        +{history.credits.toLocaleString()}
                      </p>
                      <span className="text-xs text-muted-foreground bg-pink-100/60 dark:bg-pink-900/30 px-2 py-1 rounded">
                        {history.method}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-muted-foreground">{history.date}</p>
                      <p className="text-foreground font-semibold">₩{history.price.toLocaleString()}</p>
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

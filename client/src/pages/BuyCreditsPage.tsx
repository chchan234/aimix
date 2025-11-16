import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const [currentCredits] = useState(1200);

  // 크레딧 패키지
  const packages: CreditPackage[] = [
    { id: 'small', credits: 1000, price: 9900, bonus: 0 },
    { id: 'medium', credits: 5000, price: 39000, bonus: 500, popular: true },
    { id: 'large', credits: 10000, price: 69000, bonus: 2000 },
    { id: 'premium', credits: 30000, price: 179000, bonus: 10000 },
  ];

  // 구매 내역
  const [purchaseHistory] = useState<PurchaseHistory[]>([
    { id: 1, credits: 5000, price: 39000, date: '2024.03.01', method: '카드결제' },
    { id: 2, credits: 1000, price: 9900, date: '2024.02.15', method: '카카오페이' },
    { id: 3, credits: 10000, price: 69000, date: '2024.01.20', method: '카드결제' },
  ]);

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
        <h1 className="text-white text-3xl font-bold mb-2">크레딧 구매</h1>
        <p className="text-[#ab9eb7] text-sm">AI 서비스를 이용하기 위한 크레딧을 충전하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 현재 크레딧 & 패키지 선택 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 현재 크레딧 */}
          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-6 shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/90 text-sm font-medium">현재 보유 크레딧</p>
              <span className="material-symbols-outlined text-white/60 text-2xl">toll</span>
            </div>
            <p className="text-white text-5xl font-bold mb-4">{currentCredits.toLocaleString()}</p>
            <div className="grid grid-cols-3 gap-4 text-white/80 text-sm">
              <div>
                <p className="text-white/60 text-xs mb-1">이번 달 사용</p>
                <p className="font-semibold">850</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">총 충전</p>
                <p className="font-semibold">15,000</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">총 사용</p>
                <p className="font-semibold">13,800</p>
              </div>
            </div>
          </div>

          {/* 크레딧 패키지 */}
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4">크레딧 패키지 선택</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition ${
                    selectedPackage === pkg.id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-[#2a2436] hover:border-primary/50'
                  }`}
                >
                  {/* 인기 뱃지 */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-semibold">
                        인기
                      </span>
                    </div>
                  )}

                  {/* 크레딧 */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-white text-3xl font-bold">{pkg.credits.toLocaleString()}</p>
                    <p className="text-[#ab9eb7] text-sm">크레딧</p>
                  </div>

                  {/* 보너스 */}
                  {pkg.bonus > 0 && (
                    <p className="text-primary text-sm font-semibold mb-3">
                      + {pkg.bonus.toLocaleString()} 보너스
                    </p>
                  )}

                  {/* 가격 */}
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-white text-2xl font-bold">₩{pkg.price.toLocaleString()}</p>
                    <p className="text-[#ab9eb7] text-xs mt-1">
                      크레딧당 ₩{(pkg.price / (pkg.credits + pkg.bonus)).toFixed(1)}
                    </p>
                  </div>

                  {/* 선택 표시 */}
                  {selectedPackage === pkg.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 결제 방법 */}
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4">결제 방법 선택</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['카드결제', '카카오페이', '토스페이'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-lg border-2 transition ${
                    paymentMethod === method
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-[#2a2436] hover:border-primary/50'
                  }`}
                >
                  <p className="text-white font-medium">{method}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 구매 버튼 */}
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || !paymentMethod}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedPackage && packages.find((p) => p.id === selectedPackage)
              ? `₩${packages.find((p) => p.id === selectedPackage)!.price.toLocaleString()} 결제하기`
              : '패키지 선택'}
          </button>
        </div>

        {/* 오른쪽: 구매 내역 & 안내 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 구매 내역 */}
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4">최근 구매 내역</h2>
            <div className="space-y-3">
              {purchaseHistory.map((history) => (
                <div key={history.id} className="bg-[#2a2436] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-primary font-bold text-lg">
                      +{history.credits.toLocaleString()}
                    </p>
                    <span className="text-xs text-[#ab9eb7] bg-[#1a1625] px-2 py-1 rounded">
                      {history.method}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-[#ab9eb7]">{history.date}</p>
                    <p className="text-white">₩{history.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 크레딧 안내 */}
          <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              크레딧 안내
            </h3>
            <ul className="space-y-2 text-[#ab9eb7] text-sm">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                  check_circle
                </span>
                <span>크레딧은 유효기간 없이 사용 가능합니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                  check_circle
                </span>
                <span>서비스마다 필요한 크레딧이 다릅니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                  check_circle
                </span>
                <span>환불은 구매일로부터 7일 이내 가능합니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                  check_circle
                </span>
                <span>결제 후 즉시 크레딧이 충전됩니다</span>
              </li>
            </ul>
          </div>

          {/* 문의하기 */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
            <p className="text-white font-semibold mb-2">결제 관련 문의</p>
            <p className="text-[#ab9eb7] text-sm mb-4">
              결제 관련 문의사항이 있으시면 고객센터로 연락주세요
            </p>
            <button className="w-full bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition font-medium">
              고객센터 문의
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

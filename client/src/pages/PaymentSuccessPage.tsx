import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { isLoggedIn } from '../services/auth';

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLocation('/login');
      return;
    }

    confirmPayment();
  }, [setLocation]);

  const confirmPayment = async () => {
    try {
      // URL 파라미터에서 결제 정보 추출
      const urlParams = new URLSearchParams(window.location.search);
      const paymentKey = urlParams.get('paymentKey');
      const orderId = urlParams.get('orderId');
      const amount = urlParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        throw new Error('결제 정보가 올바르지 않습니다.');
      }

      // 서버에 결제 승인 요청
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: parseInt(amount, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 승인에 실패했습니다.');
      }

      const data = await response.json();
      setPaymentInfo(data);
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      setError(error.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">결제를 처리하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setLocation('/credit-purchase')}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* 성공 아이콘 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
          <p className="text-gray-600">크레딧이 성공적으로 충전되었습니다.</p>
        </div>

        {/* 결제 정보 */}
        {paymentInfo && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">주문번호</span>
              <span className="font-semibold text-gray-900">{paymentInfo.payment.orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">상품명</span>
              <span className="font-semibold text-gray-900">{paymentInfo.payment.orderName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">결제금액</span>
              <span className="font-semibold text-gray-900">₩{paymentInfo.payment.amount.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">충전된 크레딧</span>
                <span className="text-2xl font-bold text-green-600">+{paymentInfo.credits.granted.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">현재 크레딧</span>
                <span className="text-lg font-semibold text-gray-900">{paymentInfo.credits.after.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* 영수증 버튼 */}
        {paymentInfo?.payment?.receiptUrl && (
          <a
            href={paymentInfo.payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors mb-3"
          >
            영수증 보기
          </a>
        )}

        {/* 확인 버튼 */}
        <button
          onClick={() => setLocation('/mypage')}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}

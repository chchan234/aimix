import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { isLoggedIn } from '../services/auth';

export default function PaymentFailPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn()) {
      setLocation('/login');
    }
  }, [setLocation]);

  // URL 파라미터에서 실패 정보 추출
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const message = urlParams.get('message');

  const getErrorMessage = () => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다.';
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 승인을 거부했습니다.';
      default:
        return message || '결제 처리 중 오류가 발생했습니다.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* 실패 아이콘 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
          <p className="text-gray-600">{getErrorMessage()}</p>
        </div>

        {/* 에러 상세 정보 */}
        {code && (
          <div className="bg-red-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">오류 코드</p>
              <p className="font-mono">{code}</p>
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">다시 시도해주세요</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 카드 정보가 올바른지 확인해주세요.</li>
            <li>• 카드 한도가 충분한지 확인해주세요.</li>
            <li>• 문제가 계속되면 다른 결제 수단을 이용해주세요.</li>
          </ul>
        </div>

        {/* 버튼 그룹 */}
        <div className="space-y-3">
          <button
            onClick={() => setLocation('/credit-purchase')}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            다시 시도하기
          </button>
          <button
            onClick={() => setLocation('/mypage')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            마이페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

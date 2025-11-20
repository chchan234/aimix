/**
 * Toss Payments API Client
 * 토스페이먼츠 결제 승인 및 관리를 위한 서비스
 */

interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

interface PaymentConfirmResponse {
  mId: string;
  lastTransactionKey: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  taxExemptionAmount: number;
  status: string;
  requestedAt: string;
  approvedAt: string;
  useEscrow: boolean;
  cultureExpense: boolean;
  card?: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    interestPayer: string;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    amount: number;
  };
  virtualAccount?: any;
  transfer?: any;
  mobilePhone?: any;
  giftCertificate?: any;
  cashReceipt?: any;
  cashReceipts?: any[];
  discount?: any;
  cancels?: any[];
  secret?: string;
  type: string;
  easyPay?: {
    provider: string;
    amount: number;
    discountAmount: number;
  };
  country: string;
  failure?: {
    code: string;
    message: string;
  };
  isPartialCancelable: boolean;
  receipt?: {
    url: string;
  };
  checkout?: {
    url: string;
  };
  currency: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  method: string;
  version: string;
}

interface PaymentCancelRequest {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
}

class TossPaymentsClient {
  private readonly baseUrl = 'https://api.tosspayments.com/v1';
  private readonly secretKey: string;

  constructor() {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      throw new Error('TOSS_SECRET_KEY is not configured');
    }
    this.secretKey = secretKey;
  }

  /**
   * 결제 승인
   * @param data 결제 승인 요청 데이터
   * @returns 결제 승인 응답
   */
  async confirmPayment(data: PaymentConfirmRequest): Promise<PaymentConfirmResponse> {
    const url = `${this.baseUrl}/payments/confirm`;

    // Base64 인코딩 (시크릿 키 + 콜론)
    const encodedKey = Buffer.from(`${this.secretKey}:`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `Payment confirmation failed: ${response.status}`
      );
    }

    return result;
  }

  /**
   * 결제 조회
   * @param paymentKey 결제 키
   * @returns 결제 정보
   */
  async getPayment(paymentKey: string): Promise<PaymentConfirmResponse> {
    const url = `${this.baseUrl}/payments/${paymentKey}`;

    const encodedKey = Buffer.from(`${this.secretKey}:`).toString('base64');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedKey}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `Payment retrieval failed: ${response.status}`
      );
    }

    return result;
  }

  /**
   * 결제 취소
   * @param data 결제 취소 요청 데이터
   * @returns 결제 취소 응답
   */
  async cancelPayment(data: PaymentCancelRequest): Promise<PaymentConfirmResponse> {
    const url = `${this.baseUrl}/payments/${data.paymentKey}/cancel`;

    const encodedKey = Buffer.from(`${this.secretKey}:`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason: data.cancelReason,
        cancelAmount: data.cancelAmount,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `Payment cancellation failed: ${response.status}`
      );
    }

    return result;
  }
}

// 싱글톤 인스턴스
export const tossPayments = new TossPaymentsClient();

/**
 * Payments Routes
 * 토스페이먼츠 결제 처리 API
 */

import { Router } from 'express';
import { db } from '../db/index.js';
import { payments, transactions, users, insertPaymentSchema } from '../db/schema.js';
import { tossPayments } from '../services/toss-payments.js';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// 크레딧 패키지 정의
const CREDIT_PACKAGES = {
  basic: { credits: 100, price: 9900, name: '베이직 패키지' },
  standard: { credits: 300, price: 24900, name: '스탠다드 패키지' },
  premium: { credits: 1000, price: 69900, name: '프리미엄 패키지' },
  enterprise: { credits: 5000, price: 299000, name: '엔터프라이즈 패키지' },
};

// 결제 준비 스키마
const preparePaymentSchema = z.object({
  packageType: z.enum(['basic', 'standard', 'premium', 'enterprise']),
});

// 결제 승인 스키마
const confirmPaymentSchema = z.object({
  paymentKey: z.string(),
  orderId: z.string(),
  amount: z.number(),
});

/**
 * POST /api/payments/prepare
 * 결제 준비 - orderId 생성
 */
router.post('/prepare', authenticateToken, async (req, res) => {
  try {
    const { packageType } = preparePaymentSchema.parse(req.body);
    const userId = req.user!.id;

    const creditPackage = CREDIT_PACKAGES[packageType];
    if (!creditPackage) {
      return res.status(400).json({ error: 'Invalid package type' });
    }

    // orderId 생성 (고유한 주문번호)
    const orderId = `ORDER_${userId.substring(0, 8)}_${Date.now()}`;

    res.json({
      orderId,
      amount: creditPackage.price,
      orderName: creditPackage.name,
      credits: creditPackage.credits,
      clientKey: process.env.TOSS_CLIENT_KEY,
    });
  } catch (error) {
    console.error('Payment prepare error:', error);
    res.status(500).json({ error: 'Failed to prepare payment' });
  }
});

/**
 * POST /api/payments/confirm
 * 결제 승인 및 크레딧 지급
 */
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    const { paymentKey, orderId, amount } = confirmPaymentSchema.parse(req.body);
    const userId = req.user!.id;

    // 1. 토스페이먼츠 결제 승인 API 호출
    const paymentResult = await tossPayments.confirmPayment({
      paymentKey,
      orderId,
      amount,
    });

    // 2. 결제 승인 실패 시
    if (paymentResult.status !== 'DONE') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: paymentResult.status,
      });
    }

    // 3. 주문 이름에서 크레딧 수 추출
    const credits = parseInt(paymentResult.orderName.match(/\d+/)?.[0] || '0', 10);
    if (credits === 0) {
      // orderName에서 크레딧 추출 실패 시 패키지 매핑
      const packageMatch = Object.values(CREDIT_PACKAGES).find(
        pkg => pkg.name === paymentResult.orderName
      );
      if (!packageMatch) {
        return res.status(400).json({ error: 'Invalid order name' });
      }
    }

    // 4. 사용자 정보 조회
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const creditsBefore = user.credits;
    const creditsAfter = creditsBefore + credits;

    // 5. 트랜잭션 생성 (크레딧 충전)
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: 'charge',
        amount: credits,
        creditsBefore,
        creditsAfter,
        referenceId: paymentResult.paymentKey,
        referenceType: 'payment',
        description: `결제를 통한 크레딧 충전: ${paymentResult.orderName}`,
        metadata: {
          paymentKey: paymentResult.paymentKey,
          orderId: paymentResult.orderId,
          amount: paymentResult.totalAmount,
        },
      })
      .returning();

    // 6. 결제 내역 저장
    const [payment] = await db
      .insert(payments)
      .values({
        userId,
        transactionId: transaction.id,
        paymentKey: paymentResult.paymentKey,
        orderId: paymentResult.orderId,
        orderName: paymentResult.orderName,
        method: paymentResult.method,
        totalAmount: paymentResult.totalAmount,
        balanceAmount: paymentResult.balanceAmount,
        status: paymentResult.status,
        cardNumber: paymentResult.card?.number,
        cardType: paymentResult.card?.cardType,
        cardIssuer: paymentResult.card?.issuerCode,
        cardAcquirer: paymentResult.card?.acquirerCode,
        easyPayProvider: paymentResult.easyPay?.provider,
        easyPayAmount: paymentResult.easyPay?.amount,
        requestedAt: new Date(paymentResult.requestedAt),
        approvedAt: new Date(paymentResult.approvedAt),
        receiptUrl: paymentResult.receipt?.url,
        creditsGranted: credits,
        metadata: paymentResult,
      })
      .returning();

    // 7. 사용자 크레딧 업데이트
    await db
      .update(users)
      .set({
        credits: creditsAfter,
        lifetimeCredits: user.lifetimeCredits + credits,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        orderName: payment.orderName,
        amount: payment.totalAmount,
        status: payment.status,
        approvedAt: payment.approvedAt,
        receiptUrl: payment.receiptUrl,
      },
      credits: {
        granted: credits,
        before: creditsBefore,
        after: creditsAfter,
      },
    });
  } catch (error: any) {
    console.error('Payment confirm error:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message,
    });
  }
});

/**
 * GET /api/payments/history
 * 결제 내역 조회
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const paymentHistory = await db
      .select({
        id: payments.id,
        orderId: payments.orderId,
        orderName: payments.orderName,
        method: payments.method,
        totalAmount: payments.totalAmount,
        status: payments.status,
        creditsGranted: payments.creditsGranted,
        approvedAt: payments.approvedAt,
        createdAt: payments.createdAt,
        receiptUrl: payments.receiptUrl,
      })
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      payments: paymentHistory,
      pagination: {
        limit,
        offset,
        total: paymentHistory.length,
      },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

/**
 * GET /api/payments/packages
 * 크레딧 패키지 목록 조회
 */
router.get('/packages', authenticateToken, async (req, res) => {
  res.json({
    packages: Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => ({
      id: key,
      ...pkg,
    })),
  });
});

export default router;

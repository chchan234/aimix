/**
 * Credits Middleware
 * Handles credit checking and deduction for AI services
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase.js';

/**
 * Credit costs for different AI services
 */
export const CREDIT_COSTS = {
  // Text services
  'name-analysis': 10,
  'dream-interpretation': 15,
  'story': 20,
  'chat': 5,
  // Fortune services
  'face-reading': 25, // Vision API is more expensive
  'saju': 25, // 사주팔자
  'palmistry': 25, // 수상
  'horoscope': 15, // 별자리 운세
  'zodiac': 15, // 띠 운세
  'love-compatibility': 20, // 연애궁합
  'name-compatibility': 15, // 이름궁합
  'marriage-compatibility': 25, // 결혼궁합
  'tarot': 20, // 타로
  'tojeong': 15, // 토정비결
  // Image generation/editing services
  'profile-generator': 30, // AI 프로필 생성
  'caricature': 35, // 캐리커쳐 변환
  'id-photo': 25, // 증명사진
  'face-swap': 40, // 얼굴 바꾸기
  'age-transform': 35, // 나이 변환
  'gender-swap': 35, // 성별 바꾸기
  'colorization': 30, // 흑백사진 컬러화
  'background-removal': 25, // 배경 제거
  'hairstyle': 30, // 헤어스타일 변경
  'tattoo': 30, // 타투 시뮬레이션
} as const;

/**
 * Check if user has enough credits and deduct them
 */
export function requireCredits(serviceName: keyof typeof CREDIT_COSTS) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required'
        });
        return;
      }

      const cost = CREDIT_COSTS[serviceName];
      const userId = req.user.userId;

      // Atomically deduct credits using PostgreSQL function
      // This prevents race conditions in concurrent requests
      const { data, error } = await supabase
        .rpc('deduct_credits', {
          p_user_id: userId,
          p_amount: cost
        })
        .single();

      if (error) {
        console.error('Credit deduction error:', error);
        res.status(500).json({
          error: 'Failed to deduct credits'
        });
        return;
      }

      // If no user returned, insufficient credits
      if (!data) {
        // Fetch current credits for error message
        const { data: user } = await supabase
          .from('users')
          .select('credits')
          .eq('id', userId)
          .single();

        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: `This service costs ${cost} credits, but you only have ${user?.credits || 0} credits.`,
            details: {
              required: cost,
              current: user?.credits || 0
            }
          }
        });
        return;
      }

      // Update user data in request (for response use)
      req.userData = data as typeof req.userData;

      // Attach credit info to response
      res.locals.creditInfo = {
        cost,
        previousBalance: (data as any).credits + cost, // Calculate previous balance
        newBalance: (data as any).credits
      };

      next();
    } catch (error) {
      console.error('Credits middleware error:', error);
      res.status(500).json({
        error: 'Credit processing failed'
      });
    }
  };
}

/**
 * Attach credit info to successful response
 */
export function attachCreditInfo(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    if (res.locals.creditInfo && body.success !== false) {
      body.credits = {
        ...res.locals.creditInfo,
        remaining: req.userData?.credits
      };
    }
    return originalJson(body);
  };

  next();
}

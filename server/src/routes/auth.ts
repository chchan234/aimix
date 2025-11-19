/**
 * Authentication Routes
 *
 * Handles user registration, login, and OAuth (Kakao, Google)
 */

import express, { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { generateVerificationToken, getTokenExpiration, sendVerificationEmail } from '../services/email.js';
import { createRefreshToken } from '../services/refreshToken.js';
import { rateLimitByIP } from '../middleware/rateLimit.js';
import { generateStateToken, verifyAndConsumeStateToken } from '../utils/oauth-state.js';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens')
    .optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const router = express.Router();

// JWT_SECRET is validated at server startup
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_DAYS = 30;

/**
 * Helper: Set authentication cookies
 */
function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';

  // Access token (short-lived, 7 days)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Refresh token (long-lived, 30 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  });
}

/**
 * Helper: Clear authentication cookies
 */
function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

// Kakao OAuth API response types
interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  refresh_token_expires_in?: number;
}

interface KakaoUserResponse {
  id: number;
  connected_at?: string;
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    email?: string;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
  };
}

/**
 * POST /api/auth/register
 * Register new user with email/password
 * Rate limited to prevent abuse
 */
router.post('/register', rateLimitByIP(5, 60 * 1000), async (req, res) => {
  try {
    // Validate input with Zod
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    const { email, password, username } = validation.data;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = getTokenExpiration();

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        username: username || email.split('@')[0],
        provider: 'email',
        credits: 1000, // Welcome bonus
        lifetime_credits: 1000,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires: verificationTokenExpires.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Send verification email
    try {
      await sendVerificationEmail(email, newUser.username, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user is created, they can request resend later
    }

    // Generate JWT access token (but email not verified yet)
    const accessToken = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        emailVerified: false,
        provider: 'email'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = await createRefreshToken(newUser.id);

    // Set httpOnly cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      token: accessToken, // For backward compatibility with localStorage clients
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        credits: newUser.credits,
        profileImageUrl: newUser.profile_image_url,
        emailVerified: false
      },
      message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email/password
 * Rate limited to prevent brute force attacks
 */
router.post('/login', rateLimitByIP(5, 60 * 1000), async (req, res) => {
  try {
    // Validate input with Zod
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    const { email, password } = validation.data;

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('provider', 'email')
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password || '');

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT access token
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        emailVerified: user.email_verified,
        provider: 'email'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = await createRefreshToken(user.id);

    // Set httpOnly cookies
    setAuthCookies(res, jwtToken, refreshToken);

    res.json({
      success: true,
      token: jwtToken, // For backward compatibility
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
        profileImageUrl: user.profile_image_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Login failed'
    });
  }
});

/**
 * GET /api/auth/oauth/state
 * Generate OAuth state token for CSRF protection
 */
router.get('/oauth/state', (req, res) => {
  const state = generateStateToken();
  res.json({ state });
});

/**
 * POST /api/auth/kakao
 * Kakao OAuth login/signup
 */
router.post('/kakao', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access token is required'
      });
    }

    // Get user info from Kakao
    const kakaoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    if (!kakaoResponse.ok) {
      throw new Error('Failed to get Kakao user info');
    }

    const kakaoUser = await kakaoResponse.json() as KakaoUserResponse;
    const kakaoId = String(kakaoUser.id);
    const email = kakaoUser.kakao_account?.email;
    const nickname = kakaoUser.kakao_account?.profile?.nickname;
    const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('provider', 'kakao')
      .eq('provider_id', kakaoId)
      .single();

    let user;

    if (existingUser) {
      // Login existing user
      user = existingUser;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email || `kakao_${kakaoId}@aiplatform.com`,
          username: nickname || `kakao_${kakaoId}`,
          provider: 'kakao',
          provider_id: kakaoId,
          profile_image_url: profileImage,
          credits: 1000, // Welcome bonus
          lifetime_credits: 1000
        })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    }

    // Generate JWT access token
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        emailVerified: true, // Kakao users are pre-verified
        provider: 'kakao'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = await createRefreshToken(user.id);

    // Set httpOnly cookies
    setAuthCookies(res, jwtToken, refreshToken);

    res.json({
      success: true,
      token: jwtToken, // For backward compatibility
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
        profileImageUrl: user.profile_image_url
      }
    });

  } catch (error) {
    console.error('Kakao login error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Kakao login failed'
    });
  }
});

/**
 * POST /api/auth/kakao/callback
 * Handle Kakao OAuth callback - exchange authorization code for access token
 * Rate limited to prevent abuse
 */
router.post('/kakao/callback', rateLimitByIP(10, 60 * 1000), async (req, res) => {
  try {
    const startTime = Date.now();
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Authorization code is required'
      });
    }

    // Verify OAuth state parameter to prevent CSRF attacks
    if (!state || typeof state !== 'string' || state.length !== 64) {
      return res.status(403).json({
        error: 'Invalid or missing OAuth state parameter',
        message: 'Possible CSRF attack detected'
      });
    }

    // Verify that this state token was actually issued by us
    if (!verifyAndConsumeStateToken(state)) {
      return res.status(403).json({
        error: 'Invalid OAuth state token',
        message: 'State token is invalid, expired, or already used. Possible CSRF attack.'
      });
    }

    // Get the origin from the request header (where the frontend is hosted)
    const origin = req.headers.origin || req.headers.referer?.split('/oauth')[0] || process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUri = `${origin}/oauth/kakao/callback`;

    console.log('Kakao callback started - redirect_uri:', redirectUri);

    // Exchange authorization code for access token
    const tokenStartTime = Date.now();
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY || '',
        redirect_uri: redirectUri,
        code
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', {
        status: tokenResponse.status,
        errorData,
        redirect_uri: redirectUri,
        origin: req.headers.origin,
        client_id: process.env.KAKAO_REST_API_KEY ? 'SET' : 'NOT_SET'
      });
      throw new Error(`Failed to exchange authorization code: ${JSON.stringify(errorData)}`);
    }

    const tokenData = await tokenResponse.json() as KakaoTokenResponse;
    const accessToken = tokenData.access_token;
    console.log(`Token exchange took ${Date.now() - tokenStartTime}ms`);

    // Get user info from Kakao
    const userInfoStartTime = Date.now();
    const kakaoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    if (!kakaoResponse.ok) {
      throw new Error('Failed to get Kakao user info');
    }

    const kakaoUser = await kakaoResponse.json() as KakaoUserResponse;
    const kakaoId = String(kakaoUser.id);
    const email = kakaoUser.kakao_account?.email;
    const nickname = kakaoUser.kakao_account?.profile?.nickname;
    const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url;
    console.log(`User info fetch took ${Date.now() - userInfoStartTime}ms`);

    // Check if user exists
    const dbStartTime = Date.now();
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('provider', 'kakao')
      .eq('provider_id', kakaoId)
      .single();

    let user;

    if (existingUser) {
      // Login existing user
      user = existingUser;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email || `kakao_${kakaoId}@aiplatform.com`,
          username: nickname || `kakao_${kakaoId}`,
          provider: 'kakao',
          provider_id: kakaoId,
          profile_image_url: profileImage,
          credits: 1000, // Welcome bonus
          lifetime_credits: 1000
        })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        emailVerified: true, // Kakao users are pre-verified
        provider: 'kakao'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`Database operation took ${Date.now() - dbStartTime}ms`);
    console.log(`Total Kakao login took ${Date.now() - startTime}ms`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
        profileImageUrl: user.profile_image_url
      }
    });

  } catch (error) {
    console.error('Kakao callback error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Kakao authentication failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, credits, profile_image_url, provider, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
        profileImageUrl: user.profile_image_url,
        provider: user.provider,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
});

/**
 * GET /api/auth/credits
 * Get user credits
 */
router.get('/credits', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        credits: 0,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Get user credits from database
    const { data: user, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        credits: 0,
        error: 'Invalid token'
      });
    }

    res.json({
      success: true,
      credits: user.credits
    });

  } catch (error) {
    console.error('Get credits error:', error);
    res.status(401).json({
      success: false,
      credits: 0,
      error: 'Invalid or expired token'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout and revoke refresh token
 */
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // Revoke refresh token if present
    if (refreshToken) {
      const { revokeRefreshToken } = await import('../services/refreshToken.js');
      await revokeRefreshToken(refreshToken);
    }

    // Clear cookies
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Clear cookies even if revocation fails
    clearAuthCookies(res);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: 'No refresh token provided'
      });
      return;
    }

    // Verify refresh token and get user ID
    const { verifyRefreshToken } = await import('../services/refreshToken.js');
    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
      clearAuthCookies(res);
      res.status(401).json({
        error: 'Invalid or expired refresh token'
      });
      return;
    }

    // Get user data
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      clearAuthCookies(res);
      res.status(401).json({
        error: 'User not found'
      });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        emailVerified: user.email_verified,
        provider: user.provider
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set new access token cookie (refresh token remains the same)
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      token: newAccessToken, // For backward compatibility
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        credits: user.credits,
        emailVerified: user.email_verified,
        provider: user.provider
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    clearAuthCookies(res);
    res.status(401).json({
      error: 'Failed to refresh token'
    });
  }
});

/**
 * GET /api/auth/verify-email
 * Verify email with token
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: '유효하지 않은 인증 링크입니다.'
      });
    }

    // Find user with this verification token
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (fetchError || !user) {
      return res.status(400).json({
        error: '유효하지 않거나 만료된 인증 링크입니다.'
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.json({
        success: true,
        message: '이미 인증된 이메일입니다.',
        alreadyVerified: true
      });
    }

    // Check if token expired
    const tokenExpires = new Date(user.verification_token_expires);
    if (tokenExpires < new Date()) {
      return res.status(400).json({
        error: '인증 링크가 만료되었습니다. 새로운 인증 이메일을 요청해주세요.'
      });
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires: null
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다!'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: '이메일 인증 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: '이메일이 필요합니다.'
      });
    }

    // Find user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('provider', 'email')
      .single();

    if (fetchError || !user) {
      return res.status(400).json({
        error: '해당 이메일로 가입된 계정을 찾을 수 없습니다.'
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.json({
        success: true,
        message: '이미 인증된 이메일입니다.'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = getTokenExpiration();

    // Update user with new token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_token: verificationToken,
        verification_token_expires: verificationTokenExpires.toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Send verification email
    await sendVerificationEmail(email, user.username, verificationToken);

    res.json({
      success: true,
      message: '인증 이메일이 재전송되었습니다. 이메일을 확인해주세요.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: '인증 이메일 재전송 중 오류가 발생했습니다.'
    });
  }
});

export default router;

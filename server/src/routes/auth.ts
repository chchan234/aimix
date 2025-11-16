/**
 * Authentication Routes
 *
 * Handles user registration, login, and OAuth (Kakao, Google)
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';
import { generateVerificationToken, getTokenExpiration, sendVerificationEmail } from '../services/email.js';

const router = express.Router();

// JWT_SECRET is validated at server startup - no fallback needed
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

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
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

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

    // Generate JWT token (but email not verified yet)
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        emailVerified: false
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
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
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

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

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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
    console.error('Login error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Login failed'
    });
  }
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

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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
    console.error('Kakao login error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Kakao login failed'
    });
  }
});

/**
 * POST /api/auth/kakao/callback
 * Handle Kakao OAuth callback - exchange authorization code for access token
 */
router.post('/kakao/callback', async (req, res) => {
  try {
    const startTime = Date.now();
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Authorization code is required'
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
        email: user.email
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
 * POST /api/auth/logout
 * Logout (client-side token removal mainly)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
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

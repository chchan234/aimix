/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Uses relative paths in production (same domain), localhost in development.
 */

const API_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://server-vert-five-94.vercel.app';

export interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
  profileImageUrl?: string;
  provider?: string;
  createdAt?: string;
  emailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

/**
 * Register new user with email/password
 */
export async function register(email: string, password: string, username?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, username }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

/**
 * Login with email/password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

/**
 * Login with Kakao
 */
export async function kakaoLogin(accessToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/kakao`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kakao login failed');
  }

  return response.json();
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user');
  }

  const data = await response.json();
  return data.user;
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  const token = localStorage.getItem('authToken');

  if (token) {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Clear local storage
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  localStorage.removeItem('userEmail');
}

/**
 * Initialize Kakao SDK (no longer needed with direct OAuth)
 */
export function initKakao() {
  // No longer using Kakao JavaScript SDK
  // Using direct OAuth URL instead
}

/**
 * Trigger Kakao login redirect using REST API (direct OAuth)
 */
export function loginWithKakao(): void {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = `${window.location.origin}/oauth/kakao/callback`;

  // Direct OAuth authorization URL (no SDK needed)
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  window.location.href = kakaoAuthUrl;
}

/**
 * Save auth data to localStorage
 */
export function saveAuthData(token: string, user: User) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('username', user.username);
  localStorage.setItem('userEmail', user.email);
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return localStorage.getItem('authToken') !== null;
}

// TypeScript declarations for Kakao SDK
declare global {
  interface Window {
    Kakao: any;
  }
}

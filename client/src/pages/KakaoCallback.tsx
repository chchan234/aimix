import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { saveAuthData, verifyOAuthState } from '../services/auth';

export default function KakaoCallback() {
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double submission using ref
      if (hasProcessed.current) {
        console.log('Already processed callback, skipping duplicate request');
        return;
      }
      hasProcessed.current = true;

      try {
        // Get authorization code and state from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Verify OAuth state to prevent CSRF attacks
        if (!verifyOAuthState(state)) {
          throw new Error('Invalid OAuth state - possible security issue');
        }

        console.log('Processing Kakao callback with code:', code.substring(0, 10) + '...');

        // Send authorization code to backend for token exchange
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        console.log('Sending code to server:', API_URL);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`${API_URL}/api/auth/kakao/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code, state }),
          mode: 'cors',
          credentials: 'include',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('Server response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Kakao authentication failed');
        }

        const data = await response.json();

        // Save auth data
        saveAuthData(data.token, data.user);

        // Redirect to home with full page reload to update header state
        window.location.href = '/';
      } catch (err) {
        console.error('Kakao callback error:', err);

        let errorMessage = 'Kakao login failed';
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Request timeout - please try again';
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);

        // Redirect back to login after 3 seconds
        setTimeout(() => setLocation('/login'), 3000);
      }
    };

    handleCallback();
  }, [setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error mb-4">Login Failed</h1>
          <p className="text-text-secondary mb-4">{error}</p>
          <p className="text-sm text-text-secondary">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Logging in with Kakao...</p>
      </div>
    </div>
  );
}

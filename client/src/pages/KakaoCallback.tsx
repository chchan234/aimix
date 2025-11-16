import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { saveAuthData } from '../services/auth';

export default function KakaoCallback() {
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Send authorization code to backend for token exchange
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/auth/kakao/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

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
        setError(err instanceof Error ? err.message : 'Kakao login failed');

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

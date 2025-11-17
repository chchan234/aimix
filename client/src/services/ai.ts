/**
 * AI Service API
 * Handles all AI-related API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Common API request wrapper
 */
async function apiRequest<T>(endpoint: string, data: any): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch (e) {
      // If response is not JSON (e.g., HTML error page), use status text
      errorMessage = `${response.statusText || 'Request failed'} (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Analyze Saju (사주팔자)
 */
export async function analyzeSaju(
  birthDate: string,
  birthTime: string,
  gender: 'male' | 'female'
) {
  return apiRequest('/api/ai/saju', { birthDate, birthTime, gender });
}

/**
 * Read Tarot cards
 */
export async function readTarot(question: string) {
  return apiRequest('/api/ai/tarot', { question });
}

/**
 * Predict fortune using Tojeong Bigyeol
 */
export async function predictTojeong(birthDate: string) {
  return apiRequest('/api/ai/tojeong', { birthDate });
}

/**
 * Analyze face for fortune reading
 */
export async function analyzeFaceReading(base64Image: string) {
  return apiRequest('/api/ai/face-reading', { base64Image });
}

/**
 * Interpret dream
 */
export async function interpretDream(dream: string) {
  return apiRequest('/api/ai/dream-interpretation', { dream });
}

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
 * Analyze face for fortune reading
 */
export async function analyzeFaceReading(base64Image: string) {
  return apiRequest('/api/ai/face-reading', { base64Image });
}

/**
 * Analyze palmistry (수상)
 */
export async function analyzePalmistry(
  base64Image: string,
  hand: 'left' | 'right' = 'right'
) {
  return apiRequest('/api/ai/palmistry', { base64Image, hand });
}

/**
 * Analyze horoscope (별자리 운세)
 */
export async function analyzeHoroscope(
  birthDate: string,
  zodiacSign?: string
) {
  return apiRequest('/api/ai/horoscope', { birthDate, zodiacSign });
}

/**
 * Analyze Chinese zodiac (띠 운세)
 */
export async function analyzeZodiac(birthDate: string) {
  return apiRequest('/api/ai/zodiac', { birthDate });
}

/**
 * Analyze love compatibility (연애궁합)
 */
export async function analyzeLoveCompatibility(
  person1BirthDate: string,
  person2BirthDate: string
) {
  return apiRequest('/api/ai/love-compatibility', { person1BirthDate, person2BirthDate });
}

/**
 * Analyze name compatibility (이름궁합)
 */
export async function analyzeNameCompatibility(
  name1: string,
  name2: string
) {
  return apiRequest('/api/ai/name-compatibility', { name1, name2 });
}

/**
 * Analyze marriage compatibility (결혼궁합)
 */
export async function analyzeMarriageCompatibility(
  person1Name: string,
  person1BirthDate: string,
  person2Name: string,
  person2BirthDate: string
) {
  return apiRequest('/api/ai/marriage-compatibility', {
    person1Name,
    person1BirthDate,
    person2Name,
    person2BirthDate,
  });
}

/**
 * Get all results for the authenticated user
 */
export async function getResults() {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/results`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch results';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch (e) {
      errorMessage = `${response.statusText || 'Request failed'} (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete a result
 */
export async function deleteResult(resultId: string) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/results/${resultId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to delete result';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch (e) {
      errorMessage = `${response.statusText || 'Request failed'} (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

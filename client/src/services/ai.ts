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
      // Handle structured error objects (e.g., credit errors)
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      }
      // Include details if available (for validation errors)
      else if (error.details) {
        errorMessage = `${error.error}: ${error.details}`;
      }
      // Simple error message
      else {
        errorMessage = error.error || error.message || errorMessage;
      }
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
 * Deep Saju 2026 Analysis (심층 신년운세)
 */
export async function analyzeDeepSaju2026(
  birthDate: string,
  birthTime: string,
  gender: 'male' | 'female'
) {
  return apiRequest('/api/ai/deep-saju-2026', { birthDate, birthTime, gender });
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
 * Get user credits
 */
export async function getCredits(): Promise<{ success: boolean; credits: number }> {
  const token = getAuthToken();

  if (!token) {
    return { success: false, credits: 0 };
  }

  const response = await fetch(`${API_URL}/api/auth/credits`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { success: false, credits: 0 };
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

/**
 * Image Generation/Editing Services
 */

// 1. Profile Generator
export async function generateProfile(description: string, style: string = 'professional') {
  return apiRequest('/api/image/profile-generator', { description, style });
}

// 2. Caricature
export async function generateCaricature(base64Image: string, exaggerationLevel: string = 'medium') {
  return apiRequest('/api/image/caricature', { base64Image, exaggerationLevel });
}

// 3. ID Photo
export async function generateIdPhoto(base64Image: string, backgroundColor: string = 'white') {
  return apiRequest('/api/image/id-photo', { base64Image, backgroundColor });
}

// 4. Age Transform
export async function transformAge(base64Image: string, targetAge: number) {
  return apiRequest('/api/image/age-transform', { base64Image, targetAge });
}

// 6. Gender Swap
export async function swapGender(base64Image: string) {
  return apiRequest('/api/image/gender-swap', { base64Image });
}

// 7. Colorization
export async function colorizePhoto(base64Image: string) {
  return apiRequest('/api/image/colorization', { base64Image });
}

// 8. Background Removal
export async function removeBackground(base64Image: string, newBackground: string = 'transparent') {
  return apiRequest('/api/image/background-removal', { base64Image, newBackground });
}

// 9. Hairstyle
export async function changeHairstyle(base64Image: string, hairstyleDescription: string) {
  return apiRequest('/api/image/hairstyle', { base64Image, hairstyleDescription });
}

// 10. Tattoo
export async function addTattoo(base64Image: string, tattooDescription: string, placement: string) {
  return apiRequest('/api/image/tattoo', { base64Image, tattooDescription, placement });
}

// ============================================
// Personality Tests
// ============================================

// Get MBTI Questions
export async function getMBTIQuestions() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/personality/mbti/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch MBTI questions';
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

// Get Enneagram Questions
export async function getEnneagramQuestions() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/personality/enneagram/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch Enneagram questions';
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

// MBTI Analysis
export async function analyzeMBTI(userInputMBTI: string | null, answers: number[]) {
  return apiRequest('/api/personality/mbti-analysis', { userInputMBTI, answers });
}

// Enneagram Test
export async function analyzeEnneagram(answers: number[]) {
  return apiRequest('/api/personality/enneagram-test', { answers });
}

// Get Big Five Questions
export async function getBigFiveQuestions() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/personality/bigfive/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch Big Five questions';
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

// Big Five Test
export async function analyzeBigFive(answers: number[]) {
  return apiRequest('/api/personality/bigfive-test', { answers });
}

// Get Stress Questions
export async function getStressQuestions() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/personality/stress/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch Stress questions';
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

// Stress Test
export async function analyzeStress(answers: number[]) {
  return apiRequest('/api/personality/stress-test', { answers });
}

// Get Geumjjoki Questions
export async function getGeumjjokiQuestions() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/personality/geumjjoki/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch Geumjjoki questions';
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

// Geumjjoki Test
export async function analyzeGeumjjoki(answers: number[]) {
  return apiRequest('/api/personality/geumjjoki-test', { answers });
}

// Lookalike Finder
export async function findLookalike(base64Image: string, category: 'celebrity' | 'anime' | 'animal') {
  return apiRequest('/api/image/lookalike', { base64Image, category });
}

// Pet Soulmate
export async function analyzePetSoulmate(base64Image: string) {
  return apiRequest('/api/image/pet-soulmate', { base64Image });
}

// Baby Face Prediction
export async function generateBabyFace(parent1Image: string, parent2Image: string, style: 'normal' | 'idol' = 'normal') {
  return apiRequest('/api/image/baby-face', { parent1Image, parent2Image, style });
}

// Personal Color Analysis
export async function analyzePersonalColor(base64Image: string) {
  return apiRequest('/api/image/personal-color', { base64Image });
}

// Professional Headshot
export async function generateProfessionalHeadshot(base64Image: string, style: 'professional' | 'business' | 'casual' = 'professional') {
  return apiRequest('/api/image/professional-headshot', { base64Image, style });
}

// Body Type Analysis
export async function analyzeBodyType(base64Image: string) {
  return apiRequest('/api/health/body-analysis', { base64Image });
}

// Skin Analysis
export async function analyzeSkin(base64Image: string) {
  return apiRequest('/api/health/skin-analysis', { base64Image });
}

// BMI Calculator
export async function calculateBMI(height: number, weight: number, age: number, gender: 'male' | 'female') {
  return apiRequest('/api/health/bmi-calculator', { height, weight, age, gender });
}

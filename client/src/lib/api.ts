/**
 * API Configuration and Utilities
 *
 * Centralized API client for making requests to the backend server.
 * Uses environment variable for API URL configuration.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Generic API request wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API Health Check
 * Tests backend connectivity and database status
 */
export async function checkHealth() {
  return apiRequest<{
    status: string;
    timestamp: string;
    database: string;
    message: string;
  }>('/health');
}

/**
 * Get user count
 */
export async function getUserCount() {
  return apiRequest<{ count: number }>('/api/users/count');
}

/**
 * Export API base URL for direct usage
 */
export { API_BASE_URL };

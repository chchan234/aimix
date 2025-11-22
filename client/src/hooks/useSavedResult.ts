import { useEffect, useState } from 'react';
import { getToken } from '../services/auth';

export function useSavedResult<T>(onResultLoaded?: (result: T, step: string) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultId = params.get('resultId');

    if (resultId && onResultLoaded) {
      loadSavedResult(resultId);
    }
  }, []);

  const loadSavedResult = async (resultId: string) => {
    try {
      setLoading(true);
      const token = getToken();

      const response = await fetch(`/api/results/${resultId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error('저장된 결과를 불러올 수 없습니다.');
      }

      const data = await response.json();

      if (onResultLoaded) {
        onResultLoaded(data.resultData, 'result');
      }
    } catch (err: any) {
      console.error('Error loading saved result:', err);
      setError(err.message || '저장된 결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error };
}

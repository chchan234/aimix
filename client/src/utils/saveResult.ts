import { getToken } from '../services/auth';

export interface SaveResultParams {
  serviceType: string;
  inputData: any;
  resultData: any;
  aiModel?: string;
  tokensUsed?: number;
  processingTime?: number;
}

export async function saveResult(params: SaveResultParams): Promise<boolean> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/results', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      serviceType: params.serviceType,
      inputData: params.inputData || {},
      resultData: params.resultData,
      aiModel: params.aiModel,
      tokensUsed: params.tokensUsed || 0,
      processingTime: params.processingTime || 0,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save result');
  }

  return true;
}

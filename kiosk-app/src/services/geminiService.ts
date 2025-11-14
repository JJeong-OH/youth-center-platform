// kiosk-app/src/services/geminiService.ts
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api/kiosk';

// 세션 ID 생성
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

const handleError = (error: unknown) => {
  console.error('Error communicating with backend:', error);
  return {
    text: '죄송합니다. 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.',
    functionCalls: [],
  };
};

export const sendMessageToCounselor = async (message: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: `counselor_${SESSION_ID}`,
        type: 'counselor',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    return handleError(error);
  }
};

export const sendMessageToRecommender = async (message: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: `recommender_${SESSION_ID}`,
        type: 'recommender',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    return handleError(error);
  }
};
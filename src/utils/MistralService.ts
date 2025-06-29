import axios from 'axios';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY || '';
const MISTRAL_API_URL = import.meta.env.VITE_MISTRAL_API_URL || 'https://api.mistral.ai/v1/chat/completions';
const DEFAULT_MODEL = 'mistral-tiny';

export async function getMistralChatCompletion(messages, options = {}) {
  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: options.model || DEFAULT_MODEL,
        messages,
        ...options
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || error.message || 'Mistral API error');
  }
} 
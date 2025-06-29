import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

// Simple in-memory cache (replace with Redis for production)
const responseCache = new Map();

// Simple rate limiter (per process, not distributed)
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // ~1 req/sec

export async function getChatCompletion(messages, options = {}) {
  // Rate limiting
  const now = Date.now();
  if (now - lastRequestTime < MIN_INTERVAL_MS) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  lastRequestTime = now;

  // Caching (keyed by prompt)
  const cacheKey = JSON.stringify(messages) + JSON.stringify(options);
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: options.model || DEFAULT_MODEL,
        messages,
        ...options
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    responseCache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    // TODO: Add more robust error handling and logging
    throw new Error(error.response?.data?.error?.message || error.message || 'OpenAI API error');
  }
}

// Documented integration point for future LLM replacement
// Replace getChatCompletion with new LLM provider as needed 
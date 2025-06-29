import { getChatCompletion } from '../utils/OpenAIService';

describe('OpenAIService', () => {
  it('should throw error if rate limit exceeded', async () => {
    await expect(getChatCompletion([{ role: 'user', content: 'Hello' }])).resolves.toBeDefined();
    await expect(getChatCompletion([{ role: 'user', content: 'Hello' }])).rejects.toThrow('Rate limit exceeded');
  });

  it('should cache responses for identical prompts', async () => {
    const response1 = await getChatCompletion([{ role: 'user', content: 'Test' }]);
    const response2 = await getChatCompletion([{ role: 'user', content: 'Test' }]);
    expect(response1).toBe(response2);
  });

  it('should handle OpenAI API errors gracefully', async () => {
    process.env.OPENAI_API_KEY = '';
    await expect(getChatCompletion([{ role: 'user', content: 'Test' }])).rejects.toThrow();
  });
}); 
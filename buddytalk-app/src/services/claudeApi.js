import { getSystemPrompt } from '../config/prompts';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function getCharacterResponse(character, conversationHistory) {
  if (!CLAUDE_API_KEY) {
    console.error('VITE_CLAUDE_API_KEY not found in environment variables');
    // Fallback to a simple response for testing without API
    return "That's so interesting! Tell me more!";
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        system: getSystemPrompt(character),
        messages: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    // Fallback response
    return "I'm having trouble thinking right now. Can you say that again?";
  }
}

import { getSystemPrompt } from '../config/prompts';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function getCharacterResponse(character, conversationHistory, systemPromptOverride = null) {
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
        system: systemPromptOverride || getSystemPrompt(character),
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

/**
 * Call Claude API with a custom prompt
 */
async function callClaude(prompt) {
  if (!CLAUDE_API_KEY) {
    throw new Error('Claude API key not configured');
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
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw error;
  }
}

/**
 * Generate a short, fun chat title based on conversation content
 * @param {Array<string>} userMessages - First 3-4 user messages
 * @returns {Promise<string>} Generated title
 */
export async function generateChatTitle(userMessages) {
  const prompt = `Give this conversation a short, fun title (3-5 words) based on what the child talked about.

Child said:
${userMessages.join('\n')}

Examples of good titles:
- "School Day Fun"
- "Pizza Party Talk"
- "Playing with Friends"
- "Dinosaur Adventures"
- "Beach Day Story"

Return only the title, nothing else.`;

  try {
    const title = await callClaude(prompt);
    return title.replace(/['"]/g, ''); // Remove quotes if present
  } catch (error) {
    console.error('Error generating title:', error);
    return 'Conversation';
  }
}

/**
 * Extract important facts/memories from a conversation
 * @param {string} conversationText - Full conversation text
 * @param {string} childName - Child's name
 * @returns {Promise<Array<string>>} Array of extracted facts
 */
export async function extractMemories(conversationText, childName) {
  const prompt = `Extract important facts about ${childName} from this conversation.
Only include concrete, personal facts — not general statements.

Good examples:
- "Has a friend named Mia"
- "Had a math test today"
- "Likes dinosaurs"
- "Has a dog named Buddy"
- "Favorite color is blue"
- "Sister's name is Sara"

Bad examples (too vague):
- "Went to school"
- "Had fun"
- "Played outside"

Conversation:
${conversationText}

Return as a simple list, one fact per line. If no notable facts, return "NONE".`;

  try {
    const response = await callClaude(prompt);

    if (response.toUpperCase().includes('NONE')) {
      return [];
    }

    // Parse response into array of facts
    const facts = response
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^[-•*0-9.)\s]+/, '')) // Remove bullet points and numbers
      .filter((fact) => fact.length > 5); // Filter out very short lines

    return facts.slice(0, 5); // Limit to 5 facts per conversation
  } catch (error) {
    console.error('Error extracting memories:', error);
    return [];
  }
}

/**
 * Assess child's English speaking level
 * @param {Array<string>} userMessages - All user messages from conversation
 * @param {number} age - Child's age
 * @returns {Promise<string>} "needs_support" | "doing_well"
 */
export async function assessEnglishLevel(userMessages, age) {
  const prompt = `Based on this conversation with a ${age}-year-old child, assess their English speaking level FOR A CHILD THIS AGE.

Child's messages:
${userMessages.join('\n')}

NEEDS_SUPPORT:
- Very short responses (1-3 words mostly)
- Many grammar errors
- Limited vocabulary
- Struggles to express ideas
- Example: "I go school. Play. Ball."

DOING_WELL:
- Longer responses (attempts full sentences)
- Some errors but understandable
- Can tell a simple story
- Example: "I went to school and I played with my friend. We had fun!"

Remember: Even "doing well" children make mistakes — that's normal. This is relative to their age, not adult standards.

Respond with ONLY one word: NEEDS_SUPPORT or DOING_WELL`;

  try {
    const response = await callClaude(prompt);
    const level = response.toUpperCase().includes('NEEDS_SUPPORT') ? 'needs_support' : 'doing_well';
    return level;
  } catch (error) {
    console.error('Error assessing level:', error);
    return 'unknown';
  }
}

/**
 * Build conversation context with memories and level adaptation
 * @param {Object} character - Character object
 * @param {Object} profile - Profile object with english_level
 * @param {Array<Object>} memories - Array of memory objects
 * @returns {string} Enhanced system prompt
 */
export function buildConversationContext(character, profile, memories) {
  let context = getSystemPrompt(character);

  // Add memories if available
  if (memories.length > 0) {
    context += `\n\nYou remember these things about ${profile.name} from previous conversations:\n`;
    memories.forEach((memory) => {
      context += `- ${memory.fact}\n`;
    });
    context += `\nUse these naturally — don't list them, just weave them in when relevant.
For example: "Did you play with [friend's name] today?" or "Did [pet's name] do anything funny?"`;
  }

  // Add level-based adaptation
  if (profile.english_level === 'needs_support') {
    context += `\n\nThis child needs extra support with English:
- Use very simple words (1-2 syllables)
- Keep sentences short (5-7 words max)
- Ask simple yes/no or one-word-answer questions
- Give lots of encouragement
- If they struggle, offer choices: "Did you play inside or outside?"`;
  } else if (profile.english_level === 'doing_well') {
    context += `\n\nThis child is doing well with English for their age:
- You can use slightly longer sentences
- Ask open-ended questions
- Encourage them to tell more: "Wow, tell me more about that!"
- Still keep vocabulary age-appropriate`;
  }

  return context;
}

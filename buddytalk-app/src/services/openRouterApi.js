import { getSystemPrompt } from '../config/prompts';

/**
 * OpenRouter API Integration for BuddyTalk
 *
 * Models configuration:
 * - Uses ONLY FREE models to avoid Gemini rate limits
 * - Multiple fallbacks ensure reliability
 * - Optional paid upgrade available if needed
 *
 * How to switch:
 * 1. Default: FREE models only (no cost, no limits)
 * 2. Set VITE_OPENROUTER_USE_PAID=true for paid model (better quality)
 */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const USE_PAID = import.meta.env.VITE_OPENROUTER_USE_PAID === 'true';

// Model configurations
const MODELS = {
  // FREE models (in order of preference - best to fallback)
  FREE: [
    'google/gemini-2.0-flash-exp:free',       // Google Gemini Flash - Best quality free, 1M context
    'meta-llama/llama-3.3-70b-instruct:free', // Meta Llama 3.3 70B - Great for conversation
    'qwen/qwen-2.5-7b-instruct:free',         // Qwen 2.5 7B - Good balance
    'mistralai/mistral-small-3.1-24b-instruct:free', // Mistral Small - Good for conversations
  ],

  // Optional paid model (only if VITE_OPENROUTER_USE_PAID=true)
  PAID: 'google/gemini-2.0-flash-001', // $0.10 input, $0.40 output (cheap & good)
};

/**
 * Get character response using OpenRouter API
 * @param {Object} character - Character configuration
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} systemPromptOverride - Optional system prompt override
 * @returns {Promise<string>} Generated response text
 */
export async function getCharacterResponse(character, conversationHistory, systemPromptOverride = null) {
  if (!OPENROUTER_API_KEY) {
    console.warn('VITE_OPENROUTER_API_KEY not found in environment variables');
    console.log('Using fallback response for testing');
    const childLastMessage = conversationHistory[conversationHistory.length - 1]?.content || '';
    return `That's so interesting! You said "${childLastMessage}". Tell me more about that!`;
  }

  // Determine which models to try
  let modelsToTry;
  if (USE_PAID) {
    // Paid model first, then free models as fallback
    modelsToTry = [MODELS.PAID, ...MODELS.FREE];
    console.log(`💰 Using PAID mode: ${MODELS.PAID} with ${MODELS.FREE.length} free fallbacks`);
  } else {
    // Free models only (default)
    modelsToTry = MODELS.FREE;
    console.log(`🆓 Using FREE mode: ${MODELS.FREE.length} free models available`);
  }

  // Try models in order until one works
  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const isFree = MODELS.FREE.includes(model);
    const modelLabel = isFree ? '🆓 FREE' : '💰 PAID';

    try {
      console.log(`🤖 Trying ${modelLabel} model ${i + 1}/${modelsToTry.length}: ${model}`);
      return await callOpenRouter(character, conversationHistory, systemPromptOverride, model);
    } catch (error) {
      const isRateLimitError = error.message.includes('429') || error.message.includes('rate-limited');
      console.error(`❌ Model ${i + 1}/${modelsToTry.length} failed:`, error.message);

      // If rate limited and not last model, wait briefly before trying next
      if (isRateLimitError && i < modelsToTry.length - 1) {
        console.log(`⏳ Rate limited, waiting 1s before trying next model...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // If this was the last model, return fallback
      if (i === modelsToTry.length - 1) {
        console.error('❌ All OpenRouter models failed - using fallback response');
        return "Hmm, I'm having a little trouble right now. Can you tell me that again?";
      }
      // Otherwise, continue to next model
      console.log(`🔄 Trying next model...`);
    }
  }

  // Should never reach here, but just in case
  return "Hmm, I'm having a little trouble right now. Can you tell me that again?";
}

/**
 * Call OpenRouter API with specific model
 * @param {Object} character - Character configuration
 * @param {Array} conversationHistory - Conversation history
 * @param {string} systemPromptOverride - System prompt override
 * @param {string} model - Model to use
 * @returns {Promise<string>} Generated response
 */
async function callOpenRouter(character, conversationHistory, systemPromptOverride, model) {
  const systemPrompt = systemPromptOverride || getSystemPrompt(character);

  // Build OpenAI-compatible messages format
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))
  ];

  const requestBody = {
    model,
    messages,
    temperature: 0.9,
    max_tokens: 500,
    top_p: 0.95,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://buddytalk.app', // Optional: for rankings
      'X-Title': 'BuddyTalk', // Optional: for rankings
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error response:', errorText);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ OpenRouter API response:', {
    model: data.model,
    usage: data.usage,
  });

  // Extract text from response
  const generatedText = data.choices?.[0]?.message?.content;

  if (!generatedText) {
    console.error('No text in OpenRouter response:', data);
    throw new Error('No text generated by OpenRouter');
  }

  // Log usage for budget tracking
  if (data.usage) {
    console.log('💰 Token usage:', {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens,
      cost: data.usage.cost ? `$${data.usage.cost.toFixed(6)}` : 'Free',
    });
  }

  return generatedText;
}

/**
 * Check if OpenRouter API is configured
 * @returns {boolean}
 */
export function isOpenRouterConfigured() {
  return !!OPENROUTER_API_KEY;
}

/**
 * Get current model configuration
 * @returns {Object} Current model info
 */
export function getModelInfo() {
  return {
    usePaid: USE_PAID,
    models: USE_PAID ? [MODELS.PAID, ...MODELS.FREE] : MODELS.FREE,
    primaryModel: USE_PAID ? MODELS.PAID : MODELS.FREE[0],
  };
}

/**
 * Generic OpenRouter call for utility functions (with retry on rate limit)
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Max tokens for response
 * @param {number} retryCount - Current retry attempt (internal)
 * @returns {Promise<string>} Generated response
 */
async function callOpenRouterUtility(prompt, maxTokens = 200, retryCount = 0) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  // Try all free models if available
  const modelsToTry = USE_PAID ? [MODELS.PAID, ...MODELS.FREE] : MODELS.FREE;
  const model = modelsToTry[Math.min(retryCount, modelsToTry.length - 1)];

  const messages = [
    {
      role: 'user',
      content: prompt,
    }
  ];

  const requestBody = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://buddytalk.app',
        'X-Title': 'BuddyTalk',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // If rate limited and have more models to try, retry with next model
      if (response.status === 429 && retryCount < modelsToTry.length - 1) {
        console.log(`⏳ Rate limited on ${model}, trying next model...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay
        return callOpenRouterUtility(prompt, maxTokens, retryCount + 1);
      }

      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No text generated by OpenRouter');
    }

    return generatedText;
  } catch (error) {
    // If network error or other issue and have retries left, try next model
    if (retryCount < modelsToTry.length - 1) {
      console.log(`❌ Utility call failed, trying next model...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return callOpenRouterUtility(prompt, maxTokens, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Generate a fun, short title for a chat based on user messages
 * @param {Array<string>} userMessages - Array of user's messages
 * @returns {Promise<string>} Generated title (3-5 words)
 */
export async function generateChatTitle(userMessages) {
  const messagesText = userMessages.slice(0, 5).join('\n');

  const prompt = `Based on these messages from a child, create a fun, short title (3-5 words) for this conversation.

Messages:
${messagesText}

Examples of good titles:
- "Pizza Party Talk"
- "School Day Fun"
- "Dinosaur Adventures"
- "Beach Day Story"

Return only the title, nothing else.`;

  try {
    const title = await callOpenRouterUtility(prompt, 50);
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
    const response = await callOpenRouterUtility(prompt, 300);

    if (response.toUpperCase().includes('NONE')) {
      return [];
    }

    // Parse response into array of facts
    const facts = response
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim()) // Remove bullet points
      .filter(line => line.length > 0 && !line.toLowerCase().startsWith('none'));

    return facts.slice(0, 5); // Max 5 facts per conversation
  } catch (error) {
    console.error('Error extracting memories:', error);
    return [];
  }
}

/**
 * Assess child's English level based on their messages
 * @param {Array<string>} userMessages - Array of user's messages
 * @param {number} age - Child's age
 * @returns {Promise<string>} "needs_support" or "doing_well"
 */
export async function assessEnglishLevel(userMessages, age) {
  const messagesText = userMessages.join('\n');

  const prompt = `Assess this ${age}-year-old child's English level based on these messages:

${messagesText}

Consider:
- Sentence length and complexity
- Vocabulary range
- Grammar accuracy
- Age-appropriate development

Respond with ONLY one of these:
- "needs_support" (if struggling with basics, very short responses, many errors)
- "doing_well" (if age-appropriate or above)

Return only one word: needs_support OR doing_well`;

  try {
    const response = await callOpenRouterUtility(prompt, 20);
    const level = response.toLowerCase().trim();

    if (level.includes('needs_support')) {
      return 'needs_support';
    }
    return 'doing_well';
  } catch (error) {
    console.error('Error assessing English level:', error);
    return 'doing_well'; // Default to positive
  }
}

/**
 * Build enhanced conversation context with memories and level adaptation
 * @param {Object} character - Character configuration
 * @param {Object} profile - User profile with english_level
 * @param {Array<string>} memories - Array of remembered facts
 * @returns {string} Enhanced system prompt
 */
export function buildConversationContext(character, profile, memories) {
  let enhancedPrompt = getSystemPrompt(character);

  // Add child's basic info
  enhancedPrompt += `\n\nYou are talking to ${profile.name}, who is ${profile.age} years old.`;

  // Add memories if available
  if (memories && memories.length > 0) {
    enhancedPrompt += `\n\nThings you remember about ${profile.name} from previous conversations:\n`;
    memories.forEach(fact => {
      enhancedPrompt += `- ${fact}\n`;
    });
    enhancedPrompt += `\nNaturally reference these facts when relevant in conversation.`;
  }

  // Add level-specific instructions
  if (profile.english_level === 'needs_support') {
    enhancedPrompt += `\n\n${profile.name} is still learning English. Please:
- Use simple, common words
- Keep sentences short and clear
- Ask yes/no questions more often
- Repeat key words to help them learn
- Be extra encouraging and patient`;
  } else if (profile.english_level === 'doing_well') {
    enhancedPrompt += `\n\n${profile.name} is doing well with English. Feel free to:
- Use varied vocabulary
- Ask open-ended questions
- Encourage them to elaborate
- Introduce new words naturally`;
  }

  return enhancedPrompt;
}

/**
 * Analyze conversation to extract practice moments (grammar errors that were recasted)
 * @param {string} conversationText - Full conversation text
 * @returns {Promise<Array>} Array of practice moments: [{error_type, original, corrected}]
 */
export async function analyzePracticeMoments(conversationText) {
  const prompt = `Analyze this conversation between a character and a child learning English.

Identify each grammar error the child made that was recasted by the character.

For each error, provide:
- error_type: one of PAST_TENSE, PRESENT_TENSE, PLURAL, ARTICLE, OTHER
- original: what the child said (the incorrect part only)
- corrected: the correct form

Examples:
- "I goed" → {error_type: "PAST_TENSE", original: "goed", corrected: "went"}
- "two cat" → {error_type: "PLURAL", original: "cat", corrected: "cats"}
- "played with ball" → {error_type: "ARTICLE", original: "ball", corrected: "a ball"}
- "she have" → {error_type: "PRESENT_TENSE", original: "have", corrected: "has"}

Conversation:
${conversationText}

Return as JSON array:
[
  {"error_type": "PAST_TENSE", "original": "goed", "corrected": "went"},
  {"error_type": "PLURAL", "original": "cat", "corrected": "cats"}
]

If no errors were made, return: []`;

  try {
    const response = await callOpenRouterUtility(prompt, 500);

    // Try to parse as JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    }

    return [];
  } catch (error) {
    console.error('Error analyzing practice moments:', error);
    return [];
  }
}

/**
 * Check conversation for any concerns parents should know about
 * @param {string} conversationText - Full conversation text
 * @param {string} childName - Child's name
 * @returns {Promise<Object>} {has_concern: boolean, summary: string|null}
 */
export async function checkForConcerns(conversationText, childName) {
  const prompt = `Review this conversation between a character and ${childName}.

Flag anything a parent might want to know about — not to punish the child, but to support them.

Look for mentions of:
- Feeling sad, scared, worried, lonely, or anxious
- Problems with friends or siblings
- Being treated badly or bullied
- Something unusual that might need a parent's attention

Be careful: normal kid stuff is NOT a concern. "I don't like vegetables" or "my brother is annoying" are normal.

Only flag genuine emotional moments that a parent would appreciate knowing about.

Conversation:
${conversationText}

Respond in JSON:
{
  "has_concern": true/false,
  "summary": "Brief, warm note for parent (or null if no concern)"
}

Example good summary: "${childName} mentioned feeling nervous about a test tomorrow."
Example of what NOT to flag: "${childName} said she doesn't like broccoli."`;

  try {
    const response = await callOpenRouterUtility(prompt, 200);

    // Try to parse as JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        has_concern: parsed.has_concern || false,
        summary: parsed.summary || null,
      };
    }

    return { has_concern: false, summary: null };
  } catch (error) {
    console.error('Error checking for concerns:', error);
    return { has_concern: false, summary: null };
  }
}

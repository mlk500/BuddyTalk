/**
 * Vercel Serverless Function: OpenRouter Chat Proxy
 *
 * This function proxies requests to OpenRouter API to keep the API key secure.
 * The API key is stored in Vercel environment variables, not exposed to the browser.
 *
 * Environment Variables Required:
 * - OPENROUTER_API_KEY: Your OpenRouter API key
 * - OPENROUTER_USE_PAID: (Optional) Set to 'true' to use paid models
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const usePaid = process.env.OPENROUTER_USE_PAID === 'true';

  if (!openRouterApiKey) {
    console.error('OPENROUTER_API_KEY not configured in environment variables');
    return res.status(500).json({ error: 'OpenRouter API key not configured' });
  }

  try {
    const { model, messages, temperature = 0.9, max_tokens = 500, top_p = 0.95 } = req.body;

    if (!model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing required fields: model and messages array' });
    }

    console.log('🤖 OpenRouter chat request:', {
      model,
      messagesCount: messages.length,
      usePaid
    });

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'https://buddytalk.app',
        'X-Title': 'BuddyTalk',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `OpenRouter API error: ${errorText}`
      });
    }

    const data = await response.json();

    console.log('✅ OpenRouter chat complete:', {
      model: data.model,
      usage: data.usage,
    });

    // Log usage for cost tracking
    if (data.usage) {
      console.log('💰 Token usage:', {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens,
        cost: data.usage.cost ? `$${data.usage.cost.toFixed(6)}` : 'Free',
      });
    }

    // Return the full response (frontend will extract the message)
    res.status(200).json(data);

  } catch (error) {
    console.error('❌ OpenRouter proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

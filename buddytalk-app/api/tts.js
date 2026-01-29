/**
 * Vercel Serverless Function: Fish Audio TTS Proxy
 *
 * This function proxies requests to Fish Audio API to keep the API key secure.
 * The API key is stored in Vercel environment variables, not exposed to the browser.
 *
 * Environment Variables Required:
 * - FISH_AUDIO_API_KEY: Your Fish Audio API key
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fishApiKey = process.env.FISH_AUDIO_API_KEY;

  if (!fishApiKey) {
    console.error('FISH_AUDIO_API_KEY not configured in environment variables');
    return res.status(500).json({ error: 'Fish Audio API key not configured' });
  }

  try {
    const { text, reference_id, format = 'mp3', mp3_bitrate = 128, latency = 'balanced', normalize = false, chunk_length = 200, temperature = 0.7, top_p = 0.7 } = req.body;

    if (!text || !reference_id) {
      return res.status(400).json({ error: 'Missing required fields: text and reference_id' });
    }

    // Get model from query params (default to s1)
    const model = req.query.model || 's1';

    console.log('🎤 Fish Audio TTS request:', {
      textLength: text.length,
      reference_id,
      model
    });

    // Call Fish Audio API
    const response = await fetch(`https://api.fish.audio/v1/tts?model=${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fishApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        reference_id,
        format,
        mp3_bitrate,
        latency,
        normalize,
        chunk_length,
        temperature,
        top_p,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fish Audio API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Fish Audio API error: ${errorText}`
      });
    }

    // Get audio data as buffer
    const audioBuffer = await response.arrayBuffer();

    console.log('✅ Fish Audio TTS complete:', audioBuffer.byteLength, 'bytes');

    // Return audio with correct content type
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('❌ Fish Audio proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * Fish Audio TTS API Service
 * Handles text-to-speech generation using Fish Audio API
 *
 * Two modes:
 * 1. Local mode (with backend): Uses backend proxy at /api/fish-audio/tts
 * 2. Deployed mode (Vercel): Uses Vercel serverless function at /api/tts
 */

const FISH_AUDIO_API_KEY = import.meta.env.VITE_FISH_AUDIO_API_KEY;
const IS_DEPLOYED = import.meta.env.VITE_ENABLE_LIPSYNC === 'false';

// Use Vercel function when deployed, backend proxy when local
const PROXY_BASE_URL = IS_DEPLOYED ? '/api' : '/api/fish-audio';

/**
 * Generate speech from text using Fish Audio TTS
 * @param {string} text - Text to convert to speech
 * @param {Object} options - Optional configuration
 * @param {string} options.modelId - Voice model ID (REQUIRED - pass character's Fish Audio model ID)
 * @param {string} options.emotion - Emotion tag like '(happy)' or '(excited)'
 * @returns {Promise<Blob>} - Audio blob (MP3 format)
 */
export async function generateSpeech(text, options = {}) {
  const { modelId, emotion = null } = options;

  // In deployed mode, API key is not needed (handled by Vercel function)
  if (!IS_DEPLOYED && !FISH_AUDIO_API_KEY) {
    throw new Error('Fish Audio API key not configured. Please add VITE_FISH_AUDIO_API_KEY to .env');
  }

  if (!modelId) {
    throw new Error('Fish Audio model ID is required. Pass the character\'s fishAudio.modelId from character config.');
  }

  try {
    // Process text to handle emphasis and add emotion tags
    let processedText = text;

    // Remove asterisks used for emphasis (Fish Audio doesn't support them)
    // e.g., "You *went* to school" -> "You went to school"
    processedText = processedText.replace(/\*([^*]+)\*/g, '$1');

    // Remove ALL CAPS emphasis (causes unnatural reading)
    // e.g., "You WENT to school" -> "You went to school"
    processedText = processedText.replace(/\b([A-Z]{2,})\b/g, (match) => {
      return match.charAt(0) + match.slice(1).toLowerCase();
    });

    // Add emotion tag to text if provided
    const finalText = emotion ? `${emotion} ${processedText}` : processedText;

    console.log('🎤 Generating speech with Fish Audio:', {
      original: text,
      processed: finalText,
      modelId,
      mode: IS_DEPLOYED ? 'Vercel (deployed)' : 'Local backend'
    });

    // Build request headers based on mode
    const headers = {
      'Content-Type': 'application/json',
    };

    // Only add API key header for local mode (backend proxy expects it)
    if (!IS_DEPLOYED) {
      headers['X-Fish-Audio-Key'] = FISH_AUDIO_API_KEY;
    }

    const response = await fetch(`${PROXY_BASE_URL}/tts?model=s1`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: finalText,
        reference_id: modelId,
        // Optimized settings for cost and quality
        format: 'mp3',
        mp3_bitrate: 128, // Good quality, reasonable size
        latency: 'balanced', // Good balance between quality and speed
        normalize: false, // Disable to preserve emotion/control tags
        chunk_length: 200, // Smaller chunks for faster response
        temperature: 0.7,
        top_p: 0.7,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Fish Audio API error: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch (e) {
        // Response might not be JSON
      }
      throw new Error(errorMessage);
    }

    // Return audio blob (MP3 format)
    const audioBlob = await response.blob();
    console.log('✅ Fish Audio generation complete:', audioBlob.size, 'bytes');
    return audioBlob;
  } catch (error) {
    console.error('❌ Error generating speech with Fish Audio:', error);
    throw error;
  }
}

/**
 * Check if Fish Audio is properly configured
 * @param {string} modelId - Character's Fish Audio model ID
 * @returns {boolean}
 */
export function isFishAudioConfigured(modelId) {
  return !!FISH_AUDIO_API_KEY && !!modelId;
}

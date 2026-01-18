/**
 * Wav2Lip API Service
 * Handles communication with the Python backend for lip-sync video generation
 */

const API_BASE_URL = import.meta.env.VITE_WAV2LIP_API_URL || 'http://localhost:8000';

/**
 * Get list of available characters
 * @returns {Promise<Object>} - Character configurations
 */
export async function getCharacters() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/characters`);
    if (!response.ok) {
      throw new Error('Failed to fetch characters');
    }
    const data = await response.json();
    return data.characters;
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
}

/**
 * Generate a lip-synced video for a character with audio
 * @param {string} characterId - Character ID (e.g., 'elsa')
 * @param {File|Blob} audioFile - Input audio file or Blob from recording
 * @returns {Promise<{videoUrl: string, sessionId: string}>}
 */
export async function generateLipSyncVideo(characterId, audioFile) {
  const formData = new FormData();
  formData.append('character_id', characterId);
  formData.append('audio', audioFile, 'audio.wav');

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-lipsync`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate lip-sync video');
    }

    // Get session ID from headers (for potential cleanup later)
    const sessionId = response.headers.get('X-Session-ID');

    // Convert response to blob and create URL
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);

    return { videoUrl, sessionId };
  } catch (error) {
    console.error('Error generating lip-sync video:', error);
    throw error;
  }
}

/**
 * Check if the Wav2Lip backend is healthy
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

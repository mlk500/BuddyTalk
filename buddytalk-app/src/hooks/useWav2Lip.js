import { useState, useCallback, useEffect } from 'react';
import { generateLipSyncVideo, checkBackendHealth } from '../services/wav2lipApi';

/**
 * Hook for Wav2Lip lip-sync video generation
 */
export function useWav2Lip() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendAvailable);
  }, []);

  /**
   * Generate a lip-synced video for a character
   * @param {string} characterId - Character ID (e.g., 'elsa')
   * @param {File|Blob} audioFile - Input audio file or blob
   */
  const generate = useCallback(async (characterId, audioFile) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateLipSyncVideo(characterId, audioFile);
      setVideoUrl(result.videoUrl);
      setSessionId(result.sessionId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Clean up the current video
   */
  const cleanup = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setSessionId(null);
  }, [videoUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return {
    generate,
    cleanup,
    isGenerating,
    error,
    videoUrl,
    backendAvailable,
  };
}

/**
 * Character configuration
 * Dynamically imported from wav2lip-backend/characters/characters.json
 *
 * Asset paths:
 * - Local mode: Serves some assets from backend (/api/characters/*)
 * - Deployed mode: All assets served from /public/assets/
 */
import backendCharactersData from '../../../wav2lip-backend/characters/characters.json';

const IS_DEPLOYED = import.meta.env.VITE_ENABLE_LIPSYNC === 'false';

// Transform backend data to frontend format
export const characters = Object.entries(backendCharactersData).map(([id, char]) => {
  // For deployed mode, use static assets from public folder
  // For local mode, use backend API for character-specific assets
  const idleAnimationUrl = IS_DEPLOYED
    ? `/assets/${id}-idle.gif`
    : `/api/characters/${id}/idle`;

  return {
    id,
    name: char.name,
    emoji: char.emoji,
    available: char.available,
    image: char.card_image ? `/assets/${char.card_image}` : null,
    expressions: {
      neutral: char.card_image ? `/assets/${char.card_image}` : null,
      talking: char.card_image ? `/assets/${char.card_image}` : null,
      happy: char.card_image ? `/assets/${char.card_image}` : null,
    },
    fishAudio: {
      modelId: char.fish_audio_model_id,
    },
    assets: {
      cardImage: char.card_image ? `/assets/${char.card_image}` : null,
      lipSyncImage: char.media_file,
      idleAnimation: idleAnimationUrl,
      prerecordedGoodbye: char.available ? {
        audio: `/prerecorded/${id}/${id}-bye.mp3`,
        video: `/prerecorded/${id}/${id}-goodbye.mp4`,
      } : null,
    },
    voiceConfig: {
      pitch: char.voice_pitch || 1.0,
      rate: char.voice_rate || 1.0,
    },
    personality: char.personality,
    greeting: char.greeting,
  };
});

// Helper to get character by ID
export function getCharacterById(id) {
  return characters.find(char => char.id === id);
}

// Helper to get only available characters
export function getAvailableCharacters() {
  return characters.filter(char => char.available);
}

// Helper to get character's Fish Audio model ID
export function getFishAudioModelId(characterId) {
  const character = getCharacterById(characterId);
  return character?.fishAudio?.modelId || null;
}

/**
 * Character configuration
 * Import from root characters.json for centralized config
 */
import charactersData from '../../../characters.json';

// Transform the data to add legacy fields for backward compatibility
export const characters = charactersData.characters.map(char => ({
  ...char,
  // Add backward-compatible fields
  image: char.assets.cardImage,
  expressions: {
    neutral: char.assets.cardImage,
    talking: char.assets.cardImage,
    happy: char.assets.cardImage,
  },
}));

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

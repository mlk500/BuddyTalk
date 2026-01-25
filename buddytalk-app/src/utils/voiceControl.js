// Global voice control utility
let isGlobalMuted = false;

export function setGlobalMute(muted) {
  isGlobalMuted = muted;
  if (muted) {
    // Stop any currently playing speech
    window.speechSynthesis.cancel();
  }
}

export function isVoiceMuted() {
  return isGlobalMuted;
}

export function speak(text, options = {}) {
  if (isGlobalMuted) {
    console.log('Voice muted, skipping:', text);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'en-US';
  utterance.pitch = options.pitch || 1.2;
  utterance.rate = options.rate || 0.9;

  const voices = window.speechSynthesis.getVoices();
  const friendlyVoice = voices.find((v) => v.lang.startsWith('en') && v.name.includes('Female'));
  if (friendlyVoice) {
    utterance.voice = friendlyVoice;
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
}

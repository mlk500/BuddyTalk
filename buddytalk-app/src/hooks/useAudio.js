import { useState, useEffect, useCallback, useRef } from 'react';

export default function useAudio(voiceConfig = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const onSpeechResultCallbackRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += chunk;
        } else {
          interimText += chunk;
        }
      }

      const fullTranscript = (finalText + ' ' + interimText).trim();
      setTranscript(fullTranscript);

      if (finalText && onSpeechResultCallbackRef.current) {
        // Wait 800ms after final result to catch stuttering/incomplete sentences
        setTimeout(() => {
          onSpeechResultCallbackRef.current(finalText);
        }, 800);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);

      // Auto-retry on no-speech error (common when user hasn't spoken yet)
      if (e.error === 'no-speech') {
        console.log('No speech detected, will retry...');
        setIsListening(false);
        // Don't set error for no-speech, just quietly retry
      } else {
        setError(`Speech recognition error: ${e.error}`);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Ensure voices are loaded (Chrome needs this)
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      console.log('📢 Voices loaded:', availableVoices.length);
    };

    // Load voices immediately
    loadVoices();

    // Also listen for voice list changes (Chrome needs this)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Force reload after a delay (Chrome workaround)
    const timer = setTimeout(() => {
      loadVoices();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setTranscript('');
      recognitionRef.current.start();
    } catch (err) {
      setError('Microphone permission denied');
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Register callback for when speech is recognized
  const onSpeechResult = useCallback((callback) => {
    onSpeechResultCallbackRef.current = callback;
  }, []);

  // Speak text using TTS and optionally provide audio blob
  const speak = useCallback(
    (text, onComplete, onAudioReady) => {
      console.log('🔊 Attempting to speak:', text);

      if (!('speechSynthesis' in window)) {
        const error = 'Text-to-speech not supported in this browser';
        console.error('❌', error);
        setError(error);
        return;
      }

      if (!text || text.trim().length === 0) {
        console.warn('⚠️ No text to speak');
        return;
      }

      // Don't cancel if nothing is speaking (prevents race condition)
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        console.log('⏹️ Canceling previous speech');
        window.speechSynthesis.cancel();
      }

      // Wait longer for any cancel to complete and browser to be ready
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = voiceConfig.pitch || 1.0;
        utterance.rate = voiceConfig.rate || 1.0;

        // Get FRESH voice list (not from state, which might be stale)
        const freshVoices = window.speechSynthesis.getVoices();
        console.log('🎤 Available voices (FRESH):', freshVoices.length);
        console.log('🎤 Voice config:', { pitch: utterance.pitch, rate: utterance.rate });

        // Try to find an English voice
        const englishVoices = freshVoices.filter((v) =>
          (v.lang || '').toLowerCase().startsWith('en')
        );

        console.log('🎤 English voices found:', englishVoices.length);

        // Use first available English voice, or system default
        const selectedVoice = englishVoices[0] || freshVoices[0];

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('🎤 Using voice:', selectedVoice.name, selectedVoice.lang);
        } else {
          console.warn('⚠️ No voices available, using system default');
        }

        utterance.onstart = () => {
          console.log('✅ TTS started');
          console.log('🔊 Audio should be playing now. Check your Mac volume!');
          setIsSpeaking(true);
          setError(null); // Clear any previous errors
        };

        utterance.onend = () => {
          console.log('✅ TTS ended normally');
          setIsSpeaking(false);
          if (onComplete) onComplete();
        };

        utterance.onpause = () => {
          console.log('⏸️ TTS paused');
        };

        utterance.onresume = () => {
          console.log('▶️ TTS resumed');
        };

        utterance.onerror = (event) => {
          console.error('❌ TTS error event:', event);
          console.error('❌ Error type:', event.error);
          console.error('❌ Error message:', event.message);

          // Don't set speaking to false or show error if it's just "interrupted"
          // (this happens when speech is cancelled, which is normal)
          if (event.error !== 'interrupted' && event.error !== 'cancelled') {
            setIsSpeaking(false);
            setError(`TTS error: ${event.error || 'unknown'}`);
          } else {
            console.log('ℹ️ Speech was interrupted/cancelled (this is normal)');
            setIsSpeaking(false);
          }

          // Still call onComplete to continue conversation flow
          if (onComplete) {
            console.log('Calling onComplete despite error');
            onComplete();
          }
        };

        console.log('🎤 Starting speech synthesis...');

        // Resume in case it's paused (macOS sometimes needs this)
        window.speechSynthesis.resume();

        window.speechSynthesis.speak(utterance);

        // Force resume again after a small delay (macOS workaround)
        setTimeout(() => {
          window.speechSynthesis.resume();
        }, 50);
      }, 250);
    },
    [voiceConfig]
  );

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    onSpeechResult,
    speak,
    stopSpeaking,
  };
}

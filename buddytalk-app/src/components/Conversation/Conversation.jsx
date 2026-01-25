import { useEffect, useCallback, useState, useRef } from 'react';
import { colors } from '../../styles/theme';
import useAudio from '../../hooks/useAudio';
import useConversationWithDB from '../../hooks/useConversationWithDB';
import { getCharacterResponse, buildConversationContext, analyzePracticeMoments, checkForConcerns } from '../../services/openRouterApi';
import { generateSpeech, isFishAudioConfigured } from '../../services/fishAudioApi';
import { generateLipSyncVideo } from '../../services/wav2lipApi';
import { createSession, endSession, savePracticeMoment, saveConcern } from '../../services/database';
import Avatar from './Avatar';
import Controls from './Controls';
import StartPrompt from './StartPrompt';

export default function Conversation({ character, profile, chat, onExit }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [lipSyncVideoUrl, setLipSyncVideoUrl] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const currentAudioRef = useRef(null);
  const isExitingRef = useRef(false); // Prevent double-click on exit

  const { status, messages, setStatus, addMessage, memories, extractAndSaveMemories } =
    useConversationWithDB(character, profile, chat);
  const audio = useAudio(character.voiceConfig);

  // Cleanup video URL when unmounting
  useEffect(() => {
    return () => {
      if (lipSyncVideoUrl) {
        URL.revokeObjectURL(lipSyncVideoUrl);
      }
    };
  }, [lipSyncVideoUrl]);

  // Generate speech and lip-sync video
  const speakWithLipSync = useCallback(
    async (text) => {
      try {
        setIsGeneratingVideo(true);

        // Generate speech with Fish Audio
        console.log('🎤 Generating speech with Fish Audio TTS...');
        const audioBlob = await generateSpeech(text, { modelId: character.fishAudio?.modelId });

        // Generate lip-sync video with Wav2Lip
        console.log('🎬 Generating lip-sync video with Wav2Lip...');
        const { videoUrl } = await generateLipSyncVideo(character.id, audioBlob);

        // Set video URL to display
        setLipSyncVideoUrl(videoUrl);
        setIsGeneratingVideo(false);

        // Create audio from blob and play it
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = new Audio(audioUrl);
        currentAudioRef.current = audioElement;

        audioElement.onplay = () => {
          setStatus('speaking');
        };

        audioElement.onended = () => {
          console.log('Audio playback ended');
          setStatus('idle');
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          // Clear video immediately when speech ends
          setLipSyncVideoUrl(null);
        };

        audioElement.onerror = (e) => {
          console.error('Audio playback error:', e);
          setStatus('idle');
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        if (!isMuted) {
          await audioElement.play();
        } else {
          setStatus('idle');
          setLipSyncVideoUrl(null);
        }
      } catch (error) {
        console.error('Error in speakWithLipSync:', error);
        setIsGeneratingVideo(false);
        setStatus('idle');
        // Fallback to browser TTS if Fish Audio fails
        audio.speak(text, () => setStatus('idle'));
      }
    },
    [character.id, audio, setStatus]
  );

  // Check if message contains goodbye words
  const isGoodbye = useCallback((message) => {
    const byeWords = ['bye', 'goodbye', 'see you', 'gotta go', 'have to go', 'i have to go', 'got to go'];
    const lower = message.toLowerCase();
    return byeWords.some(word => lower.includes(word));
  }, []);

  // Handle conversation end - analyze practice moments and concerns
  const handleConversationEnd = useCallback(async () => {
    try {
      // Extract and save memories
      await extractAndSaveMemories();

      // Analyze conversation for practice moments and concerns
      if (messages.length > 0) {
        console.log('📊 Analyzing conversation for practice moments and concerns...');

        // Build full conversation text
        const conversationText = messages
          .map((m) => `${m.role === 'user' ? profile.name : character.name}: ${m.content}`)
          .join('\n');

        // Analyze practice moments (grammar errors)
        try {
          const practiceMoments = await analyzePracticeMoments(conversationText);
          if (practiceMoments.length > 0) {
            console.log(`✅ Found ${practiceMoments.length} practice moments`);
            for (const moment of practiceMoments) {
              await savePracticeMoment(
                profile.id,
                chat.id,
                moment.error_type,
                moment.original,
                moment.corrected
              );
            }
          }
        } catch (error) {
          console.error('Error analyzing practice moments:', error);
        }

        // Check for concerns
        try {
          const { has_concern, summary } = await checkForConcerns(conversationText, profile.name);
          if (has_concern && summary) {
            console.log('⚠️ Found concern:', summary);
            await saveConcern(profile.id, chat.id, summary);
          }
        } catch (error) {
          console.error('Error checking for concerns:', error);
        }
      }

      // End session
      if (sessionId) {
        await endSession(sessionId);
        console.log('✅ Session ended:', sessionId);
      }
    } catch (error) {
      console.error('Error handling conversation end:', error);
    }
  }, [messages, profile, character, chat, sessionId, extractAndSaveMemories]);

  // Handle speech result from child
  const handleChildSpeech = useCallback(
    async (childText) => {
      // Prevent duplicate responses - check if already processing
      if (status === 'processing' || status === 'speaking' || isGeneratingVideo) {
        console.log('⏸️ Already processing/speaking, ignoring duplicate speech input');
        return;
      }

      console.log('Child said:', childText);

      // IMMEDIATELY stop listening to prevent recording Elsa's voice
      audio.stopListening();

      // Detect if child is saying goodbye
      const childSaidGoodbye = isGoodbye(childText);

      try {
        await addMessage('user', childText);
      } catch (error) {
        console.error('Error saving user message:', error);
        // Continue anyway - don't block conversation
      }

      setStatus('processing');

      try {
        // Build enhanced context with memories and level adaptation
        const enhancedPrompt = buildConversationContext(character, profile, memories);

        // Use OpenRouter API (with multiple free model fallbacks)
        const response = await getCharacterResponse(
          character,
          [...messages, { role: 'user', content: childText }],
          enhancedPrompt
        );
        console.log('Character response:', response);

        try {
          await addMessage('assistant', response);
        } catch (error) {
          console.error('Error saving assistant message:', error);
          // Continue anyway - don't block conversation
        }

        // Use Fish Audio + Wav2Lip if configured, otherwise fallback to browser TTS
        if (isFishAudioConfigured(character.fishAudio?.modelId)) {
          await speakWithLipSync(response);
        } else {
          setStatus('speaking');
          audio.speak(response, () => {
            setStatus('idle');
          });
        }

        // If child said goodbye, end conversation after TTS finishes
        if (childSaidGoodbye) {
          console.log('👋 Child said goodbye, ending conversation after TTS...');
          // Wait for TTS to finish (already awaited above)
          await handleConversationEnd();
          setTimeout(onExit, 1500); // Navigate after a short delay
        }
      } catch (error) {
        console.error('Error getting character response:', error);
        setStatus('idle');
      }
    },
    [character, profile, messages, memories, addMessage, setStatus, audio, onExit, speakWithLipSync, handleConversationEnd, isGoodbye, status, isGeneratingVideo]
  );

  // Stop audio when muting
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (newMuted && currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        setStatus('idle');
        setLipSyncVideoUrl(null);
      }
      return newMuted;
    });
  }, [setStatus]);

  // Register speech result callback
  useEffect(() => {
    audio.onSpeechResult(handleChildSpeech);
  }, [audio, handleChildSpeech]);

  // Start with greeting when conversation starts (only after user clicks start)
  useEffect(() => {
    if (!hasStarted) return;

    const greet = async () => {
      // Only greet if this is a new conversation (no messages yet)
      if (messages.length > 0) {
        setStatus('idle');
        return;
      }

      const greeting = character.greeting;
      addMessage('assistant', greeting);

      // Try to use cached greeting audio and video first
      try {
        const greetingAudioUrl = `/api/characters/${character.id}/greeting-audio`;
        const greetingVideoUrl = `/api/characters/${character.id}/greeting-video`;

        const [audioResponse, videoResponse] = await Promise.all([
          fetch(greetingAudioUrl),
          fetch(greetingVideoUrl)
        ]);

        if (audioResponse.ok && videoResponse.ok) {
          console.log('✅ Using cached greeting audio and video');
          const audioBlob = await audioResponse.blob();
          const videoBlob = await videoResponse.blob();

          // Use cached video URL
          const cachedVideoUrl = URL.createObjectURL(videoBlob);
          setLipSyncVideoUrl(cachedVideoUrl);

          // Play cached audio
          const audioUrl = URL.createObjectURL(audioBlob);
          const audioElement = new Audio(audioUrl);
          currentAudioRef.current = audioElement; // Track greeting audio

          audioElement.onplay = () => setStatus('speaking');
          audioElement.onended = () => {
            setStatus('idle');
            URL.revokeObjectURL(audioUrl);
            setLipSyncVideoUrl(null);
            currentAudioRef.current = null;
          };

          await audioElement.play();
        } else {
          throw new Error('Cached greeting not available');
        }
      } catch (error) {
        console.log('Cached greeting not available, generating new:', error);
        // Fallback to generating new greeting
        if (isFishAudioConfigured(character.fishAudio?.modelId)) {
          await speakWithLipSync(greeting);
        } else {
          setStatus('speaking');
          audio.speak(greeting, () => {
            setStatus('idle');
          });
        }
      }
    };

    // Wait 1 second for voices to load before greeting
    const timer = setTimeout(() => {
      greet();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, messages.length]);

  // Auto-start listening when idle (but not when speaking or generating)
  useEffect(() => {
    // Only start listening if:
    // 1. Status is idle (not processing or speaking)
    // 2. Not already listening
    // 3. Not currently speaking with browser TTS
    // 4. No video is playing (Fish Audio)
    // 5. Not generating video
    if (status === 'idle' && !audio.isListening && !audio.isSpeaking && !lipSyncVideoUrl && !isGeneratingVideo) {
      const timer = setTimeout(() => {
        setStatus('listening');
        audio.startListening();
      }, 1500); // Increased delay to 1.5s to allow child to finish speaking
      return () => clearTimeout(timer);
    }
  }, [status, audio, setStatus, lipSyncVideoUrl, isGeneratingVideo]);

  // CRITICAL: Stop listening when speaking or generating
  useEffect(() => {
    if ((status === 'speaking' || status === 'processing' || isGeneratingVideo) && audio.isListening) {
      console.log('🔇 Stopping microphone - Elsa is speaking/generating');
      audio.stopListening();
    }
  }, [status, isGeneratingVideo, audio]);

  // Handle exit button click - instant goodbye with pre-saved audio/video
  const handleExitClick = useCallback(async () => {
    // Prevent double-clicking
    if (isExitingRef.current) {
      console.log('⏸️ Already exiting, ignoring click...');
      return;
    }
    isExitingRef.current = true;

    console.log('🚪 Exit button clicked, saying instant goodbye...');

    // IMMEDIATELY stop everything
    audio.stopListening();

    // Stop any playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();

    // Clear any ongoing video
    setLipSyncVideoUrl(null);
    setIsGeneratingVideo(false);

    try {
      const goodbyeMessage = `Bye! It was so fun talking to you! Come back soon!`;

      // Save messages to database (don't await - let it happen in background)
      addMessage('user', '[CHILD IS LEAVING NOW]');
      addMessage('assistant', goodbyeMessage);

      // Try to use pre-saved goodbye audio + video
      if (!isMuted) {
        try {
          const goodbyeAudioPath = `/prerecorded/${character.id}/${character.id}-bye.mp3`;
          const goodbyeVideoPath = `/prerecorded/${character.id}/${character.id}-goodbye.mp4`;

          console.log('🎤 Using pre-saved goodbye audio and video...');

          // Load pre-saved video and audio
          const [audioResponse, videoResponse] = await Promise.all([
            fetch(goodbyeAudioPath),
            fetch(goodbyeVideoPath)
          ]);

          if (audioResponse.ok && videoResponse.ok) {
            const audioBlob = await audioResponse.blob();
            const videoBlob = await videoResponse.blob();

            // Set video URL
            const videoUrl = URL.createObjectURL(videoBlob);
            setLipSyncVideoUrl(videoUrl);
            setStatus('speaking');

            // Play audio
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioElement = new Audio(audioUrl);
            currentAudioRef.current = audioElement;

            // Wait for audio to finish
            await new Promise((resolve, reject) => {
              audioElement.onended = resolve;
              audioElement.onerror = reject;
              audioElement.play().catch(reject);
            });

            console.log('✅ Pre-saved goodbye played');
          } else {
            console.warn('⚠️ Pre-saved goodbye not found, using TTS fallback');
            // Fallback to regular TTS (but don't generate video)
            setStatus('speaking');
            await new Promise((resolve) => {
              audio.speak(goodbyeMessage, () => {
                setStatus('idle');
                resolve();
              });
            });
          }
        } catch (error) {
          console.error('Error playing pre-saved goodbye:', error);
          // Fallback to browser TTS
          setStatus('speaking');
          await new Promise((resolve) => {
            audio.speak(goodbyeMessage, () => {
              setStatus('idle');
              resolve();
            });
          });
        }
      }

      // End conversation and exit (don't wait for handleConversationEnd)
      handleConversationEnd(); // Run in background
      setTimeout(onExit, 100); // Exit almost immediately
    } catch (error) {
      console.error('Error handling exit:', error);
      // If error, still exit gracefully
      handleConversationEnd();
      onExit();
    }
  }, [character, audio, addMessage, setStatus, onExit, handleConversationEnd, isMuted, setLipSyncVideoUrl, setIsGeneratingVideo]);

  // Handle start button click - create session
  const handleStart = async () => {
    setHasStarted(true);
    try {
      const session = await createSession(profile.id, chat.id);
      setSessionId(session.id);
      console.log('✅ Session started:', session.id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  // Show start prompt until user clicks to begin
  if (!hasStarted) {
    return <StartPrompt characterName={character.name} onStart={handleStart} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background,
        padding: '40px 20px',
        position: 'relative',
      }}
    >
      <Controls
        isListening={audio.isListening}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onExit={handleExitClick}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        <Avatar
          character={character}
          expression={audio.isSpeaking ? 'talking' : 'neutral'}
          isSpeaking={audio.isSpeaking}
          status={status}
          videoUrl={lipSyncVideoUrl}
        />

        {/* Status indicator for debugging */}
        <div
          style={{
            padding: '15px 30px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            fontSize: '18px',
            fontWeight: 'bold',
            color: colors.primary,
            opacity: 0.8,
          }}
        >
          {status === 'listening' && '🎤 Listening...'}
          {status === 'processing' && (isGeneratingVideo ? '🎬 Generating video...' : '💭 Thinking...')}
          {status === 'speaking' && '💬 Speaking...'}
          {status === 'idle' && '👂 Ready'}
        </div>

        {/* Show transcript for debugging */}
        {audio.transcript && (
          <div
            style={{
              padding: '20px',
              backgroundColor: colors.childSpeech,
              borderRadius: '20px',
              maxWidth: '80%',
              fontSize: '16px',
            }}
          >
            {audio.transcript}
          </div>
        )}

        {audio.error && (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#fee',
              borderRadius: '20px',
              color: '#c00',
              fontSize: '14px',
            }}
          >
            {audio.error}
          </div>
        )}
      </div>
    </div>
  );
}

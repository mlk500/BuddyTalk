import { useEffect, useCallback, useState } from 'react';
import { colors } from '../../styles/theme';
import useAudio from '../../hooks/useAudio';
import useConversation from '../../hooks/useConversation';
import { getCharacterResponse } from '../../services/geminiApi';
import Avatar from './Avatar';
import Controls from './Controls';
import StartPrompt from './StartPrompt';

export default function Conversation({ character, onExit }) {
  const [hasStarted, setHasStarted] = useState(false);
  const { status, messages, setStatus, addMessage } = useConversation(character);
  const audio = useAudio(character.voiceConfig);

  // Handle speech result from child
  const handleChildSpeech = useCallback(
    async (childText) => {
      console.log('Child said:', childText);

      // Check if child wants to exit
      if (childText.toLowerCase().includes('bye')) {
        audio.speak("Bye! It was so nice talking to you!", () => {
          setTimeout(onExit, 1000);
        });
        return;
      }

      addMessage('user', childText);
      setStatus('processing');

      try {
        const response = await getCharacterResponse(character, [...messages, { role: 'user', content: childText }]);
        console.log('Character response:', response);

        addMessage('assistant', response);
        setStatus('speaking');

        audio.speak(response, () => {
          setStatus('idle');
        });
      } catch (error) {
        console.error('Error getting character response:', error);
        setStatus('idle');
      }
    },
    [character, messages, addMessage, setStatus, audio, onExit]
  );

  // Register speech result callback
  useEffect(() => {
    audio.onSpeechResult(handleChildSpeech);
  }, [audio, handleChildSpeech]);

  // Start with greeting when conversation starts (only after user clicks start)
  useEffect(() => {
    if (!hasStarted) return;

    const greet = async () => {
      const greeting = character.greeting;
      addMessage('assistant', greeting);
      setStatus('speaking');

      audio.speak(greeting, () => {
        setStatus('idle');
      });
    };

    // Wait 1 second for voices to load before greeting
    const timer = setTimeout(() => {
      greet();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  // Auto-start listening when idle
  useEffect(() => {
    if (status === 'idle' && !audio.isListening && !audio.isSpeaking) {
      const timer = setTimeout(() => {
        setStatus('listening');
        audio.startListening();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, audio, setStatus]);

  // Handle start button click
  const handleStart = () => {
    setHasStarted(true);
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
      <Controls isListening={audio.isListening} onExit={onExit} />

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
          {status === 'processing' && '💭 Thinking...'}
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

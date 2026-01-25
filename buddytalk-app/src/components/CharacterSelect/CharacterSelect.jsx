import { useEffect, useState } from 'react';
import { characters } from '../../config/characters';
import { colors, borderRadius, shadows, spacing } from '../../styles/theme';
import CharacterCard from './CharacterCard';
import { speak, stopSpeaking } from '../../utils/voiceControl';
import Button from '../shared/Button';

export default function CharacterSelect({ onCharacterSelect, onBack, userName }) {
  const [hasSpoken, setHasSpoken] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Speak welcome prompt when component mounts
  useEffect(() => {
    if (!hasSpoken) {
      const timer = setTimeout(() => {
        const greeting = userName
          ? `Hi ${userName}! Who do you want to talk to today?`
          : 'Hi there! Who do you want to talk to today?';
        speak(greeting);
      }, 300);
      setHasSpoken(true);
      return () => clearTimeout(timer);
    }
  }, [userName, hasSpoken]);

  // Stop voice when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Voice search functionality
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice search not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Filter characters based on search query
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        gap: spacing.xxl,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative floating shapes */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(124, 77, 255, 0.08)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(124, 77, 255, 0.06)',
          animation: 'float 8s ease-in-out infinite 1s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '15%',
          fontSize: '40px',
          opacity: 0.3,
          animation: 'float 7s ease-in-out infinite 2s',
        }}
      >
        ⭐
      </div>
      <div
        style={{
          position: 'absolute',
          top: '25%',
          right: '20%',
          fontSize: '35px',
          opacity: 0.3,
          animation: 'float 9s ease-in-out infinite',
        }}
      >
        ✨
      </div>

      {/* Back Button */}
      <div style={{ position: 'absolute', top: spacing.lg, left: spacing.lg }}>
        <Button onClick={onBack} variant="ghost" icon="←">
          Back
        </Button>
      </div>

      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease forwards',
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: colors.primary,
            marginBottom: spacing.sm,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {userName ? `Hi ${userName}! 👋` : 'Hi there! 👋'}
        </h1>
        <p
          style={{
            fontSize: '24px',
            color: colors.textLight,
            fontWeight: 600,
          }}
        >
          Who do you want to talk to today?
        </p>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          width: '100%',
          maxWidth: '600px',
          backgroundColor: colors.white,
          borderRadius: borderRadius.full,
          padding: `${spacing.sm} ${spacing.lg}`,
          boxShadow: shadows.card,
          animation: 'fadeIn 0.6s ease forwards',
          zIndex: 1,
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a character..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '18px',
            backgroundColor: 'transparent',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 600,
            color: colors.text,
          }}
        />
        <button
          onClick={handleVoiceSearch}
          style={{
            padding: spacing.sm,
            fontSize: '20px',
            backgroundColor: isListening ? colors.primary : 'transparent',
            color: isListening ? colors.white : colors.textLight,
            border: 'none',
            borderRadius: borderRadius.full,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
          }}
          title="Voice search"
        >
          🎤
        </button>
      </div>

      {/* Characters Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 350px))',
          gap: spacing.xxl,
          width: '100%',
          maxWidth: '1200px',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {filteredCharacters.map((character, index) => (
          <div
            key={character.id}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <CharacterCard character={character} onSelect={onCharacterSelect} />
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredCharacters.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            animation: 'fadeIn 0.4s ease forwards',
          }}
        >
          <p
            style={{
              fontSize: '48px',
              marginBottom: spacing.md,
            }}
          >
            🔍
          </p>
          <p
            style={{
              fontSize: '20px',
              color: colors.textLight,
              fontWeight: 600,
            }}
          >
            No characters found. Try a different search!
          </p>
        </div>
      )}
    </div>
  );
}


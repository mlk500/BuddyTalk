import { useEffect, useState } from 'react';
import { characters } from '../../config/characters';
import { colors } from '../../styles/theme';
import CharacterCard from './CharacterCard';
import { speak, stopSpeaking } from '../../utils/voiceControl';

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
        gap: '40px',
        position: 'relative',
      }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: 'white',
          color: '#666',
          border: '2px solid #ddd',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#999';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#ddd';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: '10px',
          }}
        >
          {userName ? `Hi ${userName}!` : 'Hi there!'}
        </h1>
        <p
          style={{
            fontSize: '24px',
            color: '#666',
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
          gap: '12px',
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'white',
          borderRadius: '50px',
          padding: '12px 24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
          }}
        />
        <button
          onClick={handleVoiceSearch}
          style={{
            padding: '10px 16px',
            fontSize: '20px',
            backgroundColor: isListening ? colors.primary : 'transparent',
            color: isListening ? 'white' : '#666',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          gap: '40px',
          width: '100%',
          maxWidth: '1200px',
          justifyContent: 'center',
        }}
      >
        {filteredCharacters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onSelect={onCharacterSelect}
          />
        ))}
      </div>

      {/* No results message */}
      {filteredCharacters.length === 0 && (
        <p
          style={{
            fontSize: '20px',
            color: '#999',
            textAlign: 'center',
          }}
        >
          No characters found. Try a different search!
        </p>
      )}
    </div>
  );
}


import { useState, useEffect, useCallback, useRef } from 'react';
import { colors } from '../../styles/theme';
import { createProfile } from '../../services/database';
import { speak, stopSpeaking } from '../../utils/voiceControl';

const AVATAR_OPTIONS = ['👧', '👦', '🧒', '👶', '🧑', '👨', '👩', '🧔', '👱', '🧓', '👴', '👵'];

export default function AddUser({ family, onComplete, onCancel }) {
  const [step, setStep] = useState('name'); // 'name', 'age', or 'avatar'
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasSpoken, setHasSpoken] = useState(false);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
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

      if (finalText) {
        if (step === 'name') {
          setName(finalText);
          setTranscript(''); // Clear transcript after setting name
        } else if (step === 'age') {
          // Extract number from speech
          const ageMatch = finalText.match(/\d+/);
          if (ageMatch) {
            setAge(ageMatch[0]);
            setTranscript(''); // Clear transcript after setting age
          } else {
            // Try to convert words to numbers (e.g., "five" -> "5")
            const wordToNumber = {
              one: '1', two: '2', three: '3', four: '4', five: '5',
              six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
              eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15',
              sixteen: '16', seventeen: '17', eighteen: '18'
            };
            const lowerText = finalText.toLowerCase().trim();
            if (wordToNumber[lowerText]) {
              setAge(wordToNumber[lowerText]);
              setTranscript(''); // Clear transcript after setting age
            } else {
              setAge(finalText);
            }
          }
        }
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      if (e.error !== 'no-speech') {
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
  }, [step]);

  // Speak prompt when step changes
  useEffect(() => {
    if (!hasSpoken) {
      const timer = setTimeout(() => {
        const prompts = {
          name: "Hi there! What's your name?",
          age: `Nice to meet you, ${name}! How old are you?`,
          avatar: `Great, ${name}! Now pick your favorite avatar!`,
        };

        speak(prompts[step], {
          onEnd: () => {
            // Auto-start listening after prompt (only for name and age steps)
            if (step !== 'avatar') {
              setTimeout(() => {
                startListening();
              }, 500);
            }
          }
        });
      }, 300);
      setHasSpoken(true);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Stop voice when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setTranscript('');
      recognitionRef.current.start();
    } catch (err) {
      alert('Microphone permission denied');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleNext = async () => {
    if (step === 'name' && name.trim()) {
      setStep('age');
      setTranscript('');
      setHasSpoken(false);
      stopListening();
    } else if (step === 'age' && age.trim()) {
      // Validate age is a number
      const ageNum = parseInt(age.trim(), 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
        alert('Please enter a valid age between 1 and 18');
        return;
      }

      // Move to avatar selection
      setStep('avatar');
      setTranscript('');
      setHasSpoken(false);
      stopListening();
    } else if (step === 'avatar') {
      // Create profile
      setLoading(true);
      try {
        const newProfile = await createProfile(family.id, name.trim(), age, selectedAvatar);
        console.log('Created profile:', newProfile);
        onComplete(newProfile);
      } catch (error) {
        console.error('Error creating profile:', error);
        alert('Error creating profile. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleSkip = () => {
    if (step === 'name') {
      onCancel();
    } else if (step === 'age') {
      setStep('name');
      setTranscript('');
      setHasSpoken(false);
      stopListening();
    } else if (step === 'avatar') {
      setStep('age');
      setTranscript('');
      setHasSpoken(false);
    }
  };

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
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '60px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Friendly Icon */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '30px',
          }}
        >
          {step === 'name' ? '👋' : step === 'age' ? '🎂' : '🎨'}
        </div>

        {/* Question */}
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: '20px',
          }}
        >
          {step === 'name'
            ? "What's your name?"
            : step === 'age'
            ? 'How old are you?'
            : 'Pick your avatar!'}
        </h2>

        {/* Listening Indicator */}
        {isListening && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                animation: 'blink 1.5s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: '16px', color: '#666' }}>Listening...</span>
            <style>
              {`
                @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
              `}
            </style>
          </div>
        )}

        {/* Input Field or Avatar Picker */}
        {step !== 'avatar' ? (
          <div style={{ marginBottom: '30px' }}>
            <input
              type={step === 'age' ? 'number' : 'text'}
              value={step === 'name' ? name : age}
              onChange={(e) => {
                if (step === 'name') {
                  setName(e.target.value);
                } else {
                  setAge(e.target.value);
                }
              }}
              placeholder={step === 'name' ? 'Type or speak your name...' : 'Type or speak your age...'}
              min={step === 'age' ? '1' : undefined}
              max={step === 'age' ? '18' : undefined}
              style={{
                width: '100%',
                padding: '20px',
                fontSize: '24px',
                fontWeight: 'bold',
                color: colors.primary,
                backgroundColor: colors.childSpeech,
                border: '3px solid ' + colors.primary,
                borderRadius: '20px',
                outline: 'none',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 77, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <p
              style={{
                fontSize: '14px',
                color: '#999',
                marginTop: '10px',
              }}
            >
              {step === 'name'
                ? 'You can type your name or click the microphone to speak'
                : 'You can type your age or click the microphone to speak'}
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '30px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '15px',
                marginBottom: '20px',
              }}
            >
              {AVATAR_OPTIONS.map((emoji) => (
                <div
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: selectedAvatar === emoji ? colors.primary : '#f5f5f5',
                    border:
                      selectedAvatar === emoji
                        ? '4px solid ' + colors.primary
                        : '4px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAvatar !== emoji) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.backgroundColor = '#e5e5e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor =
                      selectedAvatar === emoji ? colors.primary : '#f5f5f5';
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            marginTop: '30px',
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: 'white',
              color: '#666',
              border: '2px solid #ddd',
              borderRadius: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = '#999';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            {step === 'name' ? 'Cancel' : 'Back'}
          </button>

          {step !== 'avatar' && (
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: isListening ? '#ef4444' : colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              {isListening ? '🎤 Stop' : '🎤 Speak'}
            </button>
          )}

          {((step === 'name' && name) || (step === 'age' && age) || step === 'avatar') && (
            <button
              onClick={handleNext}
              disabled={loading}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              {loading
                ? 'Creating...'
                : step === 'name'
                ? 'Next →'
                : step === 'age'
                ? 'Next →'
                : 'Done ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

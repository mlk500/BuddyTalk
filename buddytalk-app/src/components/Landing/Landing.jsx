import { useState, useEffect } from 'react';
import { colors } from '../../styles/theme';
import {
  getFamilyByCode,
  createFamily,
  storeFamilyCodeLocally,
  getStoredFamilyCode
} from '../../services/database';
import { speak, stopSpeaking } from '../../utils/voiceControl';

export default function Landing({ onFamilyLoaded }) {
  const [view, setView] = useState('main'); // 'main', 'enter', 'create'
  const [familyCode, setFamilyCode] = useState('');
  const [newFamilyCode, setNewFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSpoken, setHasSpoken] = useState(false);

  // Check if family code exists in localStorage on mount
  useEffect(() => {
    const storedCode = getStoredFamilyCode();
    if (storedCode) {
      // Auto-load family
      handleLoadFamily(storedCode);
    }
  }, []);

  // Speak welcome message (only once)
  useEffect(() => {
    if (view === 'main' && !hasSpoken) {
      const timer = setTimeout(() => {
        speak("Welcome to BuddyTalk! Are you new, or do you have a family code?");
      }, 300);
      setHasSpoken(true);
      return () => clearTimeout(timer);
    }
  }, [view]);

  // Stop voice when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);


  const handleLoadFamily = async (code) => {
    setLoading(true);
    setError('');

    try {
      const family = await getFamilyByCode(code);

      if (!family) {
        setError("Hmm, I don't know that code. Try again!");
        speak("Hmm, I don't know that code. Try again!");
        setLoading(false);
        return;
      }

      // Store code locally and load family
      storeFamilyCodeLocally(code);
      onFamilyLoaded(family);
    } catch (err) {
      console.error('Error loading family:', err);
      setError('Something went wrong. Please try again!');
      speak('Something went wrong. Please try again!');
      setLoading(false);
    }
  };

  const handleEnterCode = async () => {
    if (!familyCode.trim()) {
      setError('Please enter a family code!');
      speak('Please enter a family code!');
      return;
    }

    await handleLoadFamily(familyCode.toUpperCase());
  };

  const handleCreateFamily = async () => {
    setLoading(true);
    setError('');

    try {
      const { family_code, family_id } = await createFamily();
      setNewFamilyCode(family_code);
      setView('create');

      // Speak the code
      setTimeout(() => {
        speak(`Your family code is: ${family_code.split('-').join(', ')}. Remember it!`);
      }, 500);
    } catch (err) {
      console.error('Error creating family:', err);
      setError('Something went wrong. Please try again!');
      speak('Something went wrong. Please try again!');
      setLoading(false);
    }
  };

  const handleContinueWithNewFamily = async () => {
    await handleLoadFamily(newFamilyCode);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newFamilyCode);
    speak('Code copied!');
  };

  // ========== MAIN VIEW ==========
  if (view === 'main') {
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
        {/* Logo */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '20px',
          }}
        >
          💬
        </div>

        {/* App Name */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: '10px',
            fontFamily: "'Quicksand', sans-serif",
          }}
        >
          BuddyTalk
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: '24px',
            color: '#666',
            marginBottom: '60px',
            textAlign: 'center',
          }}
        >
          Talk with your favorite characters!
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <button
            onClick={() => setView('enter')}
            style={{
              padding: '20px 40px',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '20px',
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
            I Have a Family Code
          </button>

          <button
            onClick={handleCreateFamily}
            disabled={loading}
            style={{
              padding: '20px 40px',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
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
            {loading ? 'Creating...' : 'Create New Family'}
          </button>
        </div>

        {error && (
          <p
            style={{
              marginTop: '20px',
              color: '#ef4444',
              fontSize: '16px',
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  // ========== ENTER CODE VIEW ==========
  if (view === 'enter') {
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
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '60px',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            🔑
          </div>

          <h2
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: colors.primary,
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Enter Your Family Code
          </h2>

          <input
            type="text"
            value={familyCode}
            onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
            placeholder="HAPPY-DOLPHIN-42"
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: colors.primary,
              backgroundColor: colors.childSpeech,
              border: '3px solid ' + colors.primary,
              borderRadius: '15px',
              outline: 'none',
              textAlign: 'center',
              marginBottom: '30px',
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEnterCode();
              }
            }}
          />

          {error && (
            <p
              style={{
                color: '#ef4444',
                fontSize: '16px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => {
                setView('main');
                setFamilyCode('');
                setError('');
              }}
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
              Back
            </button>

            <button
              onClick={handleEnterCode}
              disabled={loading}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: colors.primary,
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
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== CREATE FAMILY VIEW ==========
  if (view === 'create') {
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
          <div
            style={{
              fontSize: '80px',
              marginBottom: '20px',
            }}
          >
            🎉
          </div>

          <h2
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: colors.primary,
              marginBottom: '20px',
            }}
          >
            This is your Family Code!
          </h2>

          <p
            style={{
              fontSize: '18px',
              color: '#666',
              marginBottom: '30px',
            }}
          >
            Write it down or remember it! You'll need it to access your family profiles.
          </p>

          {/* Family Code Display */}
          <div
            style={{
              backgroundColor: colors.childSpeech,
              border: '4px solid ' + colors.primary,
              borderRadius: '20px',
              padding: '30px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: colors.primary,
                letterSpacing: '2px',
                fontFamily: "'Courier New', monospace",
              }}
            >
              {newFamilyCode}
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#f3f4f6',
              color: '#666',
              border: '2px solid #ddd',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '30px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            📋 Copy Code
          </button>

          <button
            onClick={handleContinueWithNewFamily}
            disabled={loading}
            style={{
              padding: '20px 50px',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
              display: 'block',
              width: '100%',
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
            {loading ? 'Loading...' : "Let's Go!"}
          </button>
        </div>
      </div>
    );
  }
}

import { useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing } from '../../styles/theme';
import {
  getFamilyByCode,
  createFamily,
  storeFamilyCodeLocally,
  getStoredFamilyCode
} from '../../services/database';
import { speak, stopSpeaking } from '../../utils/voiceControl';
import Button from '../shared/Button';
import Loading from '../shared/Loading';

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
      setLoading(false);

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
          padding: spacing.xxl,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(124, 77, 255, 0.08)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(74, 222, 128, 0.1)',
            animation: 'float 10s ease-in-out infinite 2s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '10%',
            fontSize: '60px',
            opacity: 0.2,
            animation: 'float 12s ease-in-out infinite 1s',
          }}
        >
          ⭐
        </div>

        {/* Content container */}
        <div
          style={{
            textAlign: 'center',
            animation: 'fadeIn 0.6s ease forwards',
            zIndex: 1,
          }}
        >
          {/* Waving character illustration */}
          <div
            style={{
              marginBottom: spacing.lg,
              animation: 'breathe 3s ease-in-out infinite',
            }}
          >
            <img
              src="/assets/waving.png"
              alt="Friendly character waving"
              style={{
                width: '200px',
                height: 'auto',
                filter: 'drop-shadow(0 10px 30px rgba(124, 77, 255, 0.2))',
              }}
            />
          </div>

          {/* App Name */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 800,
              background: colors.primaryGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: spacing.sm,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            BuddyTalk
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: '28px',
              color: colors.textLight,
              marginBottom: spacing.xxl,
              fontWeight: 600,
            }}
          >
            Talk with your favorite characters!
          </p>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.lg,
              width: '100%',
              maxWidth: '450px',
              margin: '0 auto',
            }}
          >
            <Button
              onClick={() => setView('enter')}
              variant="primary"
              size="large"
              fullWidth
              icon="🔑"
            >
              I Have a Family Code
            </Button>

            <Button
              onClick={handleCreateFamily}
              disabled={loading}
              size="large"
              fullWidth
              icon="✨"
              style={{
                background: loading ? colors.primaryGradient : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              }}
            >
              {loading ? <Loading text="" size="small" /> : 'Create New Family'}
            </Button>
          </div>

          {error && (
            <div
              style={{
                marginTop: spacing.lg,
                padding: spacing.md,
                backgroundColor: '#fee2e2',
                borderRadius: borderRadius.md,
                animation: 'fadeIn 0.3s ease forwards',
              }}
            >
              <p
                style={{
                  color: '#dc2626',
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          )}
        </div>
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
          padding: spacing.xxl,
        }}
      >
        <div
          style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.xl,
            padding: spacing.xxl,
            boxShadow: shadows.cardHover,
            maxWidth: '550px',
            width: '100%',
            animation: 'fadeIn 0.4s ease forwards',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              textAlign: 'center',
              marginBottom: spacing.lg,
              animation: 'bounce 2s ease-in-out infinite',
            }}
          >
            🔑
          </div>

          <h2
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: colors.primary,
              marginBottom: spacing.md,
              textAlign: 'center',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Enter Your Family Code
          </h2>

          <p
            style={{
              fontSize: '16px',
              color: colors.textLight,
              textAlign: 'center',
              marginBottom: spacing.xl,
              fontWeight: 600,
            }}
          >
            Type your family code to access your profiles
          </p>

          <input
            type="text"
            value={familyCode}
            onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
            placeholder="HAPPY-DOLPHIN-42"
            style={{
              width: '100%',
              padding: spacing.lg,
              fontSize: '22px',
              fontWeight: 700,
              color: colors.primary,
              backgroundColor: colors.childSpeech,
              border: `3px solid ${colors.primary}`,
              borderRadius: borderRadius.md,
              outline: 'none',
              textAlign: 'center',
              marginBottom: spacing.lg,
              fontFamily: "'Nunito', sans-serif",
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = shadows.button;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEnterCode();
              }
            }}
          />

          {error && (
            <div
              style={{
                marginBottom: spacing.lg,
                padding: spacing.md,
                backgroundColor: '#fee2e2',
                borderRadius: borderRadius.md,
                animation: 'fadeIn 0.3s ease forwards',
              }}
            >
              <p
                style={{
                  color: '#dc2626',
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: spacing.md,
              justifyContent: 'center',
            }}
          >
            <Button
              onClick={() => {
                setView('main');
                setFamilyCode('');
                setError('');
              }}
              variant="ghost"
              size="large"
              icon="←"
            >
              Back
            </Button>

            <Button
              onClick={handleEnterCode}
              disabled={loading}
              variant="primary"
              size="large"
            >
              {loading ? <Loading text="" size="small" /> : 'Continue →'}
            </Button>
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
          padding: spacing.xxl,
          position: 'relative',
        }}
      >
        {/* Back Button */}
        <div style={{ position: 'absolute', top: spacing.lg, left: spacing.lg }}>
          <Button
            onClick={() => {
              setView('main');
              setNewFamilyCode('');
              setError('');
            }}
            variant="ghost"
            icon="←"
          >
            Back
          </Button>
        </div>

        <div
          style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.xl,
            padding: spacing.xxl,
            boxShadow: shadows.cardHover,
            maxWidth: '650px',
            width: '100%',
            textAlign: 'center',
            animation: 'fadeIn 0.4s ease forwards',
          }}
        >
          <div
            style={{
              fontSize: '100px',
              marginBottom: spacing.lg,
              animation: 'bounce 1.5s ease-in-out infinite',
            }}
          >
            🎉
          </div>

          <h2
            style={{
              fontSize: '40px',
              fontWeight: 800,
              color: colors.primary,
              marginBottom: spacing.md,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            This is your Family Code!
          </h2>

          <p
            style={{
              fontSize: '18px',
              color: colors.textLight,
              marginBottom: spacing.xl,
              fontWeight: 600,
            }}
          >
            Write it down or save it! You'll need it to access your family profiles.
          </p>

          {/* Family Code Display */}
          <div
            style={{
              backgroundColor: colors.childSpeech,
              border: `4px solid ${colors.primary}`,
              borderRadius: borderRadius.lg,
              padding: spacing.xl,
              marginBottom: spacing.lg,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <div
              style={{
                fontSize: '52px',
                fontWeight: 800,
                color: colors.primary,
                letterSpacing: '3px',
                fontFamily: "'Nunito', monospace",
              }}
            >
              {newFamilyCode}
            </div>
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              size="medium"
              icon="📋"
            >
              Copy Code
            </Button>
          </div>

          {error && (
            <div
              style={{
                marginBottom: spacing.lg,
                padding: spacing.md,
                backgroundColor: '#fee2e2',
                borderRadius: borderRadius.md,
                animation: 'fadeIn 0.3s ease forwards',
              }}
            >
              <p
                style={{
                  color: '#dc2626',
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          )}

          <Button
            onClick={handleContinueWithNewFamily}
            disabled={loading}
            size="large"
            fullWidth
            icon="🚀"
            style={{
              background: loading ? colors.primaryGradient : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            }}
          >
            {loading ? <Loading text="" size="small" /> : "Let's Go!"}
          </Button>
        </div>
      </div>
    );
  }
}

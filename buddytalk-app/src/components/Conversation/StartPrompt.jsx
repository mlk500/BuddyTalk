import { colors } from '../../styles/theme';

export default function StartPrompt({ characterName, onStart }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '60px 40px',
          maxWidth: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            fontSize: '120px',
            marginBottom: '20px',
          }}
        >
          🎤
        </div>
        <button
          onClick={onStart}
          style={{
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '25px 60px',
            fontSize: '32px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(124, 77, 255, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Start Talking with {characterName}!
        </button>
      </div>
    </div>
  );
}

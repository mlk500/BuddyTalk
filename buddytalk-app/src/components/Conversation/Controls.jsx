import { colors } from '../../styles/theme';

export default function Controls({ isListening, isMuted, onToggleMute, onExit, onRetry, transcript }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '30px',
        right: '30px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      {/* Listening indicator with live transcript preview */}
      {isListening && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'white',
            padding: '15px 25px',
            borderRadius: '30px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '300px',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              animation: 'blink 1.5s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            {transcript ? `"${transcript.slice(0, 40)}${transcript.length > 40 ? '...' : ''}"` : 'Listening...'}
          </div>
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

      {/* Retry button - show when not listening and not speaking */}
      {!isListening && onRetry && (
        <button
          onClick={onRetry}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#3b82f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          title="Click to speak again"
        >
          🎤
        </button>
      )}

      {/* Mute/Unmute Button */}
      <button
        onClick={onToggleMute}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isMuted ? '#ef4444' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Exit Button */}
      <button
        onClick={onExit}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = colors.background;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'white';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        title="Say goodbye and leave"
      >
        👋
      </button>
    </div>
  );
}

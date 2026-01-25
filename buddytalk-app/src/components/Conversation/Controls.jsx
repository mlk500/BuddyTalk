import { colors } from '../../styles/theme';

export default function Controls({ isListening, isMuted, onToggleMute, onExit }) {
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
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              animation: 'blink 1.5s ease-in-out infinite',
            }}
          />
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

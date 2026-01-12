export default function Avatar({ character, expression = 'neutral', isSpeaking }) {
  const imageSrc = character.expressions?.[expression] || character.image;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '1',
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: isSpeaking
          ? '0 0 60px rgba(124, 77, 255, 0.6)'
          : '0 10px 40px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        transform: isSpeaking ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <img
        src={imageSrc}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {isSpeaking && (
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '8px',
            backgroundColor: 'rgba(124, 77, 255, 0.8)',
            borderRadius: '4px',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: translateX(-50%) scaleX(0.8); }
            50% { opacity: 1; transform: translateX(-50%) scaleX(1); }
          }
        `}
      </style>
    </div>
  );
}

import { colors } from '../../styles/theme';

export default function Loading({ text = 'Loading...', size = 'medium' }) {
  const dotSize = size === 'small' ? '8px' : size === 'large' ? '16px' : '12px';
  const gap = size === 'small' ? '6px' : size === 'large' ? '10px' : '8px';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      {/* Bouncing dots */}
      <div
        style={{
          display: 'flex',
          gap: gap,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: colors.primaryGradient,
              animation: 'bouncingDots 1.4s infinite ease-in-out',
              animationDelay: `${index * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      {text && (
        <p
          style={{
            fontSize: size === 'small' ? '14px' : size === 'large' ? '20px' : '16px',
            color: colors.textLight,
            fontWeight: 600,
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}

import { colors, borderRadius, shadows, animations } from '../../styles/theme';

export default function CharacterCard({ character, onSelect }) {
  const handleClick = () => {
    if (!character.available) {
      alert(`${character.name} is coming soon! Stay tuned!`);
      return;
    }
    onSelect(character);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        backgroundColor: colors.white,
        boxShadow: shadows.card,
        transition: animations.transition,
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        opacity: character.available ? 1 : 0.6,
        filter: character.available ? 'none' : 'grayscale(50%)',
        animation: 'fadeIn 0.4s ease forwards',
      }}
      onMouseEnter={(e) => {
        if (character.available) {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
          e.currentTarget.style.boxShadow = shadows.cardHover;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = shadows.card;
      }}
      onMouseDown={(e) => {
        if (character.available) {
          e.currentTarget.style.transform = animations.scaleOnTap;
        }
      }}
      onMouseUp={(e) => {
        if (character.available) {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        }
      }}
    >
      <div
        style={{
          width: '100%',
          paddingTop: '100%',
          position: 'relative',
          backgroundColor: colors.background,
        }}
      >
        <img
          src={character.image}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Coming Soon Ribbon */}
        {!character.available && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '-35px',
              backgroundColor: colors.primary,
              color: colors.white,
              padding: '6px 40px',
              transform: 'rotate(45deg)',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: shadows.button,
              textAlign: 'center',
            }}
          >
            Coming Soon
          </div>
        )}
      </div>

      {/* Character Name */}
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: colors.white,
        }}
      >
        <h3
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: colors.primary,
            margin: 0,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {character.emoji} {character.name}
        </h3>
      </div>
    </div>
  );
}

import { colors } from '../../styles/theme';

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
        borderRadius: '30px',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        opacity: character.available ? 1 : 0.6,
      }}
      onMouseEnter={(e) => {
        if (character.available) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(124, 77, 255, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
      }}
      onMouseDown={(e) => {
        if (character.available) {
          e.currentTarget.style.transform = 'scale(0.98)';
        }
      }}
      onMouseUp={(e) => {
        if (character.available) {
          e.currentTarget.style.transform = 'scale(1.05)';
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

        {/* Coming Soon Badge */}
        {!character.available && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#666',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            Coming Soon!
          </div>
        )}
      </div>

      {/* Character Name */}
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: 'white',
        }}
      >
        <h3
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: colors.primary,
            margin: 0,
          }}
        >
          {character.emoji} {character.name}
        </h3>
      </div>
    </div>
  );
}

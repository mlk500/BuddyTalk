import { colors } from '../../styles/theme';

export default function CharacterCard({ character, onSelect }) {
  return (
    <div
      onClick={() => onSelect(character)}
      style={{
        cursor: 'pointer',
        borderRadius: '30px',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: '400px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 15px 40px rgba(124, 77, 255, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
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
      </div>
    </div>
  );
}

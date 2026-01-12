import { characters } from '../../config/characters';
import { colors } from '../../styles/theme';
import CharacterCard from './CharacterCard';

export default function CharacterSelect({ onCharacterSelect }) {
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
        gap: '60px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 400px))',
          gap: '40px',
          width: '100%',
          maxWidth: '900px',
          justifyContent: 'center',
        }}
      >
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onSelect={onCharacterSelect}
          />
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import CharacterSelect from './components/CharacterSelect';
import Conversation from './components/Conversation';

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  const handleExit = () => {
    setSelectedCharacter(null);
  };

  return (
    <>
      {!selectedCharacter ? (
        <CharacterSelect onCharacterSelect={handleCharacterSelect} />
      ) : (
        <Conversation character={selectedCharacter} onExit={handleExit} />
      )}
    </>
  );
}

export default App;

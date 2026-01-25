import { useState } from 'react';
import Landing from './components/Landing/Landing';
import UserSelect from './components/UserSelect/UserSelect';
import AddUser from './components/UserSelect/AddUser';
import EditUser from './components/UserSelect/EditUser';
import CharacterSelect from './components/CharacterSelect';
import ChatHistory from './components/CharacterSelect/ChatHistory';
import Conversation from './components/Conversation';
import { Dashboard } from './components/Dashboard';
import { setGlobalMute, isVoiceMuted } from './utils/voiceControl';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'userSelect', 'addUser', 'editUser', 'characterSelect', 'chatHistory', 'conversation', 'dashboard'
  const [currentFamily, setCurrentFamily] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);

  const handleToggleGlobalMute = () => {
    const newMuted = !isGlobalMuted;
    setIsGlobalMuted(newMuted);
    setGlobalMute(newMuted);
  };

  const handleFamilyLoaded = (family) => {
    setCurrentFamily(family);
    setCurrentView('userSelect');
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCurrentView('characterSelect');
  };

  const handleAddUserClick = () => {
    setCurrentView('addUser');
  };

  const handleAddUserComplete = (newUser) => {
    setSelectedUser(newUser);
    setCurrentView('characterSelect');
  };

  const handleAddUserCancel = () => {
    setCurrentView('userSelect');
  };

  const handleEditUserClick = (user) => {
    setUserToEdit(user);
    setCurrentView('editUser');
  };

  const handleEditUserComplete = (updatedUser) => {
    setUserToEdit(null);
    setCurrentView('userSelect');
  };

  const handleEditUserCancel = () => {
    setUserToEdit(null);
    setCurrentView('userSelect');
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setCurrentView('chatHistory');
  };

  const handleNewChat = async () => {
    // Create a new chat in the database
    const { createChat } = await import('./services/database');
    try {
      const newChat = await createChat(selectedUser.id, selectedCharacter.id);
      setSelectedChat(newChat);
      setCurrentView('conversation');
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat');
    }
  };

  const handleContinueChat = (chat) => {
    setSelectedChat(chat);
    setCurrentView('conversation');
  };

  const handleBackToCharacters = () => {
    setSelectedCharacter(null);
    setSelectedChat(null);
    setCurrentView('characterSelect');
  };

  const handleExit = () => {
    setSelectedChat(null);
    setCurrentView('chatHistory');
  };

  const handleSignOut = () => {
    setCurrentFamily(null);
    setSelectedUser(null);
    setSelectedCharacter(null);
    setSelectedChat(null);
    setUserToEdit(null);
    setCurrentView('landing');
  };

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleCloseDashboard = () => {
    setCurrentView('userSelect');
  };

  return (
    <>
      {/* Global Mute Button - Shows on all screens except conversation and dashboard */}
      {currentView !== 'conversation' && currentView !== 'dashboard' && (
        <button
          onClick={handleToggleGlobalMute}
          style={{
            position: 'fixed',
            top: '90px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isGlobalMuted ? '#ef4444' : 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
            zIndex: 1000,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={isGlobalMuted ? 'Unmute Voice' : 'Mute Voice'}
        >
          {isGlobalMuted ? '🔇' : '🔊'}
        </button>
      )}

      {currentView === 'landing' && <Landing onFamilyLoaded={handleFamilyLoaded} />}

      {currentView === 'userSelect' && (
        <UserSelect
          family={currentFamily}
          onUserSelect={handleUserSelect}
          onAddUser={handleAddUserClick}
          onEditUser={handleEditUserClick}
          onSignOut={handleSignOut}
          onOpenDashboard={handleOpenDashboard}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard familyId={currentFamily?.id} onClose={handleCloseDashboard} />
      )}

      {currentView === 'addUser' && (
        <AddUser
          family={currentFamily}
          onComplete={handleAddUserComplete}
          onCancel={handleAddUserCancel}
        />
      )}

      {currentView === 'editUser' && userToEdit && (
        <EditUser
          user={userToEdit}
          onComplete={handleEditUserComplete}
          onCancel={handleEditUserCancel}
        />
      )}

      {currentView === 'characterSelect' && (
        <CharacterSelect
          onCharacterSelect={handleCharacterSelect}
          onBack={() => setCurrentView('userSelect')}
          userName={selectedUser?.name}
        />
      )}

      {currentView === 'chatHistory' && (
        <ChatHistory
          profile={selectedUser}
          character={selectedCharacter}
          onNewChat={handleNewChat}
          onContinueChat={handleContinueChat}
          onBack={handleBackToCharacters}
        />
      )}

      {currentView === 'conversation' && (
        <Conversation
          character={selectedCharacter}
          profile={selectedUser}
          chat={selectedChat}
          onExit={handleExit}
        />
      )}
    </>
  );
}

export default App;

import { useState } from 'react';
import PinEntry from './PinEntry';
import FamilyOverview from './FamilyOverview';
import ChildDetails from './ChildDetails';
import ChatTranscript from './ChatTranscript';
import './Dashboard.css';

export default function Dashboard({ familyId, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('overview'); // 'overview' | 'child' | 'transcript'
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSelectChild = (profile) => {
    setSelectedChild(profile);
    setCurrentView('child');
  };

  const handleBackToOverview = () => {
    setSelectedChild(null);
    setSelectedChat(null);
    setCurrentView('overview');
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setCurrentView('transcript');
  };

  const handleBackToChild = () => {
    setSelectedChat(null);
    setCurrentView('child');
  };

  if (!isAuthenticated) {
    return <PinEntry onSuccess={handlePinSuccess} onCancel={onClose} />;
  }

  if (currentView === 'transcript' && selectedChat && selectedChild) {
    return (
      <ChatTranscript
        chat={selectedChat}
        profile={selectedChild}
        onBack={handleBackToChild}
      />
    );
  }

  if (currentView === 'child' && selectedChild) {
    return (
      <ChildDetails
        profile={selectedChild}
        onBack={handleBackToOverview}
        onSelectChat={handleSelectChat}
      />
    );
  }

  return (
    <FamilyOverview
      familyId={familyId}
      onClose={onClose}
      onSelectChild={handleSelectChild}
    />
  );
}

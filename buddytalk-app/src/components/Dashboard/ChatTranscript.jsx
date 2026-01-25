import { useState, useEffect } from 'react';
import { getMessagesByChat } from '../../services/database';
import { characters } from '../../config/characters';
import './Dashboard.css';

export default function ChatTranscript({ chat, profile, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMessages();
  }, [chat]);

  async function loadMessages() {
    try {
      setLoading(true);
      const chatMessages = await getMessagesByChat(chat.id);
      setMessages(chatMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }

  function getCharacterName(characterId) {
    const character = characters.find((c) => c.id === characterId);
    return character ? character.name : 'Unknown';
  }

  function getCharacterEmoji(characterId) {
    const character = characters.find((c) => c.id === characterId);
    return character ? character.emoji || '🎭' : '🎭';
  }

  function formatTimestamp(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  const characterName = getCharacterName(chat.character_id);
  const characterEmoji = getCharacterEmoji(chat.character_id);
  const chatTitle = chat.title || 'Conversation';
  const chatTimestamp = formatTimestamp(chat.updated_at);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h1>💬 {chatTitle}</h1>
        </div>
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h1>💬 {chatTitle}</h1>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="transcript-header-info">
          <h1>💬 {chatTitle}</h1>
          <p className="transcript-meta">
            with {characterName} • {chatTimestamp}
          </p>
        </div>
      </div>

      <div className="dashboard-content transcript-content">
        {messages.length === 0 ? (
          <p className="empty-message">No messages in this conversation</p>
        ) : (
          <div className="transcript-messages">
            {messages.map((message, index) => (
              <div key={message.id || index} className={`transcript-message ${message.role}`}>
                <div className="message-icon">
                  {message.role === 'assistant' ? characterEmoji : profile.avatar_url || '👧'}
                </div>
                <div className="message-content">
                  <div className="message-sender">
                    {message.role === 'assistant' ? characterName : profile.name}:
                  </div>
                  <div className="message-text">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

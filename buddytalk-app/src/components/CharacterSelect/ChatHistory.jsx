import { useState, useEffect } from 'react';
import { colors } from '../../styles/theme';
import { getChatsByProfileAndCharacter, updateChatTitle, deleteChat } from '../../services/database';

export default function ChatHistory({ profile, character, onNewChat, onContinueChat, onBack }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadChats();
  }, [profile, character]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const chatList = await getChatsByProfileAndCharacter(profile.id, character.id);
      console.log('📋 Loaded chats:', chatList.map(c => ({
        title: c.title,
        updated_at: c.updated_at,
        formatted: formatDate(c.updated_at)
      })));
      setChats(chatList);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (chatId) => {
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      await updateChatTitle(chatId, editTitle.trim());
      setEditingChatId(null);
      loadChats();
    } catch (error) {
      console.error('Error renaming chat:', error);
      alert('Failed to rename chat');
    }
  };

  const handleDelete = async (chatId, chatTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${chatTitle || 'Untitled Chat'}"? This cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteChat(chatId);
      loadChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

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
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '60px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          maxWidth: '800px',
          width: '100%',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {character.emoji || '💬'}
          </div>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: colors.primary,
              marginBottom: '10px',
            }}
          >
            Chat with {character.name}
          </h2>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Start a new conversation or continue where you left off!
          </p>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '20px',
            fontWeight: 'bold',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '30px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.opacity = '1';
          }}
        >
          ✨ Start New Chat
        </button>

        {/* Previous Chats */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading chats...
          </div>
        ) : chats.length > 0 ? (
          <div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#666',
                marginBottom: '20px',
              }}
            >
              Previous Chats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  style={{
                    backgroundColor: colors.childSpeech,
                    borderRadius: '15px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '2px solid transparent',
                  }}
                  onClick={() => {
                    if (!editingChatId) {
                      onContinueChat(chat);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!editingChatId) {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleRename(chat.id);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: colors.primary,
                            backgroundColor: 'white',
                            border: '2px solid ' + colors.primary,
                            borderRadius: '8px',
                            outline: 'none',
                          }}
                        />
                      ) : (
                        <h4
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: colors.primary,
                            marginBottom: '5px',
                          }}
                        >
                          {chat.title || 'Untitled Chat'}
                        </h4>
                      )}
                      <p style={{ fontSize: '14px', color: '#999' }}>
                        {formatDate(chat.updated_at)}
                      </p>
                    </div>

                    {editingChatId === chat.id ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(chat.id);
                          }}
                          style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(null);
                          }}
                          style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundColor: '#f3f4f6',
                            color: '#666',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(chat.id);
                            setEditTitle(chat.title || '');
                          }}
                          style={{
                            padding: '8px 12px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            color: '#666',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#ddd';
                          }}
                        >
                          ✏️ Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(chat.id, chat.title);
                          }}
                          style={{
                            padding: '8px 12px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            color: '#ef4444',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#ddd';
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontSize: '16px',
            }}
          >
            No previous chats yet. Start your first conversation!
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'white',
            color: '#666',
            border: '2px solid #ddd',
            borderRadius: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '30px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#ddd';
          }}
        >
          ← Back to Characters
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getChildDashboardData } from '../../services/database';
import { characters } from '../../config/characters';
import PracticeBreakdown from './PracticeBreakdown';
import './Dashboard.css';

export default function ChildDetails({ profile, onBack, onSelectChat }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getChildDashboardData(profile.id);
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading child dashboard data:', err);
      setError('Failed to load child data');
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

  function formatChatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Debug log
    console.log('⏰ Chat timestamp debug:', {
      dateString,
      date: date.toString(),
      now: now.toString(),
      diffMs,
      diffMinutes,
      diffHours,
      diffDays
    });

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h1>{profile.avatar_url || '👧'} {profile.name}'s Activity</h1>
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
          <h1>{profile.avatar_url || '👧'} {profile.name}'s Activity</h1>
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
        <h1>{profile.avatar_url || '👧'} {profile.name}'s Activity</h1>
      </div>

      <div className="dashboard-content child-details">
        {/* This Week Stats */}
        <section className="week-stats-section">
          <h3>📊 THIS WEEK</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dashboardData.timeSpentThisWeek} min</div>
              <div className="stat-label">talking</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData.chatCountThisWeek}</div>
              <div className="stat-label">chat{dashboardData.chatCountThisWeek !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </section>

        {/* Practice Breakdown */}
        <PracticeBreakdown practiceBreakdown={dashboardData.practiceBreakdown} />

        {/* Memories */}
        <section className="memories-section">
          <h3>💭 WHAT {profile.name.toUpperCase()} TALKS ABOUT</h3>
          {dashboardData.memories.length === 0 ? (
            <p className="empty-message">No memories yet — keep chatting!</p>
          ) : (
            <ul className="memories-list">
              {dashboardData.memories.slice(0, 10).map((memory, index) => (
                <li key={index}>• {memory}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent Conversations */}
        <section className="recent-chats-section">
          <h3>💬 RECENT CONVERSATIONS</h3>
          {dashboardData.recentChats.length === 0 ? (
            <p className="empty-message">No conversations yet</p>
          ) : (
            <div className="chat-list">
              {dashboardData.recentChats.map((chat) => (
                <div key={chat.id} className="chat-item">
                  <div className="chat-info">
                    <span className="chat-character">
                      {getCharacterEmoji(chat.character_id)} {getCharacterName(chat.character_id)}
                    </span>
                    <span className="chat-title">
                      {chat.title || 'Conversation'}
                    </span>
                    <span className="chat-date">
                      {formatChatDate(chat.updated_at)}
                    </span>
                  </div>
                  <button
                    className="view-chat-button"
                    onClick={() => onSelectChat(chat)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Concerns/Notes */}
        <section className="concerns-section">
          <h3>💡 NOTES</h3>
          {dashboardData.concerns.length === 0 ? (
            <p className="no-concerns-message">No notes this week ✓</p>
          ) : (
            <div className="concerns-list">
              {dashboardData.concerns.map((concern) => (
                <div key={concern.id} className="concern-item">
                  <div className="concern-date">
                    {new Date(concern.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}:
                  </div>
                  <div className="concern-text">{concern.summary}</div>
                  <div className="concern-note">Just so you know — might be worth a chat!</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

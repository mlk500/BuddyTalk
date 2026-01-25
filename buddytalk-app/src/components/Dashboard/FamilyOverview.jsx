import { useState, useEffect } from 'react';
import { getFamilyOverviewData } from '../../services/database';
import { characters } from '../../config/characters';
import './Dashboard.css';

export default function FamilyOverview({ familyId, onClose, onSelectChild }) {
  const [overviewData, setOverviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [familyId]);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getFamilyOverviewData(familyId);
      setOverviewData(data);
    } catch (err) {
      console.error('Error loading family overview:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  const totalChatsThisWeek = overviewData.reduce((sum, child) => sum + child.chatCountThisWeek, 0);

  function getCharacterName(characterId) {
    const character = characters.find((c) => c.id === characterId);
    return character ? character.name : 'Unknown';
  }

  function formatLastActivity(lastActivity) {
    if (!lastActivity) return 'Never';

    const date = new Date(lastActivity);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Debug log
    console.log('⏰ Timestamp debug:', {
      lastActivity,
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
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>👨‍👩‍👧 Family Dashboard</h1>
          <button className="close-button" onClick={onClose}>
            ✕ Close
          </button>
        </div>
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>👨‍👩‍👧 Family Dashboard</h1>
          <button className="close-button" onClick={onClose}>
            ✕ Close
          </button>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👨‍👩‍👧 Family Dashboard</h1>
        <button className="close-button" onClick={onClose}>
          ✕ Close
        </button>
      </div>

      <div className="dashboard-content">
        {overviewData.length === 0 ? (
          <div className="empty-message">
            <p>No children profiles yet.</p>
            <p>Create a profile to start tracking activity!</p>
          </div>
        ) : (
          <>
            <div className="week-summary">
              This week: {totalChatsThisWeek} conversation{totalChatsThisWeek !== 1 ? 's' : ''} 🎉
            </div>

            <div className="children-grid">
              {overviewData.map(({ profile, chatCountThisWeek, timeSpentThisWeek, favoriteCharacter, lastActivity }) => (
                <div key={profile.id} className="child-card">
                  <div className="child-avatar">{profile.avatar_url || '👧'}</div>
                  <h3>
                    {profile.name} (age {profile.age})
                  </h3>

                  <div className="child-stats">
                    <p>{chatCountThisWeek} chat{chatCountThisWeek !== 1 ? 's' : ''} this week</p>
                    <p>{timeSpentThisWeek} min talking</p>
                    {favoriteCharacter && (
                      <p>❤️ Loves {getCharacterName(favoriteCharacter)}</p>
                    )}
                    <p className="last-activity">Last: {formatLastActivity(lastActivity)}</p>
                  </div>

                  <button
                    className="view-details-button"
                    onClick={() => onSelectChild(profile)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

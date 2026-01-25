import { useState, useEffect } from 'react';
import { colors } from '../../styles/theme';
import { getProfilesByFamily, clearStoredFamilyCode } from '../../services/database';
import UserCard from './UserCard';

export default function UserSelect({ family, onUserSelect, onAddUser, onEditUser, onSignOut, onOpenDashboard }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [family]);

  const loadUsers = async () => {
    if (!family) return;

    setLoading(true);
    try {
      const profiles = await getProfilesByFamily(family.id);
      setUsers(profiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    onEditUser(user);
  };

  const handleUserAdded = () => {
    // Reload users after adding
    loadUsers();
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
      {/* Parent Dashboard Button */}
      <button
        onClick={onOpenDashboard}
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: 'white',
          color: colors.primary,
          border: `2px solid ${colors.primary}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.primary;
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.color = colors.primary;
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        👨‍👩‍👧 Parent Dashboard
      </button>

      {/* Sign Out Button */}
      <button
        onClick={() => {
          clearStoredFamilyCode();
          onSignOut();
        }}
        style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: 'white',
          color: '#666',
          border: '2px solid #ddd',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#999';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#ddd';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        🚪 Sign Out
      </button>

      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '60px',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: '10px',
          }}
        >
          Who's talking today?
        </h1>
        <p
          style={{
            fontSize: '20px',
            color: '#666',
          }}
        >
          Choose your profile to start chatting with your friends!
        </p>
        <p
          style={{
            fontSize: '14px',
            color: '#999',
            marginTop: '10px',
          }}
        >
          Family Code: {family?.family_code}
        </p>
      </div>

      {/* User Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 200px))',
          gap: '30px',
          width: '100%',
          maxWidth: '1000px',
          justifyContent: 'center',
          marginBottom: '60px',
        }}
      >
        {loading ? (
          <div style={{ fontSize: '20px', color: '#666', textAlign: 'center', gridColumn: '1 / -1' }}>
            Loading profiles...
          </div>
        ) : users.length === 0 ? (
          <div style={{ fontSize: '20px', color: '#666', textAlign: 'center', gridColumn: '1 / -1' }}>
            No profiles yet! Add your first profile to get started!
          </div>
        ) : (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => onUserSelect(user)}
              onEdit={handleEditUser}
              onDeleted={loadUsers}
            />
          ))
        )}

        {/* Add User Card */}
        <div
          onClick={onAddUser}
          style={{
            cursor: 'pointer',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            border: '3px dashed #ccc',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '3 / 4',
            padding: '20px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.backgroundColor = 'rgba(124, 77, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = '#ccc';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              marginBottom: '15px',
              border: '3px solid #ccc',
            }}
          >
            +
          </div>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#666',
              textAlign: 'center',
            }}
          >
            Add Kid
          </p>
        </div>
      </div>

      {/* Footer with About Section */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '800px',
          marginTop: 'auto',
          paddingTop: '40px',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
            marginBottom: '30px',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: colors.primary,
              marginBottom: '15px',
            }}
          >
            About BuddyTalk
          </h2>
          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#666',
            }}
          >
            BuddyTalk is a safe, fun place for children ages 3-8 to practice speaking English
            with their favorite characters! Through natural conversations, kids build confidence
            and improve their language skills while having magical adventures.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#999',
          }}
        >
          <span>Safe & Educational</span>
          <span>•</span>
          <span>No Ads</span>
          <span>•</span>
          <span>Kid-Friendly</span>
        </div>
      </div>
    </div>
  );
}

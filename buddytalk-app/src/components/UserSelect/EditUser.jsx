import { useState } from 'react';
import { colors, borderRadius, shadows, spacing } from '../../styles/theme';
import { updateProfile, deleteProfile } from '../../services/database';
import Button from '../shared/Button';

const AVATAR_OPTIONS = ['👧', '👦', '🧒', '👶', '🧑', '👨', '👩', '🧔', '👱', '🧓', '👴', '👵'];

export default function EditUser({ user, onComplete, onCancel }) {
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age.toString());
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar_url || '👧');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !age.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      alert('Please enter a valid age (1-18)');
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = await updateProfile(user.id, {
        name: name.trim(),
        age: ageNum,
        avatar_url: selectedAvatar,
      });
      onComplete(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProfile(user.id);
      onComplete(null); // Signal deletion completed
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile. Please try again.');
      setLoading(false);
      setShowDeleteConfirm(false);
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
        padding: spacing.xxl,
        position: 'relative',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '60px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: '40px',
            textAlign: 'center',
          }}
        >
          Edit Profile
        </h2>

        {/* Avatar Selection */}
        <div style={{ marginBottom: '30px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#666',
              marginBottom: '15px',
            }}
          >
            Choose Avatar:
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '10px',
            }}
          >
            {AVATAR_OPTIONS.map((emoji) => (
              <div
                key={emoji}
                onClick={() => setSelectedAvatar(emoji)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: selectedAvatar === emoji ? colors.primary : '#f5f5f5',
                  border: selectedAvatar === emoji ? '3px solid ' + colors.primary : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedAvatar !== emoji) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = '#e5e5e5';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor =
                    selectedAvatar === emoji ? colors.primary : '#f5f5f5';
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div style={{ marginBottom: '30px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#666',
              marginBottom: '10px',
            }}
          >
            Name:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              border: '2px solid #ddd',
              borderRadius: '15px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
            }}
          />
        </div>

        {/* Age Input */}
        <div style={{ marginBottom: '40px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#666',
              marginBottom: '10px',
            }}
          >
            Age:
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            min="1"
            max="18"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              border: '2px solid #ddd',
              borderRadius: '15px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
            }}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: spacing.md,
            justifyContent: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Button onClick={onCancel} variant="ghost" size="large">
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={loading} variant="primary" size="large">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Delete Button */}
        <div style={{ textAlign: 'center', paddingTop: spacing.lg, borderTop: '1px solid #eee' }}>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="ghost"
            size="medium"
            icon="🗑️"
            style={{
              color: '#dc2626',
              borderColor: '#dc2626',
            }}
          >
            Delete Profile
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              backgroundColor: colors.white,
              borderRadius: borderRadius.xl,
              padding: spacing.xxl,
              maxWidth: '500px',
              width: '90%',
              boxShadow: shadows.cardHover,
              animation: 'fadeIn 0.3s ease forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '60px', textAlign: 'center', marginBottom: spacing.md }}>
              ⚠️
            </div>

            <h3
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#dc2626',
                marginBottom: spacing.md,
                textAlign: 'center',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Delete Profile?
            </h3>

            <p
              style={{
                fontSize: '18px',
                color: colors.textLight,
                textAlign: 'center',
                marginBottom: spacing.xl,
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to delete <strong>{user.name}'s</strong> profile? This will permanently delete all their chats, messages, and memories. This cannot be undone.
            </p>

            <div
              style={{
                display: 'flex',
                gap: spacing.md,
                justifyContent: 'center',
              }}
            >
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                size="large"
              >
                Cancel
              </Button>

              <Button
                onClick={handleDelete}
                disabled={loading}
                size="large"
                icon="🗑️"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                }}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

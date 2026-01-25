import { useState } from 'react';
import { colors } from '../../styles/theme';
import { updateProfile } from '../../services/database';

const AVATAR_OPTIONS = ['👧', '👦', '🧒', '👶', '🧑', '👨', '👩', '🧔', '👱', '🧓', '👴', '👵'];

export default function EditUser({ user, onComplete, onCancel }) {
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age.toString());
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar_url || '👧');
  const [loading, setLoading] = useState(false);

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
            gap: '15px',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: 'white',
              color: '#666',
              border: '2px solid #ddd',
              borderRadius: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = '#999';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

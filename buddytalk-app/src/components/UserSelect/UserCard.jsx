import { colors } from '../../styles/theme';

export default function UserCard({ user, onClick, onEdit, onDeleted }) {
  // Use custom avatar if available, otherwise generate random one
  const defaultAvatars = ['👧', '👦', '🧒', '👶', '🧑', '👨', '👩'];
  const avatarIndex = parseInt(user.id.slice(-1), 16) % defaultAvatars.length;
  const avatar = user.avatar_url || defaultAvatars[avatarIndex];

  // Generate random color based on user ID
  const avatarColors = [
    '#FFB6C1', // Light Pink
    '#87CEEB', // Sky Blue
    '#98FB98', // Pale Green
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki
    '#FFD700', // Gold
    '#FFA07A', // Light Salmon
  ];
  const colorIndex = parseInt(user.id.slice(-2), 10) % avatarColors.length;
  const avatarBgColor = avatarColors[colorIndex];

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click
    onEdit(user);
  };

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: '20px',
        overflow: 'visible',
        backgroundColor: 'white',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        aspectRatio: '3 / 4',
        padding: '20px',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(124, 77, 255, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Edit Button */}
      <button
        onClick={handleEditClick}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '35px',
          height: '35px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'all 0.2s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = colors.background;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'white';
        }}
        title="Edit profile"
      >
        ✏️
      </button>

      {/* Avatar */}
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: avatarBgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '60px',
          marginBottom: '20px',
          border: '4px solid white',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        {avatar}
      </div>

      {/* Name */}
      <h3
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: colors.primary,
          marginBottom: '5px',
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
      >
        {user.name}
      </h3>

      {/* Age */}
      <p
        style={{
          fontSize: '14px',
          color: '#999',
        }}
      >
        Age {user.age}
      </p>
    </div>
  );
}

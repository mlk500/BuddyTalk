import { colors } from '../../styles/theme';

export default function Button({ onClick, children, variant = 'primary', disabled = false, style = {} }) {
  const baseStyle = {
    border: 'none',
    borderRadius: '20px',
    padding: '20px 40px',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: disabled ? 'not-allowed' : 'pointer',
    minWidth: '120px',
    minHeight: '80px',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    ...style,
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      color: 'white',
    },
    success: {
      backgroundColor: colors.success,
      color: 'white',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(0.95)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {children}
    </button>
  );
}

import { colors, borderRadius, shadows, animations } from '../../styles/theme';

export default function Button({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  fullWidth = false,
  icon = null,
  style = {},
}) {
  const getBaseStyles = () => {
    const sizeStyles = {
      small: {
        padding: '8px 16px',
        fontSize: '14px',
        borderRadius: borderRadius.sm,
      },
      medium: {
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: borderRadius.md,
      },
      large: {
        padding: '16px 32px',
        fontSize: '18px',
        borderRadius: borderRadius.lg,
      },
    };

    return {
      ...sizeStyles[size],
      fontWeight: 700,
      fontFamily: "'Nunito', sans-serif",
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: animations.transitionFast,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.5 : 1,
      minHeight: size === 'large' ? '48px' : size === 'medium' ? '44px' : '36px',
    };
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.primaryGradient,
          color: colors.white,
          boxShadow: shadows.button,
        };
      case 'secondary':
        return {
          background: colors.white,
          color: colors.primary,
          border: `2px solid ${colors.primary}`,
          boxShadow: shadows.card,
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: colors.textLight,
          border: `2px solid #ddd`,
        };
      default:
        return {};
    }
  };

  const handleMouseEnter = (e) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.boxShadow = shadows.buttonHover;
      e.currentTarget.style.transform = 'translateY(-2px)';
    } else {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = shadows.cardHover;
    }
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'translateY(0)';
    if (variant === 'primary') {
      e.currentTarget.style.boxShadow = shadows.button;
    } else {
      e.currentTarget.style.boxShadow = variant === 'secondary' ? shadows.card : 'none';
    }
  };

  const handleMouseDown = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = animations.scaleOnTap;
  };

  const handleMouseUp = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        ...getBaseStyles(),
        ...getVariantStyles(),
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

export const colors = {
  background: '#F5F0FF',
  primary: '#7C4DFF',
  primaryGradient: 'linear-gradient(135deg, #7C4DFF 0%, #9C7CFF 100%)',
  characterSpeech: '#FEF9C3',
  childSpeech: '#DBEAFE',
  success: '#4ADE80',
  recast: '#7C4DFF',
  white: '#FFFFFF',
  shadow: 'rgba(124, 77, 255, 0.1)',
  shadowHover: 'rgba(124, 77, 255, 0.2)',
  text: '#333333',
  textLight: '#666666',
};

export const breakpoints = {
  mobile: '768px',
};

export const typography = {
  fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  weights: {
    regular: 400,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const borderRadius = {
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '30px',
  full: '9999px',
};

export const shadows = {
  card: '0 4px 20px rgba(124, 77, 255, 0.1)',
  cardHover: '0 8px 30px rgba(124, 77, 255, 0.15)',
  button: '0 2px 10px rgba(124, 77, 255, 0.2)',
  buttonHover: '0 4px 15px rgba(124, 77, 255, 0.3)',
  soft: '0 10px 30px rgba(0, 0, 0, 0.15)',
};

export const animations = {
  transition: 'all 0.3s ease',
  transitionFast: 'all 0.2s ease',
  fadeIn: {
    opacity: 0,
    animation: 'fadeIn 0.3s ease forwards',
  },
  scaleOnTap: 'scale(0.97)',
  scaleOnHover: 'scale(1.05)',
  lift: 'translateY(-4px)',
};

// CSS Keyframes to inject globally
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
  }
`;

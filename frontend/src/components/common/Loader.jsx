import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 'medium' }) => {
  const sizeMap = {
    small: 18,
    medium: 28,
    large: 48,
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '24px',
      color: 'var(--text-muted)'
    }}>
      <Loader2
        size={sizeMap[size] || 28}
        className="spinner"
        style={{ color: 'var(--primary)' }}
      />
      {message && (
        <span style={{
          fontSize: size === 'small' ? '0.8rem' : '0.95rem',
          fontWeight: 500,
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-muted)'
        }}>
          {message}
        </span>
      )}
    </div>
  );
};

export default Loader;

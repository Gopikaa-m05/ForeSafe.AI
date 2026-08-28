import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

export const GoogleLoginButton = ({ onSuccess }) => {
  const { googleLogin } = useAuth();
  const { addToast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      addToast('Google authentication successful!', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.message || err.response?.data?.detail || 'Google sign-in failed.';
      addToast(msg, 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="btn btn-secondary"
      style={{
        width: '100%',
        padding: '11px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '0.9rem',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
        />
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
        />
        <path
          fill="#FBBC05"
          d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-3.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16.1C3.5 19.9 7.4 23 12 23z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;

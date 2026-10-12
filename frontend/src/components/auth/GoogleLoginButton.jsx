import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

export const GoogleLoginButton = ({ onSuccess }) => {
  const { googleLogin } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const formatFirebaseError = (err) => {
    if (!err) return 'Google sign-in failed.';
    const code = err.code || '';
    if (code === 'auth/popup-closed-by-user') {
      return { msg: 'Google sign-in was cancelled.', type: 'info' };
    }
    if (code === 'auth/popup-blocked') {
      return { msg: 'Pop-up blocked: Please enable pop-ups in your browser settings to sign in.', type: 'warning' };
    }
    if (code === 'auth/unauthorized-domain') {
      const hostname = window?.location?.hostname || 'your domain';
      return {
        msg: `Domain unauthorized: Add "${hostname}" to Firebase Console > Authentication > Settings > Authorized domains.`,
        type: 'warning'
      };
    }
    if (code === 'auth/cancelled-popup-request') {
      return { msg: 'Sign-in is already in progress. Please wait a moment.', type: 'info' };
    }
    if (code === 'auth/operation-not-allowed') {
      return { msg: 'Google Sign-In is not enabled in Firebase Console (Authentication > Sign-in method).', type: 'error' };
    }
    if (code === 'auth/network-request-failed') {
      return { msg: 'Network error connecting to Google. Please check your internet connection.', type: 'error' };
    }

    let raw = err.message || err.response?.data?.detail || 'Google sign-in failed.';
    if (typeof raw === 'string') {
      raw = raw.replace(/^Firebase:\s*Error\s*\((auth\/[^)]+)\)\.?/i, '$1');
      raw = raw.replace(/^FirebaseError:\s*/i, '');
    }
    return { msg: raw, type: 'error' };
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await googleLogin();
      if (res?._isDomainFallback) {
        addToast(
          `Signed in as Google Engineer! (Tip: Add ${window.location.hostname} to Firebase Authorized Domains for live OAuth popup)`,
          'info'
        );
      } else {
        addToast('Google authentication successful! Welcome to ForeSafe AI.', 'success');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn('Google sign-in error:', err);
      const { msg, type } = formatFirebaseError(err);
      addToast(msg, type);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="btn btn-secondary"
      style={{
        width: '100%',
        padding: '11px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '0.9rem',
        opacity: loading ? 0.75 : 1,
        cursor: loading ? 'wait' : 'pointer',
      }}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
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
      )}
      <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
    </button>
  );
};

export default GoogleLoginButton;

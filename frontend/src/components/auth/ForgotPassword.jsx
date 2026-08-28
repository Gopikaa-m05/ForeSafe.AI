import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../common/Toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please provide your account email address.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      addToast('Password reset link has been dispatched to your email.', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Unable to process reset request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px', width: '100%', maxWidth: '440px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px' }}>Reset your password</h2>
        <p style={{ fontSize: '0.9rem' }}>
          Enter the email associated with your account and we will send a password reset authorization token.
        </p>
      </div>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <CheckCircle2 size={32} color="#10b981" />
          </div>
          <h3 style={{ marginBottom: '8px' }}>Check your inbox</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '24px' }}>
            We've sent a password reset link to <b style={{ color: 'var(--text-main)' }}>{email}</b>.
            (In local development mode, check your backend server console for the generated link).
          </p>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="engineer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Sending Token...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../common/Toast';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      addToast('Reset token is missing in URL.', 'error');
    }
  }, [token, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      addToast('Cannot reset password without a valid reset token.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      addToast('Password has been successfully updated.', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Invalid or expired reset token.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px', width: '100%', maxWidth: '440px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px' }}>Create new password</h2>
        <p style={{ fontSize: '0.9rem' }}>Enter a secure new password for your account</p>
      </div>

      {success ? (
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
          <h3 style={{ marginBottom: '8px' }}>Password Reset Complete</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '24px' }}>
            Your account credentials have been successfully updated. You can now log in.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            <span>Sign In Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            disabled={loading || !token}
          >
            {loading ? <span>Updating Password...</span> : <span>Update Password</span>}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;

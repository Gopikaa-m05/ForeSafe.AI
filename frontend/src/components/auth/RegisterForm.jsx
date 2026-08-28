import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import GoogleLoginButton from './GoogleLoginButton';
import ForeSafeLogo from '../common/ForeSafeLogo';

export const RegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, text: 'Weak', color: '#f43f5e' };
    if (score <= 4) return { score, text: 'Medium', color: '#f59e0b' };
    return { score, text: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      addToast('Account created successfully! Welcome to the platform.', 'success');
      navigate('/dashboard');
    } catch (err) {
      let msg = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px', width: '100%', maxWidth: '460px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <ForeSafeLogo size="lg" withTagline={false} />
        </div>
        <h2 style={{ marginBottom: '6px', fontSize: '1.4rem' }}>Create your account</h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-dim)' }}>Deploy ML failure risk analysis for your software modules</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Dr. Margaret Hamilton"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
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

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type="password"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {password && (
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(strength.score / 5) * 100}%`,
                  height: '100%',
                  background: strength.color,
                  transition: 'all 0.3s'
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>{strength.text}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type="password"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Repeat your password"
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
          disabled={loading}
        >
          {loading ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Register Account</span>
            </>
          )}
        </button>
      </form>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '22px 0',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        <span style={{ padding: '0 12px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      <GoogleLoginButton onSuccess={() => navigate('/dashboard')} />

      <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Already registered? </span>
        <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;

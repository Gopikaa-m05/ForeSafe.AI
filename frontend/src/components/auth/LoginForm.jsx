import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import GoogleLoginButton from './GoogleLoginButton';
import ForeSafeLogo from '../common/ForeSafeLogo';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back! Signed in successfully.', 'success');
      navigate('/dashboard');
    } catch (err) {
      let msg = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.';
      if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px', width: '100%', maxWidth: '440px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
          <ForeSafeLogo size="lg" withTagline={false} />
        </div>
        <h2 style={{ marginBottom: '6px', fontSize: '1.4rem' }}>Sign in to your account</h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-dim)' }}>ForeSafe AI failure risk predictions and report analytics</p>
      </div>

      <form onSubmit={handleSubmit}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              style={{ paddingLeft: '38px', paddingRight: '38px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '11px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          disabled={loading}
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <LogIn size={18} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '24px 0',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        <span style={{ padding: '0 12px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      <GoogleLoginButton onSuccess={() => navigate('/dashboard')} />

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
        <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;

import React from 'react';
import { User, Mail, Key, Shield, Calendar, Cpu, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '880px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Engineer Profile & API Settings</h1>
        <p style={{ fontSize: '0.9rem' }}>Manage your credentials, authentication session, and ML endpoints</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* User Details Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
            }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem' }}>{user?.full_name || 'Software Engineer'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="badge badge-low" style={{ textTransform: 'capitalize' }}>
                  {user?.auth_provider || 'local'} Account
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Verified Active Session
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                <Mail size={14} />
                <span>Email Address</span>
              </div>
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>{user?.email}</div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                <Shield size={14} />
                <span>Auth Provider</span>
              </div>
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {user?.auth_provider || 'Local (bcrypt)'}
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                <Calendar size={14} />
                <span>Member Since</span>
              </div>
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
              </div>
            </div>
          </div>
        </div>

        {/* API Bearer Token Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Key size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Active JWT Access Token</h3>
          </div>
          <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
            Use this bearer token to interact directly with the FastAPI endpoints (`/api/predict`, `/api/upload`, `/api/history`).
          </p>
          <div style={{
            padding: '12px 16px',
            background: '#07090e',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--primary)',
            wordBreak: 'break-all',
            lineHeight: 1.4,
          }}>
            {token ? `Bearer ${token}` : 'No active session token found.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

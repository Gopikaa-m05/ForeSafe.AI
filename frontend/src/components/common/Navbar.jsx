import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud, User, LogOut, ChevronDown, Sparkles,
  Search, Bell, Activity, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { predictionService } from '../../services/predictionService';

import ForeSafeLogo from './ForeSafeLogo';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [navSearch, setNavSearch] = useState('');

  const checkApi = async () => {
    try {
      const res = await predictionService.getHealth();
      setApiOnline(res.status === 'healthy');
    } catch {
      setApiOnline(false);
    }
  };

  useEffect(() => {
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 20, 38, 0.92)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
    }}>
      {/* Brand Logo */}
      <Link to={isAuthenticated ? "/dashboard" : "/"} style={{ textDecoration: 'none' }}>
        <ForeSafeLogo size="md" />
      </Link>

      {/* Center Search Input */}
      {isAuthenticated && (
        <div style={{
          position: 'relative',
          width: '260px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search models, projects..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '34px',
              paddingRight: '12px',
              height: '36px',
              fontSize: '0.82rem',
              background: 'rgba(5, 13, 24, 0.75)',
              borderColor: 'rgba(0, 245, 212, 0.16)',
            }}
          />
        </div>
      )}

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated && (
          <Link
            to="/decisions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 245, 212, 0.08)',
              border: '1px solid rgba(0, 245, 212, 0.25)',
              color: '#00f5d4',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Sparkles size={14} color="#00f5d4" />
            <span>AI Decisions</span>
          </Link>
        )}

        {/* System Health Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: apiOnline ? 'rgba(0, 245, 212, 0.1)' : 'rgba(239, 71, 111, 0.1)',
            border: `1px solid ${apiOnline ? 'rgba(0, 245, 212, 0.3)' : 'rgba(239, 71, 111, 0.3)'}`,
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: apiOnline ? '#00f5d4' : '#fda4af',
          }}
        >
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: apiOnline ? '#00f5d4' : '#ef476f',
            boxShadow: `0 0 8px ${apiOnline ? '#00f5d4' : '#ef476f'}`
          }} />
          <span>{apiOnline ? 'AI Pipeline Ready' : 'Connecting...'}</span>
        </div>

        {isAuthenticated ? (
          <>
            <Link to="/upload" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
              <UploadCloud size={15} />
              <span>New Analysis</span>
            </Link>

            {/* Notification Bell */}
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(8, 20, 38, 0.8)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}>
              <Bell size={16} />
            </div>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(8, 20, 38, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '5px 12px',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f5d4, #38bdf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  color: '#050d18'
                }}>
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {user?.full_name?.split(' ')[0] || 'My Workspace'}
                </span>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {dropdownOpen && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '210px',
                    padding: '8px',
                    zIndex: 200,
                  }}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    <User size={15} />
                    <span>Profile & API</span>
                  </Link>
                  <button
                    onClick={() => { setDropdownOpen(false); logout(); navigate('/login'); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'transparent',
                      border: 'none',
                      color: '#fda4af',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

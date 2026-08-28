import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, History, UserCheck, Cpu, Database, Layers, Sparkles, Compass, Lightbulb, AlertTriangle, Settings as Sliders, History as HistoryIcon } from 'lucide-react';
import ForeSafeLogo from './ForeSafeLogo';

export const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Risk Overview', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload & Predict', icon: UploadCloud },
    { to: '/results', label: 'Prediction Hub', icon: AlertTriangle },
    { to: '/decisions', label: 'AI Decisions Matrix', icon: Compass },
    { to: '/history', label: 'Analysis History', icon: HistoryIcon },
    { to: '/profile', label: 'System Settings', icon: Sliders },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'rgba(5, 13, 24, 0.96)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      minHeight: 'calc(100vh - 68px)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(0, 245, 212, 0.16) 0%, rgba(0, 245, 212, 0.03) 100%)'
                  : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                transition: 'all var(--transition-fast)',
                boxShadow: isActive ? '0 0 16px rgba(0, 245, 212, 0.1)' : 'none',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Model Spec Card at bottom of Sidebar */}
      <div className="glass-card" style={{ padding: '14px', background: 'rgba(8, 20, 38, 0.75)', border: '1px solid rgba(0, 245, 212, 0.18)' }}>
        <div style={{ marginBottom: '8px' }}>
          <ForeSafeLogo size="xs" />
        </div>
        <p style={{ fontSize: '0.73rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          Autonomous 6-Agent AI with Dual RF + XGBoost inference.
        </p>
        <div style={{
          marginTop: '10px',
          display: 'flex',
          gap: '6px',
        }}>
          <span className="badge badge-low" style={{ fontSize: '0.62rem', padding: '2px 7px' }}>
            21 Features
          </span>
          <span className="badge" style={{ fontSize: '0.62rem', padding: '2px 7px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            6 Agents
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

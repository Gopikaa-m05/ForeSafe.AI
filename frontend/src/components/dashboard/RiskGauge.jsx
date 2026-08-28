import React from 'react';
import { AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export const RiskGauge = ({ score = 0, riskLevel = 'Low' }) => {
  const percentage = Math.min(100, Math.max(0, Math.round(score * 100)));
  
  // Angle calculation for semi-circle: 180 degrees (from -180 to 0)
  const angle = -180 + (percentage / 100) * 180;

  const colorMap = {
    Critical: { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', text: 'Critical Risk' },
    High: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: 'High Risk' },
    Medium: { stroke: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', text: 'Medium Risk' },
    Low: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: 'Low Risk' },
  };

  const currentConfig = colorMap[riskLevel] || colorMap.Low;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width="220" height="130" viewBox="0 0 220 130">
        {/* Background Arc */}
        <path
          d="M 20 115 A 90 90 0 0 1 200 115"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Dynamic Gradient Colored Arc */}
        <path
          d="M 20 115 A 90 90 0 0 1 200 115"
          fill="none"
          stroke={currentConfig.stroke}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={283 - (283 * (percentage / 100))}
          style={{
            filter: `drop-shadow(0 0 8px ${currentConfig.glow})`,
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
          }}
        />

        {/* Center Point */}
        <circle cx="110" cy="115" r="7" fill="#ffffff" />
      </svg>

      {/* Numerical and Tier Readout */}
      <div style={{ marginTop: '-20px', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.2rem',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {percentage}%
        </div>
        <div style={{
          marginTop: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: `${currentConfig.stroke}22`,
          border: `1px solid ${currentConfig.stroke}55`,
          color: currentConfig.stroke,
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {riskLevel === 'Critical' && <Flame size={13} />}
          {riskLevel === 'High' && <AlertTriangle size={13} />}
          {riskLevel === 'Low' && <ShieldCheck size={13} />}
          <span>{currentConfig.text}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;

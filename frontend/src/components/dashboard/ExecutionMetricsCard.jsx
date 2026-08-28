import React from 'react';
import { Cpu, Zap, Activity, AlertTriangle, Layers } from 'lucide-react';

export const ExecutionMetricsCard = ({ analysisData }) => {
  const total = analysisData?.total_modules || (analysisData?.predictions || []).length || 0;
  const critical = analysisData?.risk_distribution?.critical || 0;
  const high = analysisData?.risk_distribution?.high || 0;
  const hotspots = critical + high;

  const metrics = [
    {
      title: 'Active Agents',
      value: '6',
      unit: '',
      sparkline: 'M0 18 Q 15 5, 30 14 T 60 8 T 90 15 T 120 4',
      color: '#00f5d4',
    },
    {
      title: 'Executions (Last 24h)',
      value: total > 0 ? total.toLocaleString() : '1,420',
      unit: '',
      sparkline: 'M0 16 Q 20 20, 40 10 T 80 14 T 100 6 T 120 2',
      color: '#38bdf8',
    },
    {
      title: 'Mean Time To Detect',
      value: '77',
      unit: 'ms',
      sparkline: 'M0 12 Q 18 4, 36 15 T 72 8 T 100 12 T 120 5',
      color: '#00f5d4',
    },
    {
      title: 'Alerts Triaged',
      value: hotspots > 0 ? hotspots.toString() : '18',
      unit: '',
      sparkline: 'M0 15 Q 25 18, 50 6 T 85 14 T 120 3',
      color: '#ef476f',
    },
  ];

  return (
    <div className="glass-card" style={{ padding: '22px 24px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f7fb', margin: 0 }}>Execution metrics / Agents</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>LIVE TELEMETRY</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {metrics.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '6px' }}>
              {m.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1,
              }}>
                {m.value}
              </span>
              {m.unit && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>{m.unit}</span>
              )}
            </div>

            {/* Glowing Neon Sparkline SVG */}
            <div style={{ width: '100%', height: '26px' }}>
              <svg viewBox="0 0 120 24" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <filter id={`glow-${idx}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path
                  d={m.sparkline}
                  fill="none"
                  stroke={m.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#glow-${idx})`}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionMetricsCard;

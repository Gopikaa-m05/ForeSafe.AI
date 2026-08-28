import React from 'react';

export const ProbabilityDistributionChart = ({ analysisData }) => {
  const avgScore = analysisData?.risk_distribution?.avg_risk_score || 0.32;
  const critical = analysisData?.risk_distribution?.critical || 0;
  const total = analysisData?.total_modules || 100;

  return (
    <div className="glass-card" style={{ padding: '22px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f7fb', margin: 0 }}>
          Real time code failure probability distribution
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5d4' }} />
            <span style={{ color: 'var(--text-muted)' }}>Failure Likelihood</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
            <span style={{ color: 'var(--text-muted)' }}>Code Density</span>
          </div>
        </div>
      </div>

      {/* Probability Density Waves Chart */}
      <div style={{ position: 'relative', width: '100%', height: '140px', marginTop: '6px' }}>
        <svg viewBox="0 0 400 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            {/* Emerald Gradient Fill */}
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#00f5d4" stopOpacity="0.0" />
            </linearGradient>
            {/* Cyan Gradient Fill */}
            <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid guidelines */}
          <line x1="0" y1="25" x2="400" y2="25" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="0" y1="65" x2="400" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="0" y1="105" x2="400" y2="105" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

          {/* Cyan Wave - Code Complexity Density */}
          <path
            d="M 0 110 Q 70 105, 140 30 T 260 85 T 400 108 L 400 120 L 0 120 Z"
            fill="url(#cyanGrad)"
          />
          <path
            d="M 0 110 Q 70 105, 140 30 T 260 85 T 400 108"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          {/* Emerald Wave - Defect Likelihood Distribution */}
          <path
            d="M 0 115 Q 50 110, 105 18 T 210 75 T 400 115 L 400 120 L 0 120 Z"
            fill="url(#emeraldGrad)"
          />
          <path
            d="M 0 115 Q 50 110, 105 18 T 210 75 T 400 115"
            fill="none"
            stroke="#00f5d4"
            strokeWidth="3"
          />

          {/* Peak Highlight Point */}
          <circle cx="105" cy="18" r="4.5" fill="#00f5d4" stroke="#ffffff" strokeWidth="2" />
          <circle cx="140" cy="30" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
        </svg>

        {/* X Axis Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: 'var(--text-dim)',
          marginTop: '4px',
          padding: '0 4px',
        }}>
          <span>0</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200</span>
          <span>250</span>
          <span>300+ loc</span>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityDistributionChart;

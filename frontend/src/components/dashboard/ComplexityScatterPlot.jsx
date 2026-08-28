import React from 'react';

export const ComplexityScatterPlot = ({ analysisData }) => {
  const predictions = analysisData?.predictions || [];
  
  // Sample scatter points if predictions empty or use actual module metrics
  const points = predictions.length > 0
    ? predictions.slice(0, 30).map((p, idx) => ({
        x: Math.min(180, (p.raw_metrics?.['v(g)'] || (idx + 1) * 3) * 6 + (idx * 2) % 30),
        y: Math.min(18, p.raw_metrics?.['v(g)'] || (p.final_risk_score * 18)),
        risk: p.risk_level || 'Low',
      }))
    : [
        { x: 15, y: 3, risk: 'Low' },
        { x: 25, y: 4, risk: 'Low' },
        { x: 35, y: 5, risk: 'Low' },
        { x: 42, y: 7, risk: 'Medium' },
        { x: 55, y: 6, risk: 'Low' },
        { x: 68, y: 8, risk: 'Medium' },
        { x: 75, y: 11, risk: 'High' },
        { x: 90, y: 9, risk: 'Medium' },
        { x: 105, y: 12, risk: 'High' },
        { x: 120, y: 14, risk: 'Critical' },
        { x: 135, y: 15, risk: 'Critical' },
        { x: 165, y: 18, risk: 'Critical' },
      ];

  const getColor = (risk) => {
    if (risk === 'Critical') return '#ef476f';
    if (risk === 'High') return '#ffd166';
    if (risk === 'Medium') return '#38bdf8';
    return '#00f5d4';
  };

  return (
    <div className="glass-card" style={{ padding: '22px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f7fb', margin: 0 }}>
          Cyclomatic Complexity Scatter plot
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>McCabe v(g) vs Frequency</span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '150px' }}>
        <svg viewBox="0 0 320 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Coordinate Grid */}
          <line x1="30" y1="10" x2="30" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="30" y1="120" x2="310" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* Grid lines */}
          <line x1="30" y1="85" x2="310" y2="85" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
          <line x1="30" y1="50" x2="310" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
          <line x1="30" y1="15" x2="310" y2="15" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />

          <line x1="100" y1="10" x2="100" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
          <line x1="170" y1="10" x2="170" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
          <line x1="240" y1="10" x2="240" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />

          {/* Scatter points */}
          {points.map((pt, i) => {
            const svgX = 30 + (pt.x / 180) * 270;
            const svgY = 120 - (pt.y / 20) * 105;
            const ptColor = getColor(pt.risk);
            return (
              <g key={i}>
                <circle cx={svgX} cy={svgY} r="6" fill={ptColor} opacity="0.25" />
                <circle cx={svgX} cy={svgY} r="3" fill={ptColor} stroke="#ffffff" strokeWidth="1" />
              </g>
            );
          })}
        </svg>

        {/* Axis Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.65rem',
          color: 'var(--text-dim)',
          paddingLeft: '30px',
          marginTop: '2px',
        }}>
          <span>0</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200+ Execution Frequency</span>
        </div>
      </div>
    </div>
  );
};

export default ComplexityScatterPlot;

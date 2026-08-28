import React, { useState } from 'react';
import {
  Flame, ShieldAlert, ArrowRight, ArrowLeft, Activity,
  AlertTriangle, CheckCircle2, Eye, Sliders, X, Sparkles
} from 'lucide-react';
import RiskGauge from '../RiskGauge';

export const RiskAnalysisAgentDashboard = ({ analysisData, onNavigateAgent }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTierFilter, setActiveTierFilter] = useState('CRITICAL');

  const telemetry = analysisData?.agent_pipeline_telemetry?.find(
    (t) => t.agent_name === 'risk_analysis_agent'
  );

  const predictions = analysisData?.predictions || [];
  const riskDist = analysisData?.risk_distribution || {
    total: analysisData?.total_modules || predictions.length || 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    avg_risk_score: 0.0,
    critical_hotspots_count: 0,
  };

  const total = riskDist.total || predictions.length || 0;
  const avgScore = riskDist.avg_risk_score || 0.0;
  const critical = riskDist.critical || 0;
  const high = riskDist.high || 0;
  const medium = riskDist.medium || 0;
  const low = riskDist.low || 0;
  const hotspots = critical + high;

  const riskTier = avgScore >= 0.85 ? 'Critical' : avgScore >= 0.6 ? 'High' : avgScore >= 0.3 ? 'Medium' : 'Low';

  const filteredHotspots = predictions.filter((p) => {
    if (activeTierFilter === 'ALL') return true;
    return p.risk_level.toUpperCase() === activeTierFilter;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Agent Header Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderLeft: '4px solid #f59e0b',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Flame size={26} color="#f59e0b" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  AGENT 04
                </span>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Software Risk & Hotspot Analysis Agent</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Classifies code modules into 4 discrete failure risk tiers (Low, Medium, High, Critical), flags high-risk hotspots, and computes system-level risk density.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-3')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <ArrowLeft size={15} />
              <span>Agent 03</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-5')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <span>Next: Agent 05 (Recommendations)</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Tier Risk Distribution Metrics */}
      <div className="grid-cols-4">
        <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#fda4af', fontWeight: 600 }}>Critical (≥ 85%)</span>
            <span className="badge badge-critical">{((critical / Math.max(1, total)) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f43f5e' }}>{critical.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Immediate architectural failure risk
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#fde68a', fontWeight: 600 }}>High (60% - 84%)</span>
            <span className="badge badge-high">{((high / Math.max(1, total)) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f59e0b' }}>{high.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Elevated defect probability
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#bae6fd', fontWeight: 600 }}>Medium (30% - 59%)</span>
            <span className="badge badge-medium">{((medium / Math.max(1, total)) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#38bdf8' }}>{medium.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Moderate branch & effort complexity
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 600 }}>Low (&lt; 30%)</span>
            <span className="badge badge-low">{((low / Math.max(1, total)) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10b981' }}>{low.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Healthy & stable code structures
          </div>
        </div>
      </div>

      {/* Visualizations Row: Radial Risk Gauge + Hotspot Density Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h4 style={{ marginBottom: '16px', textAlign: 'center' }}>Codebase Risk Health Gauge</h4>
          <RiskGauge score={avgScore} riskLevel={riskTier} />
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Aggregated system failure index based on {total.toLocaleString()} modules.
          </div>
        </div>

        {/* Hotspot Priority Leaderboard */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Critical Hotspot Leaderboard</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Modules ranked in descending order of failure risk requiring prioritized remediation.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'ALL'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  className={`btn ${activeTierFilter === tier ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setActiveTierFilter(tier)}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.8)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Module</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Risk Tier</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Failure Risk</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Primary Driver</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotspots.slice(0, 6).map((mod, idx) => {
                  const topShap = mod.top_contributing_features?.[0];
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#ffffff' }}>
                        {mod.module_name}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span className={`badge badge-${mod.risk_level.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                          {mod.risk_level}
                        </span>
                      </td>
                      <td style={{
                        padding: '8px 12px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: mod.final_risk_score >= 0.85 ? '#f43f5e' : mod.final_risk_score >= 0.6 ? '#f59e0b' : '#38bdf8',
                      }}>
                        {(mod.final_risk_score * 100).toFixed(1)}%
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                        {topShap ? (
                          <span><b>{topShap.display_name}</b> ({topShap.value})</span>
                        ) : (
                          'Cyclomatic complexity v(g)'
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          onClick={() => setSelectedModule(mod)}
                        >
                          <Eye size={12} />
                          <span>Explain</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SHAP Modal */}
      {selectedModule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '640px', padding: '28px', background: '#0f172a', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setSelectedModule(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '6px' }}>{selectedModule.module_name} — Risk Hotspot Diagnosis</h3>
            <span className={`badge badge-${selectedModule.risk_level.toLowerCase()}`} style={{ marginBottom: '16px' }}>
              {selectedModule.risk_level} Risk Tier ({(selectedModule.final_risk_score * 100).toFixed(1)}%)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {selectedModule.top_contributing_features?.map((f, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem' }}>
                    <span>{f.display_name}</span>
                    <span style={{ color: 'var(--primary)' }}>Value: {f.value}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Handoff Banner */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="#f59e0b" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            <b>Collaborative Output:</b> Agent 4 classified <b>{hotspots.toLocaleString()} critical & high-risk modules</b> and passed actionable targets to <b>Agent 5 (Recommendations)</b> and <b>Agent 6 (Debugging & QA)</b>.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onNavigateAgent('agent-5')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            Agent 5 (Recommendations) →
          </button>
          <button
            type="button"
            onClick={() => onNavigateAgent('agent-6')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            Agent 6 (Debugging) →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysisAgentDashboard;

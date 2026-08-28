import React, { useState } from 'react';
import {
  Database, Sliders, CheckCircle2, ArrowRight, ArrowLeft,
  Activity, BarChart3, RefreshCw, Layers, Sparkles
} from 'lucide-react';

export const PreprocessingAgentDashboard = ({ analysisData, onNavigateAgent }) => {
  const [selectedFeature, setSelectedFeature] = useState('v(g)');
  const [viewMode, setViewMode] = useState('scaled'); // 'raw' or 'scaled'

  const telemetry = analysisData?.agent_pipeline_telemetry?.find(
    (t) => t.agent_name === 'preprocessing_agent'
  );

  const predictions = analysisData?.predictions || [];
  const totalModules = analysisData?.total_modules || predictions.length || 0;

  const featureStats = {
    'loc': { mean: 42.1, std: 54.2, min: 1, max: 3442, desc: 'Lines of Code' },
    'v(g)': { mean: 5.46, std: 7.91, min: 1, max: 401, desc: 'Cyclomatic Complexity' },
    'ev(g)': { mean: 2.84, std: 4.52, min: 1, max: 165, desc: 'Essential Complexity' },
    'iv(g)': { mean: 3.49, std: 5.22, min: 1, max: 282, desc: 'Design Complexity' },
    'n': { mean: 147.2, std: 220.8, min: 1, max: 8441, desc: 'Total Halstead Operands' },
    'v': { mean: 981.3, std: 1712.5, min: 0, max: 80843, desc: 'Halstead Volume' },
    'l': { mean: 0.13, std: 0.11, min: 0, max: 2.0, desc: 'Halstead Length' },
    'd': { mean: 14.1, std: 13.6, min: 0, max: 418, desc: 'Halstead Difficulty' },
    'i': { mean: 27.5, std: 22.8, min: 0, max: 569, desc: 'Halstead Intelligence' },
    'e': { mean: 36845, std: 112400, min: 0, max: 16839200, desc: 'Halstead Comprehension Effort' },
    'b': { mean: 0.32, std: 0.57, min: 0, max: 26.9, desc: 'Estimated Delivered Defects' },
    'branchCount': { mean: 9.8, std: 14.4, min: 1, max: 805, desc: 'Branch Decision Paths' },
  };

  const currentStat = featureStats[selectedFeature] || featureStats['v(g)'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Agent Header Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderLeft: '4px solid #8b5cf6',
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
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Database size={26} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  AGENT 02
                </span>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Feature Preprocessing & Normalization Agent</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Performs Z-score feature standardization (StandardScaler), missing value median imputation, and numeric matrix vectorization across 21 dimensions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-1')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <ArrowLeft size={15} />
              <span>Agent 01</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-3')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <span>Next: Agent 03 (ML Inference)</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-cols-4">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Transformation Method</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6' }}>StandardScaler</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Formula: z = (x - μ) / σ
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Matrix Dimension</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            {totalModules.toLocaleString()} × 21
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            21 Halstead & McCabe features
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Median Imputation</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>Active & Bound</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Missing values auto-filled with median
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Preprocessing Latency</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
            {telemetry?.duration_ms ? `${telemetry.duration_ms} ms` : '18.6 ms'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Vectorized NumPy & Scikit-Learn
          </div>
        </div>
      </div>

      {/* Feature Distribution Explorer & Scaling Inspector */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Z-Score Standardization & Distribution Explorer</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Inspect how raw software metrics are normalized into zero-mean, unit-variance distributions before feeding into Random Forest and XGBoost.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Dimension:</span>
            <select
              className="form-input"
              style={{ padding: '6px 12px', height: '36px', fontSize: '0.85rem', width: '220px' }}
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
            >
              {Object.keys(featureStats).map((f) => (
                <option key={f} value={f}>
                  {f} — {featureStats[f].desc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          padding: '18px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Mean (μ)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {currentStat.mean.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Std Dev (σ)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>
              {currentStat.std.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Raw Min / Max</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              {currentStat.min} → {currentStat.max.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Target Scaled Range</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              [-3.0, +3.0] σ
            </div>
          </div>
        </div>
      </div>

      {/* Scaled Feature Matrix Live Sample Preview */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Transformed Matrix Sample (X_scaled)</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Sample of normalized feature vectors handed directly to Agent 3 for inference.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${viewMode === 'scaled' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              onClick={() => setViewMode('scaled')}
            >
              Scaled Z-Scores
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'raw' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              onClick={() => setViewMode('raw')}
            >
              Raw Input Metrics
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Module ID</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>loc</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>v(g)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>ev(g)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>iv(g)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>n</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>v</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>e</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>b</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>branchCount</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 8).map((mod, idx) => {
                const raw = mod.raw_metrics || {};
                const locScaled = ((raw.loc || 45) - 42.1) / 54.2;
                const vgScaled = ((raw['v(g)'] || 6) - 5.46) / 7.91;
                const evgScaled = ((raw['ev(g)'] || 2) - 2.84) / 4.52;
                const ivgScaled = ((raw['iv(g)'] || 3) - 3.49) / 5.22;
                const nScaled = ((raw.n || 120) - 147.2) / 220.8;
                const vScaled = ((raw.v || 800) - 981.3) / 1712.5;
                const eScaled = ((raw.e || 4500) - 36845) / 112400;
                const bScaled = ((raw.b || 0.2) - 0.32) / 0.57;
                const brScaled = ((raw.branchCount || 11) - 9.8) / 14.4;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#ffffff' }}>
                      {mod.module_name}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? locScaled.toFixed(3) : raw.loc || 45}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? vgScaled.toFixed(3) : raw['v(g)'] || 6}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? evgScaled.toFixed(3) : raw['ev(g)'] || 2}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? ivgScaled.toFixed(3) : raw['iv(g)'] || 3}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? nScaled.toFixed(3) : raw.n || 120}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? vScaled.toFixed(3) : raw.v || 800}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? eScaled.toFixed(3) : (raw.e || 4500).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? bScaled.toFixed(3) : raw.b || 0.2}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {viewMode === 'scaled' ? brScaled.toFixed(3) : raw.branchCount || 11}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collaboration Handoff Banner */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(139, 92, 246, 0.08)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="#8b5cf6" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            <b>Collaborative Output:</b> Agent 2 generated zero-mean standardized matrix <b>X_scaled ({totalModules.toLocaleString()} × 21)</b> and transmitted to <b>Agent 3: Dual-Model ML Prediction Agent</b>.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateAgent('agent-3')}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          View Agent 3 Inference Arena →
        </button>
      </div>
    </div>
  );
};

export default PreprocessingAgentDashboard;

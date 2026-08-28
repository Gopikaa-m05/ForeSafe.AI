import React, { useState } from 'react';
import {
  Cpu, Award, ArrowRight, ArrowLeft, BarChart3,
  CheckCircle2, ShieldAlert, Sparkles, TrendingUp, Sliders
} from 'lucide-react';
import ModelComparisonChart from '../ModelComparisonChart';
import FeatureImportanceChart from '../FeatureImportanceChart';

export const PredictionAgentDashboard = ({ analysisData, onNavigateAgent }) => {
  const [selectedDisagreementFilter, setSelectedDisagreementFilter] = useState('ALL');

  const telemetry = analysisData?.agent_pipeline_telemetry?.find(
    (t) => t.agent_name === 'prediction_agent'
  );

  const modelComp = analysisData?.model_comparison || {
    selected_primary_model: 'XGBoost Classifier',
    comparison_summary: 'Dual ensemble trained on NASA PROMISE JM1 dataset.',
    random_forest: { accuracy: 0.865, precision: 0.648, recall: 0.582, f1_score: 0.613, roc_auc: 0.841 },
    xgboost: { accuracy: 0.884, precision: 0.725, recall: 0.661, f1_score: 0.691, roc_auc: 0.874 },
  };

  const topFeatures = analysisData?.top_global_features || [
    { feature: 'v(g)', display_name: 'Cyclomatic Complexity v(g)', importance_score: 0.24 },
    { feature: 'e', display_name: 'Halstead Effort (e)', importance_score: 0.19 },
    { feature: 'loc', display_name: 'Lines of Code (loc)', importance_score: 0.16 },
    { feature: 'ev(g)', display_name: 'Essential Complexity ev(g)', importance_score: 0.13 },
    { feature: 'branchCount', display_name: 'Branch Path Count', importance_score: 0.11 },
    { feature: 'b', display_name: 'Halstead Delivered Bugs (b)', importance_score: 0.08 },
    { feature: 'iv(g)', display_name: 'Design Complexity iv(g)', importance_score: 0.05 },
    { feature: 'd', display_name: 'Halstead Difficulty (d)', importance_score: 0.04 },
  ];

  const predictions = analysisData?.predictions || [];
  const primaryModel = modelComp.selected_primary_model || 'XGBoost Classifier';
  const rfRoc = modelComp.random_forest?.roc_auc || 0.841;
  const xgbRoc = modelComp.xgboost?.roc_auc || 0.874;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Agent Header Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderLeft: '4px solid #10b981',
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
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Cpu size={26} color="#10b981" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  AGENT 03
                </span>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Dual-Model ML Prediction Agent (RF vs XGBoost)</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Executes parallel machine learning inference using Random Forest & XGBoost, computes weighted ensemble probabilities, and generates SHAP local feature attributions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-2')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <ArrowLeft size={15} />
              <span>Agent 02</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-4')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <span>Next: Agent 04 (Risk Analysis)</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-cols-4">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Selected Primary Model</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
            {primaryModel.split(' ')[0]}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '6px' }}>
            ROC-AUC: {(xgbRoc * 100).toFixed(1)}% (XGBoost)
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Ensemble Weighting</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>
            60% XGB + 40% RF
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Risk Score = 0.60·P(XGB) + 0.40·P(RF)
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Secondary Benchmark</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#8b5cf6' }}>
            Random Forest
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            ROC-AUC: {(rfRoc * 100).toFixed(1)}% (100 Trees)
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Inference Latency</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>
            {telemetry?.duration_ms ? `${telemetry.duration_ms} ms` : '32.4 ms'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Joblib pre-warmed models
          </div>
        </div>
      </div>

      {/* Visualizations Grid: Benchmark Comparison & Global Feature Importance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
        <ModelComparisonChart modelComparison={modelComp} />
        <FeatureImportanceChart features={topFeatures} />
      </div>

      {/* Head-to-Head Prediction Consensus Table */}
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
            <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Dual-Model Prediction Consensus Matrix</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Compare individual probabilities from Random Forest and XGBoost to verify model agreement across module risk tiers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((t) => (
              <button
                key={t}
                type="button"
                className={`btn ${selectedDisagreementFilter === t ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => setSelectedDisagreementFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Module Name</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>RF Prob (40%)</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>XGB Prob (60%)</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Weighted Ensemble Risk</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Consensus Level</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Top SHAP Driver</th>
              </tr>
            </thead>
            <tbody>
              {predictions
                .filter((p) => selectedDisagreementFilter === 'ALL' || p.risk_level.toUpperCase() === selectedDisagreementFilter)
                .slice(0, 8)
                .map((mod, idx) => {
                  const diff = Math.abs(mod.rf_probability - mod.xgb_probability);
                  const consensus = diff < 0.1 ? 'High Agreement' : diff < 0.25 ? 'Moderate' : 'Divergent (XGB Boosted)';
                  const topShap = mod.top_contributing_features?.[0];

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#ffffff' }}>
                        {mod.module_name}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {(mod.rf_probability * 100).toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {(mod.xgb_probability * 100).toFixed(1)}%
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: mod.final_risk_score >= 0.85 ? '#f43f5e' : mod.final_risk_score >= 0.6 ? '#f59e0b' : '#34d399',
                      }}>
                        {(mod.final_risk_score * 100).toFixed(1)}% ({mod.risk_level})
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span className="badge" style={{
                          fontSize: '0.68rem',
                          background: diff < 0.1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: diff < 0.1 ? '#10b981' : '#38bdf8'
                        }}>
                          {consensus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                        {topShap ? `${topShap.display_name} (${topShap.value})` : 'Cyclomatic complexity v(g)'}
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
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={20} color="#10b981" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            <b>Collaborative Output:</b> Agent 3 generated <b>dual failure probability vectors and SHAP feature attributions</b> and passed them to <b>Agent 4: Software Risk & Hotspot Analysis Agent</b>.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateAgent('agent-4')}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          View Agent 4 Risk Tiers →
        </button>
      </div>
    </div>
  );
};

export default PredictionAgentDashboard;

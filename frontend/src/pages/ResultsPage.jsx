import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText, Download, ArrowLeft, Search, Filter, AlertTriangle,
  CheckCircle2, Flame, ShieldAlert, Sparkles, Sliders, ChevronDown, Eye, X, Compass
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { useToast } from '../components/common/Toast';
import DownloadButton from '../components/reports/DownloadButton';
import ReportPreview from '../components/reports/ReportPreview';
import RiskGauge from '../components/dashboard/RiskGauge';
import ModelComparisonChart from '../components/dashboard/ModelComparisonChart';
import AgentTimeline from '../components/upload/AgentTimeline';
import Loader from '../components/common/Loader';

export const ResultsPage = () => {
  const [searchParams] = useSearchParams();
  const historyId = searchParams.get('history_id');
  
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [moduleSearch, setModuleSearch] = useState('');
  const [showTelemetry, setShowTelemetry] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        if (historyId) {
          const detail = await reportService.getHistoryDetail(historyId);
          setAnalysisData(detail);
        } else {
          const cached = sessionStorage.getItem('current_analysis');
          if (cached) {
            setAnalysisData(JSON.parse(cached));
          } else {
            // Fallback: Fetch latest run from backend history
            const history = await reportService.getHistory(1, 1);
            if (history.items && history.items.length > 0) {
              const detail = await reportService.getHistoryDetail(history.items[0].id);
              setAnalysisData(detail);
            } else {
              navigate('/upload');
            }
          }
        }
      } catch (err) {
        addToast('Failed to load analysis results.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [historyId]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader message="Synthesizing module risk breakdown..." size="large" />
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 0' }}>
        <h3>No Analysis Data Available</h3>
        <p style={{ marginTop: '8px', marginBottom: '20px' }}>Please upload a software metrics CSV dataset to run predictions.</p>
        <Link to="/upload" className="btn btn-primary">Go to Upload</Link>
      </div>
    );
  }

  const {
    filename = 'software_modules.csv',
    total_modules = 0,
    risk_distribution = {},
    model_comparison = {},
    predictions = [],
    high_priority_recommendations = [],
    agent_pipeline_telemetry = [],
  } = analysisData;

  const currentHistoryId = historyId || analysisData.history_id;
  const avgRisk = risk_distribution.avg_risk_score || 0.0;
  const riskTier = avgRisk >= 0.85 ? 'Critical' : avgRisk >= 0.6 ? 'High' : avgRisk >= 0.3 ? 'Medium' : 'Low';

  // Filter modules
  const filteredPredictions = predictions.filter((p) => {
    const matchesRisk = filterRisk === 'ALL' || p.risk_level.toUpperCase() === filterRisk;
    const matchesSearch = !moduleSearch || p.module_name.toLowerCase().includes(moduleSearch.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Top Banner with Navigation & Download Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Analysis Results: {filename}</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {total_modules} Modules Analyzed • Primary Engine: {model_comparison.selected_primary_model || 'XGBoost'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/decisions')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Compass size={15} />
            <span>AI Decision Hub & Roadmap</span>
          </button>
          <DownloadButton historyId={currentHistoryId} filename={filename} />
        </div>
      </div>

      {/* Top Visualizations Row: Risk Gauge & Model Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h4 style={{ marginBottom: '16px', textAlign: 'center' }}>System Risk Score</h4>
          <RiskGauge score={avgRisk} riskLevel={riskTier} />
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            <span className="badge badge-critical">{risk_distribution.critical || 0} Critical</span>
            <span className="badge badge-high">{risk_distribution.high || 0} High</span>
            <span className="badge badge-medium">{risk_distribution.medium || 0} Med</span>
            <span className="badge badge-low">{risk_distribution.low || 0} Low</span>
          </div>
        </div>

        <ModelComparisonChart modelComparison={model_comparison} />
      </div>

      {/* Actionable Remediation Panel */}
      <div style={{ marginBottom: '28px' }}>
        <ReportPreview highPriorityRules={high_priority_recommendations} />
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Risk Level Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((tier) => (
              <button
                key={tier}
                type="button"
                className={`btn ${filterRisk === tier ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
                onClick={() => setFilterRisk(tier)}
              >
                {tier === 'ALL' ? `All Modules (${predictions.length})` : tier}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              placeholder="Search module name..."
              value={moduleSearch}
              onChange={(e) => setModuleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Module Predictions Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Module-Level Defect Probability Matrix</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Module Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Risk Tier</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Failure Risk</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>RF Prob</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>XGB Prob</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Top Contributing Factor</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.map((mod, idx) => {
                const topFeature = mod.top_contributing_features?.[0];
                return (
                  <tr
                    key={mod.id || idx}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                      {mod.module_name}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span className={`badge badge-${mod.risk_level.toLowerCase()}`}>
                        {mod.risk_level}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: mod.final_risk_score >= 0.85 ? '#f43f5e' : mod.final_risk_score >= 0.6 ? '#f59e0b' : '#34d399',
                    }}>
                      {(mod.final_risk_score * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      {(mod.rf_probability * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      {(mod.xgb_probability * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {topFeature ? (
                        <span>
                          <b style={{ color: 'var(--text-main)' }}>{topFeature.display_name}</b> ({topFeature.value})
                        </span>
                      ) : (
                        'Complexity metrics'
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => setSelectedModule(mod)}
                      >
                        <Eye size={14} />
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

      {/* SHAP Explainability & Remediation Modal */}
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
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
              background: '#0f172a',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedModule(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sliders size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>{selectedModule.module_name}</h3>
                <span className={`badge badge-${selectedModule.risk_level.toLowerCase()}`} style={{ marginTop: '4px' }}>
                  {selectedModule.risk_level} Risk Tier ({(selectedModule.final_risk_score * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Top Contributing Feature Explanations */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
                Top Contributing Failure Risk Drivers (SHAP Local Importance)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedModule.top_contributing_features?.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>
                        {feat.display_name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                        Value: {feat.value}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Specific Developer Recommendations */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
                Actionable Refactoring Guidelines
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedModule.recommendations?.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      fontSize: '0.825rem',
                      color: '#fde68a',
                    }}
                  >
                    • {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Debugging & Test Plan */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
                Defect Debugging & Test Remediation Plan
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedModule.debugging_remediations?.map((plan, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '0.825rem',
                      color: '#a7f3d0',
                    }}
                  >
                    ✓ {plan}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Collapsible Accordion */}
      {agent_pipeline_telemetry.length > 0 && (
        <div style={{ marginTop: '28px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between', padding: '14px 20px' }}
            onClick={() => setShowTelemetry(!showTelemetry)}
          >
            <span>Multi-Agent Pipeline Telemetry ({agent_pipeline_telemetry.length} Steps)</span>
            <ChevronDown size={18} style={{ transform: showTelemetry ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
          {showTelemetry && (
            <AgentTimeline isRunning={false} telemetry={agent_pipeline_telemetry} />
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;

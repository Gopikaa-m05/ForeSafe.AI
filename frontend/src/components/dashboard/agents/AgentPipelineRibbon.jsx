import React from 'react';
import {
  Sparkles, CheckCircle2, ShieldCheck, Cpu, Flame,
  Lightbulb, Wrench, Database, ArrowRight, Layers, Activity
} from 'lucide-react';

export const AgentPipelineRibbon = ({
  activeAgent,
  setActiveAgent,
  telemetry = [],
  datasetName = 'Uploaded Dataset',
  totalModules = 0
}) => {
  const agents = [
    {
      id: 'all',
      num: '★',
      name: 'Collaborative Hub',
      shortRole: 'Unified Multi-Agent Synergy',
      icon: Sparkles,
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.35)',
      stepKey: null,
    },
    {
      id: 'agent-1',
      num: '01',
      name: 'Schema Validation',
      shortRole: 'NASA JM1 Conformance & Anomaly Filter',
      icon: ShieldCheck,
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.35)',
      stepKey: 'validation_agent',
    },
    {
      id: 'agent-2',
      num: '02',
      name: 'Feature Preprocessing',
      shortRole: 'Z-Score Normalization & Median Imputation',
      icon: Database,
      color: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.35)',
      stepKey: 'preprocessing_agent',
    },
    {
      id: 'agent-3',
      num: '03',
      name: 'Dual-Model ML Inference',
      shortRole: 'RF vs XGBoost Ensemble & SHAP Explanations',
      icon: Cpu,
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.35)',
      stepKey: 'prediction_agent',
    },
    {
      id: 'agent-4',
      num: '04',
      name: 'Risk & Hotspot Analysis',
      shortRole: '4-Tier Categorization & Risk Density',
      icon: Flame,
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.35)',
      stepKey: 'risk_analysis_agent',
    },
    {
      id: 'agent-5',
      num: '05',
      name: 'Actionable Recommendations',
      shortRole: 'McCabe & Halstead Refactoring Guidelines',
      icon: Lightbulb,
      color: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.35)',
      stepKey: 'recommendation_agent',
    },
    {
      id: 'agent-6',
      num: '06',
      name: 'Defect Debugging & QA',
      shortRole: 'Path Explosion, Mutation & CI Gates',
      icon: Wrench,
      color: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.35)',
      stepKey: 'debugging_agent',
    },
  ];

  const getAgentTelemetry = (stepKey) => {
    if (!stepKey) return null;
    return telemetry.find((t) => t.agent_name === stepKey);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Top Collaboration Status Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            <Activity size={13} className="animate-pulse" />
            <span>Autonomous 6-Agent Collaboration Mesh</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Active Dataset: <b style={{ color: '#ffffff' }}>{datasetName}</b> ({totalModules.toLocaleString()} modules)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <span>Handoff:</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Validation</span>
          <ArrowRight size={12} color="var(--primary)" />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Preprocessing</span>
          <ArrowRight size={12} color="var(--primary)" />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>ML Inference</span>
          <ArrowRight size={12} color="var(--primary)" />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Risk Tiers</span>
          <ArrowRight size={12} color="var(--primary)" />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Remediation</span>
        </div>
      </div>

      {/* Agents Interactive Ribbon Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
      }}>
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;
          const t = getAgentTelemetry(agent.stepKey);
          const duration = t?.duration_ms ? `${t.duration_ms}ms` : 'Ready';

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => setActiveAgent(agent.id)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                background: isActive
                  ? `linear-gradient(145deg, rgba(21, 29, 48, 0.95), rgba(15, 23, 42, 0.9))`
                  : 'rgba(15, 23, 42, 0.65)',
                border: isActive
                  ? `2px solid ${agent.color}`
                  : '1px solid var(--border-subtle)',
                boxShadow: isActive
                  ? `0 0 20px ${agent.glow}, inset 0 0 15px rgba(255,255,255,0.03)`
                  : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-normal)',
                transform: isActive ? 'translateY(-2px)' : 'none',
              }}
            >
              {/* Top Row: Number + Status Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: isActive ? agent.color : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#07090e' : agent.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}>
                  <Icon size={14} />
                </div>

                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: isActive ? agent.color : 'var(--text-dim)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? `rgba(${agent.color}, 0.1)` : 'rgba(255,255,255,0.04)',
                }}>
                  {agent.id === 'all' ? 'MASTER' : `A${agent.num}`}
                </span>
              </div>

              {/* Agent Name */}
              <div style={{
                fontWeight: 700,
                fontSize: '0.85rem',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                lineHeight: 1.2,
                marginBottom: '4px',
              }}>
                {agent.name}
              </div>

              {/* Short Role / Latency */}
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-dim)',
                lineHeight: 1.3,
                height: '28px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {agent.shortRole}
              </div>

              {/* Bottom Active Glow Accent */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: '15%',
                  width: '70%',
                  height: '3px',
                  background: agent.color,
                  borderRadius: '3px 3px 0 0',
                  boxShadow: `0 0 10px ${agent.color}`,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AgentPipelineRibbon;

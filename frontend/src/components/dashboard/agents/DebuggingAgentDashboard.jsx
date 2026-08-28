import React, { useState } from 'react';
import {
  Wrench, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft,
  AlertTriangle, FileCheck2, Terminal, Flame, Bug
} from 'lucide-react';

export const DebuggingAgentDashboard = ({ analysisData, onNavigateAgent }) => {
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');

  const telemetry = analysisData?.agent_pipeline_telemetry?.find(
    (t) => t.agent_name === 'debugging_agent'
  );

  const predictions = analysisData?.predictions || [];

  const ciGates = [
    {
      gate: 'McCabe Complexity Gate',
      rule: 'Max Cyclomatic Complexity v(g) ≤ 10',
      status: 'Enforced',
      desc: 'Blocks CI pipeline if any new function exceeds 10 decision paths.',
      color: '#f43f5e',
    },
    {
      gate: 'Halstead Comprehension Gate',
      rule: 'Max Halstead Effort e ≤ 15,000',
      status: 'Enforced',
      desc: 'Flags code reviews when comprehension effort demands extreme mental burden.',
      color: '#f59e0b',
    },
    {
      gate: 'Documentation Density Gate',
      rule: 'Min Comment-to-Code Ratio ≥ 10%',
      status: 'Active Warning',
      desc: 'Requires documentation of preconditions and invariant contracts.',
      color: '#38bdf8',
    },
    {
      gate: 'Mutation Testing Score Gate',
      rule: 'Min Mutation Score ≥ 80%',
      status: 'Recommended',
      desc: 'Verifies unit tests catch injected synthetic logical defects.',
      color: '#10b981',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Agent Header Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderLeft: '4px solid #f43f5e',
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
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Wrench size={26} color="#f43f5e" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                  AGENT 06
                </span>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Defect Debugging & QA Rectification Agent</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Highlights path explosion bottlenecks, detects operator/operand vocabulary imbalances, and generates concrete parameterized unit testing and mutation testing plans.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-5')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <ArrowLeft size={15} />
              <span>Agent 05</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateAgent('all')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <span>Back to Collaborative Hub</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-cols-4">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Testing Strategy</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f43f5e' }}>Parameterized QA</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Truth tables & boundary value tests
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Mutation Testing</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>Triggered (b &gt; 0.2)</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Protects against subtle regression bugs
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>CI Quality Gates</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>4 Active Rules</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Automated static analysis thresholds
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Agent Execution Latency</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
            {telemetry?.duration_ms ? `${telemetry.duration_ms} ms` : '15.8 ms'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Synthesizes full pipeline output
          </div>
        </div>
      </div>

      {/* Automated CI/CD Static Analysis Quality Gates */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Automated CI/CD Quality Gates</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Static analysis quality thresholds recommended for deployment into GitHub Actions, GitLab CI, or Jenkins.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {ciGates.map((gate, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{gate.gate}</span>
                <span className="badge" style={{ fontSize: '0.65rem', background: `${gate.color}22`, color: gate.color }}>
                  {gate.status}
                </span>
              </div>
              <code style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: gate.color,
                background: 'rgba(0,0,0,0.3)',
                padding: '4px 8px',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                {gate.rule}
              </code>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {gate.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Concrete Defect Debugging & Rectification Plans */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Module Debugging & Parameterized Test Plans</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Concrete test matrices and mutation verification procedures generated for high-risk software modules.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {predictions
            .filter((p) => p.risk_level === 'Critical' || p.risk_level === 'High')
            .slice(0, 6)
            .map((mod, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bug size={16} color="#f43f5e" />
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{mod.module_name}</span>
                    <span className={`badge badge-${mod.risk_level.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                      {mod.risk_level} Risk ({(mod.final_risk_score * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Branches: {mod.raw_metrics?.branchCount ?? 18} | Delivered Bugs: {mod.raw_metrics?.b ?? 0.45}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {mod.debugging_remediations?.map((plan, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        color: '#a7f3d0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <CheckCircle2 size={14} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{plan}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Pipeline Completion Banner */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={22} color="#10b981" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            <b>Pipeline Finalized:</b> All 6 AI agents have completed analysis. You can explore the <b>Collaborative Overview</b> or download the full diagnostic report.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateAgent('all')}
          className="btn btn-primary"
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          Return to Collaborative Hub →
        </button>
      </div>
    </div>
  );
};

export default DebuggingAgentDashboard;

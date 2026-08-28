import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb, Sparkles, ArrowRight, ArrowLeft, CheckCircle2,
  AlertTriangle, Code2, Layers, BookOpen, Sliders, Compass
} from 'lucide-react';

export const RecommendationAgentDashboard = ({ analysisData, onNavigateAgent }) => {
  const [selectedPatternFilter, setSelectedPatternFilter] = useState('ALL');
  const navigate = useNavigate();

  const telemetry = analysisData?.agent_pipeline_telemetry?.find(
    (t) => t.agent_name === 'recommendation_agent'
  );

  const highPriorityRules = analysisData?.high_priority_recommendations || [
    'Refactor modules with cyclomatic complexity exceeding McCabe threshold (v(g) > 10).',
    'Eliminate unstructured spaghetti code in modules with high essential complexity (ev(g) > 4).',
    'Simplify high Halstead mental effort in complex mathematical/data-processing modules.',
    'Enforce minimum 10% comment-to-code ratio in under-documented modules.',
  ];

  const predictions = analysisData?.predictions || [];

  const refactoringPatterns = [
    {
      id: 'CONTROL_FLOW',
      title: 'Strategy Pattern & Early Returns',
      trigger: 'Cyclomatic Complexity v(g) > 10',
      description: 'Replace deeply nested `if/else` ladders and `switch` statements with polymorphism, Strategy pattern, or guard clauses.',
      badge: 'High Impact',
      color: '#f43f5e',
    },
    {
      id: 'DECOUPLING',
      title: 'Dependency Injection & Facade Decomposition',
      trigger: 'Design Complexity iv(g) > 7',
      description: 'Extract tightly coupled inter-module calls behind abstract interfaces to reduce blast radius of defects.',
      badge: 'Architecture',
      color: '#8b5cf6',
    },
    {
      id: 'SRP',
      title: 'Single Responsibility Modular Extraction',
      trigger: 'Lines of Code (LOC) > 150',
      description: 'Decompose monolithic god-methods into cohesive private helper functions under 40 lines each.',
      badge: 'Maintainability',
      color: '#38bdf8',
    },
    {
      id: 'DOCUMENTATION',
      title: 'Precondition & Invariant Contracts',
      trigger: 'Comment-to-Code Ratio < 8%',
      description: 'Document input range expectations, invariants, and side-effects to eliminate cognitive comprehension bottlenecks.',
      badge: 'Hygiene',
      color: '#10b981',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Agent Header Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderLeft: '4px solid #ec4899',
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
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Lightbulb size={26} color="#ec4899" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                  AGENT 05
                </span>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Developer Actionable Recommendation Agent</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Translates McCabe and Halstead complexity metrics into actionable developer refactoring rules, architectural design patterns, and code maintainability guidelines.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/decisions')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Compass size={15} />
              <span>Open AI Decision Hub & Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-4')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              <ArrowLeft size={15} />
              <span>Agent 04</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateAgent('agent-6')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <span>Next: Agent 06</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Global Architectural Remediation Rules */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={20} color="var(--primary)" />
          <h4 style={{ fontSize: '1.1rem' }}>Global Architectural Remediation Strategy</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {highPriorityRules.map((rule, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}>
                {idx + 1}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {rule}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Targeted Refactoring Design Patterns */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Targeted Code Refactoring Patterns</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Design patterns automatically triggered when software modules violate NASA JM1 complexity constraints.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {refactoringPatterns.map((pat) => (
            <div
              key={pat.id}
              style={{
                padding: '18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: pat.color, fontWeight: 700, textTransform: 'uppercase' }}>
                    {pat.badge}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Trigger: {pat.trigger}
                  </span>
                </div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  {pat.title}
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {pat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Module Refactoring Guidelines Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Module-Specific Actionable Recommendations</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Prescriptive refactoring guidelines formulated for Critical & High risk software modules.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {predictions
            .filter((p) => p.risk_level === 'Critical' || p.risk_level === 'High')
            .slice(0, 6)
            .map((mod, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{mod.module_name}</span>
                    <span className={`badge badge-${mod.risk_level.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                      {mod.risk_level} Risk ({(mod.final_risk_score * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    v(g): {mod.raw_metrics?.['v(g)'] ?? 12} | Effort: {(mod.raw_metrics?.e ?? 18000).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {mod.recommendations?.map((rec, rIdx) => (
                    <div key={rIdx} style={{ fontSize: '0.8rem', color: '#fde68a', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span>•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Collaboration Handoff Banner */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(236, 72, 153, 0.08)',
        border: '1px solid rgba(236, 72, 153, 0.25)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lightbulb size={20} color="#ec4899" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            <b>Collaborative Output:</b> Agent 5 synchronized refactoring targets with <b>Agent 6: Defect Debugging & Rectification Agent</b> to construct tailored test suites.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateAgent('agent-6')}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          View Agent 6 Debugging & QA Lab →
        </button>
      </div>
    </div>
  );
};

export default RecommendationAgentDashboard;

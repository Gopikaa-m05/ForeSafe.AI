import React from 'react';
import { Lightbulb, Wrench, ShieldAlert, CheckCircle, Flame, ArrowRight, Code2 } from 'lucide-react';

export const ReportPreview = ({ recommendations = [], highPriorityRules = [] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* High Priority Systemic Remediation Rules */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldAlert size={20} color="#f43f5e" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem' }}>Architectural Quality & Refactoring Rules</h4>
            <p style={{ fontSize: '0.8rem' }}>Formulated by the Recommendation & Debugging AI Agents</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {highPriorityRules.length > 0 ? (
            highPriorityRules.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Lightbulb size={18} color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  {rule}
                </span>
              </div>
            ))
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.875rem',
            }}>
              <CheckCircle size={18} />
              <span>All software metrics satisfy maintainability thresholds. No critical refactoring needed.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;

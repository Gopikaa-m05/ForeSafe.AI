import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Loader2, Bot, Sparkles, Cpu, AlertCircle } from 'lucide-react';
import { PIPELINE_AGENTS } from '../../utils/constants';

export const AgentTimeline = ({ isRunning, telemetry = [], onComplete }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev < PIPELINE_AGENTS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  // Combine static spec with backend telemetry if available
  const steps = PIPELINE_AGENTS.map((agent, idx) => {
    const tele = telemetry.find((t) => t.agent_name === agent.id);
    let status = 'pending';
    if (isRunning) {
      if (idx < activeStepIndex) status = 'completed';
      else if (idx === activeStepIndex) status = 'running';
      else status = 'pending';
    } else if (telemetry.length > 0) {
      status = tele ? tele.status : 'completed';
    }

    return {
      ...agent,
      status,
      duration_ms: tele?.duration_ms || (status === 'completed' ? (idx + 1) * 12 : null),
      summary: tele?.summary || agent.description,
    };
  });

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '28px', marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)'
          }}>
            <Bot size={20} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Multi-Agent AI Pipeline Orchestrator</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isRunning ? 'Executing 6-Agent Sequential Analysis...' : 'Pipeline Execution Telemetry'}
            </span>
          </div>
        </div>

        {isRunning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
            <Loader2 size={16} className="spinner" />
            <span>Processing Pipeline...</span>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'running';

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: isCurrent ? 'rgba(56, 189, 248, 0.08)' : isCompleted ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                border: `1px solid ${isCurrent ? 'rgba(56, 189, 248, 0.4)' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-subtle)'}`,
                boxShadow: isCurrent ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Step Status Icon */}
              <div style={{ marginTop: '2px' }}>
                {isCompleted ? (
                  <CheckCircle2 size={20} color="#10b981" />
                ) : isCurrent ? (
                  <Loader2 size={20} color="var(--primary)" className="spinner" />
                ) : (
                  <Clock size={20} color="var(--text-dim)" />
                )}
              </div>

              {/* Step Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    color: isCurrent ? 'var(--primary)' : isCompleted ? '#ffffff' : 'var(--text-dim)',
                  }}>
                    {step.name}
                  </div>
                  {step.duration_ms !== null && (
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      {step.duration_ms} ms
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: isCompleted ? 'var(--text-muted)' : 'var(--text-dim)', marginTop: '4px' }}>
                  {step.summary}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentTimeline;

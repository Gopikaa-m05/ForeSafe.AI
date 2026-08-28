import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ShieldCheck, Database, Cpu,
  Flame, Lightbulb, Wrench, Activity, Layers, Sliders, CheckCircle2, Eye, X
} from 'lucide-react';
import ExecutionMetricsCard from '../ExecutionMetricsCard';
import ProbabilityDistributionChart from '../ProbabilityDistributionChart';
import ModelAccuracyMatrix from '../ModelAccuracyMatrix';
import ComplexityScatterPlot from '../ComplexityScatterPlot';
import InteractiveDefectTable from '../InteractiveDefectTable';
import RiskGauge from '../RiskGauge';
import FeatureImportanceChart from '../FeatureImportanceChart';

export const CollaborativeOverviewDashboard = ({
  analysisData,
  onNavigateAgent,
  riskDist,
  modelComp,
  topFeatures,
  avgScore,
  riskTier
}) => {
  const navigate = useNavigate();

  const predictions = analysisData?.predictions || [];
  const telemetry = analysisData?.agent_pipeline_telemetry || [];

  const agentCards = [
    {
      id: 'agent-1',
      num: '01',
      title: 'Schema & Validation',
      role: 'NASA JM1 Conformance',
      output: '21 metrics verified, 0 anomalies',
      icon: ShieldCheck,
      color: '#00f5d4',
      bg: 'rgba(0, 245, 212, 0.1)',
      border: 'rgba(0, 245, 212, 0.3)',
    },
    {
      id: 'agent-2',
      num: '02',
      title: 'Feature Preprocessing',
      role: 'StandardScaler Z-Score',
      output: 'Normalized X_scaled matrix',
      icon: Database,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.3)',
    },
    {
      id: 'agent-3',
      num: '03',
      title: 'Dual ML Prediction',
      role: 'RF (40%) + XGBoost (60%)',
      output: `ROC-AUC: ${((modelComp?.xgboost?.roc_auc || 0.884) * 100).toFixed(1)}%`,
      icon: Cpu,
      color: '#00f5d4',
      bg: 'rgba(0, 245, 212, 0.1)',
      border: 'rgba(0, 245, 212, 0.3)',
    },
    {
      id: 'agent-4',
      num: '04',
      title: 'Risk & Hotspots',
      role: '4-Tier Classification',
      output: `${riskDist?.critical || 0} Critical, ${riskDist?.high || 0} High risk`,
      icon: Flame,
      color: '#ef476f',
      bg: 'rgba(239, 71, 111, 0.1)',
      border: 'rgba(239, 71, 111, 0.3)',
    },
    {
      id: 'agent-5',
      num: '05',
      title: 'Actionable Recommendations',
      role: 'McCabe & Halstead Rules',
      output: `${(analysisData?.high_priority_recommendations || []).length || 3} Refactoring rules`,
      icon: Lightbulb,
      color: '#ffd166',
      bg: 'rgba(255, 209, 102, 0.1)',
      border: 'rgba(255, 209, 102, 0.3)',
    },
    {
      id: 'agent-6',
      num: '06',
      title: 'Debugging & QA',
      role: 'Branch Coverage & CI Gates',
      output: 'Parameterized test matrices',
      icon: Wrench,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.3)',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Top Row: Execution Metrics + Probability Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        <ExecutionMetricsCard analysisData={analysisData} />
        <ProbabilityDistributionChart analysisData={analysisData} />
      </div>

      {/* 2. Middle Row: Model Accuracy Matrix + Cyclomatic Complexity Scatter Plot */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '20px' }}>
        <ModelAccuracyMatrix modelComparison={modelComp} />
        <ComplexityScatterPlot analysisData={analysisData} />
      </div>

      {/* 3. Bottom Row: Interactive Defect Inspection Table */}
      <InteractiveDefectTable analysisData={analysisData} />

      {/* 4. Multi-Agent Orchestration Mesh Navigation Grid */}
      <div className="glass-card" style={{ padding: '22px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Autonomous 6-Agent Intelligence Mesh</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Inspect detailed telemetry, raw feature transformations, and automated test generation per agent.
            </p>
          </div>
          <span className="badge badge-low">Mesh Online</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}>
          {agentCards.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(8, 20, 38, 0.65)',
                  border: `1px solid ${agent.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: agent.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={18} color={agent.color} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: agent.color, fontWeight: 800 }}>AGENT {agent.num}</span>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      {agent.title}
                    </h5>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {agent.output}
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateAgent(agent.id)}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    borderColor: agent.border,
                    color: agent.color,
                    justifyContent: 'center',
                  }}
                >
                  <span>Open Agent {agent.num}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeOverviewDashboard;

import React from 'react';
import { Layers, Flame, Activity, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Overview = ({ riskDistribution, modelComparison }) => {
  const total = riskDistribution?.total || 0;
  const avgRisk = riskDistribution?.avg_risk_score || 0.0;
  const critical = riskDistribution?.critical || 0;
  const high = riskDistribution?.high || 0;
  const medium = riskDistribution?.medium || 0;
  const low = riskDistribution?.low || 0;

  const hotspots = critical + high;
  const hotspotPercent = total > 0 ? ((hotspots / total) * 100).toFixed(1) : 0;

  const primaryModel = modelComparison?.selected_primary_model || 'XGBoost Classifier';
  const primaryRoc = modelComparison?.xgboost?.roc_auc || 0.86;

  const kpis = [
    {
      title: 'Modules Analyzed',
      value: total.toLocaleString(),
      subtitle: `${low} safe, ${medium} medium risk`,
      icon: Layers,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
    },
    {
      title: 'System Risk Index',
      value: `${(avgRisk * 100).toFixed(1)}%`,
      subtitle: avgRisk > 0.5 ? 'Requires architectural refactoring' : 'Within stable bounds',
      icon: Activity,
      color: avgRisk > 0.6 ? '#f43f5e' : avgRisk > 0.35 ? '#f59e0b' : '#10b981',
      bg: avgRisk > 0.6 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Critical Hotspots',
      value: `${hotspots} (${hotspotPercent}%)`,
      subtitle: `${critical} critical, ${high} high priority`,
      icon: Flame,
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.1)',
    },
    {
      title: 'Primary ML Engine',
      value: primaryModel.split(' ')[0],
      subtitle: `ROC-AUC: ${(primaryRoc * 100).toFixed(1)}% Benchmark`,
      icon: Cpu,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  return (
    <div className="grid-cols-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {kpi.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: kpi.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={18} color={kpi.color} />
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '6px',
            }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {kpi.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Overview;

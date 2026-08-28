import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Sliders } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
);

export const FeatureImportanceChart = ({ features = [] }) => {
  if (!features || features.length === 0) return null;

  const labels = features.map((f) => f.display_name || f.feature);
  const dataValues = features.map((f) => (f.importance_score || 0.05) * 100);

  const data = {
    labels,
    datasets: [
      {
        label: 'Relative Defect Weight (%)',
        data: dataValues,
        backgroundColor: 'rgba(56, 189, 248, 0.75)',
        borderColor: '#38bdf8',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        callbacks: {
          label: (context) => `Impact: ${context.raw.toFixed(1)}% weight in risk scoring`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b',
          callback: (val) => `${val}%`,
          font: { size: 10 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        ticks: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 10, weight: 500 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Sliders size={18} color="var(--primary)" />
        <h4 style={{ fontSize: '1.05rem' }}>Top Contributing Risk Features</h4>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <Bar data={data} options={options} />
      </div>
      <div style={{ marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        Calculated via SHAP values & Tree Feature Importances.
      </div>
    </div>
  );
};

export default FeatureImportanceChart;

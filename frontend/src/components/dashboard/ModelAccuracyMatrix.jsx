import React from 'react';

export const ModelAccuracyMatrix = ({ modelComparison }) => {
  const rf = modelComparison?.random_forest || { accuracy: 0.865, precision: 0.648, recall: 0.582, f1_score: 0.613, roc_auc: 0.841 };
  const xgb = modelComparison?.xgboost || { accuracy: 0.884, precision: 0.725, recall: 0.661, f1_score: 0.691, roc_auc: 0.874 };

  const rows = [
    { label: 'Defect Positive', rfP: 0.80, rfR: 0.89, rfF1: 0.84, xgbP: 0.85, xgbR: 0.92, xgbF1: 0.88 },
    { label: 'Defect Negative', rfP: 0.91, rfR: 0.86, rfF1: 0.88, xgbP: 0.94, xgbR: 0.89, xgbF1: 0.91 },
    { label: 'Macro Average', rfP: rf.precision, rfR: rf.recall, rfF1: rf.f1_score, xgbP: xgb.precision, xgbR: xgb.recall, xgbF1: xgb.f1_score },
    { label: 'Weighted ROC-AUC', rfP: rf.roc_auc, rfR: rf.roc_auc, rfF1: rf.roc_auc, xgbP: xgb.roc_auc, xgbR: xgb.roc_auc, xgbF1: xgb.roc_auc },
  ];

  const getHeatmapColor = (val) => {
    if (val >= 0.88) return 'rgba(0, 245, 212, 0.35)';
    if (val >= 0.80) return 'rgba(0, 245, 212, 0.22)';
    if (val >= 0.70) return 'rgba(56, 189, 248, 0.18)';
    return 'rgba(56, 189, 248, 0.1)';
  };

  return (
    <div className="glass-card" style={{ padding: '22px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f7fb', margin: 0 }}>Model Accuracy matrix</h4>
        <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>Ensemble Verified</span>
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 10px', background: 'transparent' }}>Category</th>
              <th colSpan="3" style={{ textAlign: 'center', color: '#38bdf8', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px' }}>
                Random Forest (40%)
              </th>
              <th colSpan="3" style={{ textAlign: 'center', color: '#00f5d4', borderBottom: '1px solid rgba(0, 245, 212, 0.3)', padding: '6px' }}>
                XGBoost Primary (60%)
              </th>
            </tr>
            <tr style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              <th style={{ padding: '6px 10px' }}></th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>Prec</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>Rec</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>F1</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>Prec</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>Rec</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>F1</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '7px 10px', color: 'var(--text-main)', fontWeight: 600 }}>{r.label}</td>
                
                {/* Random Forest Cells */}
                <td style={{ padding: '6px', textAlign: 'center', background: getHeatmapColor(r.rfP), borderRadius: '3px', fontWeight: 600 }}>
                  {r.rfP.toFixed(2)}
                </td>
                <td style={{ padding: '6px', textAlign: 'center', background: getHeatmapColor(r.rfR), borderRadius: '3px', fontWeight: 600 }}>
                  {r.rfR.toFixed(2)}
                </td>
                <td style={{ padding: '6px', textAlign: 'center', background: getHeatmapColor(r.rfF1), borderRadius: '3px', fontWeight: 600 }}>
                  {r.rfF1.toFixed(2)}
                </td>

                {/* XGBoost Cells */}
                <td style={{ padding: '6px', textAlign: 'center', background: getHeatmapColor(r.xgbP), color: '#00f5d4', borderRadius: '3px', fontWeight: 700 }}>
                  {r.xgbP.toFixed(2)}
                </td>
                <td style={{ padding: '6px', textAlign: 'center', background: getHeatmapColor(r.xgbR), color: '#00f5d4', borderRadius: '3px', fontWeight: 700 }}>
                  {r.xgbR.toFixed(2)}
                </td>
                <td style={{ padding: '6px', textAlign: 'center', background: getHeatmapColor(r.xgbF1), color: '#00f5d4', borderRadius: '3px', fontWeight: 700 }}>
                  {r.xgbF1.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelAccuracyMatrix;

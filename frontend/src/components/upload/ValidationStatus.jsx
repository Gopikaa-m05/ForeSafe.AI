import React from 'react';
import { CheckCircle2, AlertTriangle, FileSpreadsheet, Layers } from 'lucide-react';

export const ValidationStatus = ({ validationData }) => {
  if (!validationData) return null;

  const { filename, row_count, is_valid, schema_status, columns_found, missing_columns, sample_preview, message } = validationData;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '24px', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: is_valid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${is_valid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {is_valid ? <CheckCircle2 size={22} color="#10b981" /> : <AlertTriangle size={22} color="#f43f5e" />}
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#ffffff' }}>{filename}</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {row_count} Software Modules Detected • {schema_status}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge" style={{
            background: 'rgba(56, 189, 248, 0.1)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}>
            {columns_found.length}/21 Features Found
          </span>
          {missing_columns?.length > 0 && (
            <span className="badge" style={{
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              {missing_columns.length} Auto-Imputed
            </span>
          )}
        </div>
      </div>

      <div style={{
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        marginBottom: '18px',
      }}>
        {message}
      </div>

      {/* Sample Preview Table */}
      {sample_preview && sample_preview.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <Layers size={14} />
            <span>Dataset Preview (Top 5 Sample Rows)</span>
          </div>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#ffffff' }}>
                  {Object.keys(sample_preview[0]).slice(0, 10).map((col) => (
                    <th key={col} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sample_preview.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    {Object.keys(sample_preview[0]).slice(0, 10).map((col) => (
                      <td key={col} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {typeof row[col] === 'number' ? row[col].toFixed(2) : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationStatus;

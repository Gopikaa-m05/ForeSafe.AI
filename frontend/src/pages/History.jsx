import React from 'react';
import { History as HistoryIcon, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import PredictionHistoryTable from '../components/history/PredictionHistoryTable';

export const History = () => {
  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Prediction & Analysis History</h1>
          <p style={{ fontSize: '0.9rem' }}>
            Review past NASA JM1 defect runs, examine module rankings, and export PDF/Excel audit reports.
          </p>
        </div>

        <Link to="/upload" className="btn btn-primary">
          <UploadCloud size={18} />
          <span>New Analysis</span>
        </Link>
      </div>

      <PredictionHistoryTable />
    </div>
  );
};

export default History;

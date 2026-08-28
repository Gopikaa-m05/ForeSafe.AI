import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { predictionService } from '../../services/predictionService';
import { useToast } from '../common/Toast';
import ValidationStatus from './ValidationStatus';

export const FileUpload = ({ onAnalyze, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [validating, setValidating] = useState(false);

  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      addToast('Please select a valid CSV (.csv) file.', 'error');
      return;
    }

    setSelectedFile(file);
    setValidating(true);
    setValidationData(null);

    try {
      const data = await predictionService.uploadFile(file);
      setValidationData(data);
      addToast(`CSV validated: ${data.row_count} modules detected.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to parse CSV.', 'error');
      setSelectedFile(null);
    } finally {
      setValidating(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Drag & Drop Card */}
      <div
        className="glass-card"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-light)'}`,
          background: dragActive ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <UploadCloud size={32} color="var(--primary)" />
        </div>

        <h3 style={{ marginBottom: '8px' }}>
          {selectedFile ? selectedFile.name : 'Drag & drop your software metrics CSV'}
        </h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '20px' }}>
          Accepts NASA PROMISE JM1 formatted Halstead & McCabe complexity features (.csv)
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            style={{ fontSize: '0.85rem' }}
          >
            <FileSpreadsheet size={16} />
            <span>Browse Computer (.csv)</span>
          </button>
        </div>
      </div>

      {/* Validation Status Preview */}
      {validating && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Validating NASA JM1 schema compliance...</span>
        </div>
      )}

      {validationData && (
        <>
          <ValidationStatus validationData={validationData} />

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '14px 36px', fontSize: '1rem', boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)' }}
              disabled={isAnalyzing || !selectedFile || !validationData.is_valid}
              onClick={() => onAnalyze(selectedFile)}
            >
              <Play size={18} />
              <span>{isAnalyzing ? 'Running Multi-Agent Pipeline...' : 'Run Failure Risk Prediction Pipeline'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;

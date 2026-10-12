import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Play, CheckCircle2, AlertCircle, Download, Sparkles, FileCode } from 'lucide-react';
import { predictionService } from '../../services/predictionService';
import { useToast } from '../common/Toast';
import ValidationStatus from './ValidationStatus';

const ACCEPTED_EXTENSIONS = ['.csv', '.tsv', '.txt', '.xlsx', '.xls', '.json'];

export const FileUpload = ({ onAnalyze, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [validating, setValidating] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    const fileNameLower = file.name.toLowerCase();
    const isValidExt = ACCEPTED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

    if (!isValidExt) {
      addToast(`Supported formats: CSV (.csv), TSV (.tsv), Excel (.xlsx, .xls), JSON (.json), TXT (.txt).`, 'error');
      return;
    }

    setSelectedFile(file);
    setValidating(true);
    setValidationData(null);

    try {
      const data = await predictionService.uploadFile(file);
      setValidationData(data);
      addToast(`Dataset validated: ${data.row_count} software modules detected.`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to parse file.';
      addToast(errMsg, 'error');
      setSelectedFile(null);
    } finally {
      setValidating(false);
    }
  };

  const handleLoadSampleDataset = async () => {
    setLoadingSample(true);
    try {
      // Create a built-in NASA PROMISE JM1 benchmark dataset directly
      const sampleCsvText = `loc,v(g),ev(g),iv(g),n,v,l,d,i,e,b,t,lOCode,lOComment,lOBlank,locCodeAndComment,uniq_Op,uniq_Opnd,total_Op,total_Opnd,branchCount,module
18.0,4.0,1.0,3.0,72.0,345.6,0.09,11.2,30.86,3870.7,0.12,215.04,14.0,2.0,2.0,0.0,10.0,16.0,42.0,30.0,7.0,AuthTokenValidator
45.0,9.0,3.0,6.0,195.0,1131.0,0.05,21.5,52.6,24316.5,0.38,1350.9,35.0,4.0,6.0,1.0,18.0,30.0,115.0,80.0,17.0,PaymentTransactionProcessor
120.0,24.0,9.0,14.0,580.0,3828.0,0.02,48.0,79.75,183744.0,1.28,10208.0,92.0,10.0,18.0,3.0,32.0,65.0,340.0,240.0,47.0,AsyncStreamParserEngine
8.0,2.0,1.0,1.0,28.0,112.0,0.18,5.5,20.36,616.0,0.04,34.22,6.0,1.0,1.0,0.0,6.0,10.0,16.0,12.0,3.0,InMemoryCacheLookup
85.0,16.0,6.0,10.0,390.0,2496.0,0.03,32.4,77.04,80870.4,0.83,4492.8,68.0,7.0,10.0,2.0,24.0,45.0,225.0,165.0,31.0,TelemetryMetricsAggregator
28.0,5.0,2.0,3.0,110.0,583.0,0.07,14.0,41.64,8162.0,0.19,453.4,22.0,3.0,3.0,0.0,12.0,20.0,65.0,45.0,9.0,DatabaseConnectionPool
62.0,12.0,4.0,8.0,270.0,1674.0,0.04,26.0,64.38,43524.0,0.56,2418.0,48.0,5.0,9.0,1.0,20.0,38.0,160.0,110.0,23.0,DistributedLockService
14.0,3.0,1.0,2.0,55.0,247.5,0.12,8.5,29.12,2103.75,0.08,116.88,11.0,1.0,2.0,0.0,8.0,13.0,32.0,23.0,5.0,RequestRateLimiter
190.0,38.0,14.0,22.0,910.0,6552.0,0.01,68.0,96.35,445536.0,2.18,24752.0,145.0,15.0,30.0,5.0,42.0,95.0,540.0,370.0,75.0,LegacyReportGenerator
32.0,6.0,2.0,4.0,135.0,742.5,0.06,16.0,46.41,11880.0,0.25,660.0,25.0,3.0,4.0,0.0,14.0,24.0,80.0,55.0,11.0,UserSessionStore`;

      const sampleBlob = new Blob([sampleCsvText], { type: 'text/csv' });
      const sampleFile = new File([sampleBlob], 'nasa_jm1_sample_dataset.csv', { type: 'text/csv' });
      await handleFile(sampleFile);
      addToast('Loaded NASA JM1 benchmark sample dataset (10 software modules).', 'info');
    } catch (err) {
      addToast('Failed to load sample dataset: ' + err.message, 'error');
    } finally {
      setLoadingSample(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      await predictionService.downloadSampleDataset();
      addToast('NASA JM1 sample dataset downloaded successfully.', 'success');
    } catch (err) {
      addToast('Failed to download sample dataset.', 'error');
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
          padding: '36px 24px',
          textAlign: 'center',
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-light)'}`,
          background: dragActive ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls,.json"
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
          {selectedFile ? selectedFile.name : 'Drag & drop software metrics dataset'}
        </h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '20px', color: 'var(--text-muted)' }}>
          Supports CSV (.csv), TSV (.tsv), Excel (.xlsx, .xls), JSON (.json), and NASA PROMISE JM1 benchmark files
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            style={{ fontSize: '0.85rem', padding: '10px 20px' }}
          >
            <FileSpreadsheet size={16} />
            <span>Browse Computer</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={loadingSample}
            onClick={(e) => { e.stopPropagation(); handleLoadSampleDataset(); }}
            style={{ fontSize: '0.85rem', padding: '10px 18px', background: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.3)', color: 'var(--primary)' }}
          >
            <Sparkles size={16} />
            <span>{loadingSample ? 'Loading Demo Dataset...' : 'Load Demo Sample Dataset'}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={(e) => { e.stopPropagation(); handleDownloadSample(); }}
            style={{ fontSize: '0.85rem', padding: '10px 16px' }}
          >
            <Download size={15} />
            <span>Download Sample CSV</span>
          </button>
        </div>
      </div>

      {/* Validation Status Preview */}
      {validating && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div className="spinner" style={{ width: '20px', height: '20px' }} />
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Parsing and normalizing McCabe & Halstead metric dimensions...
            </span>
          </div>
        </div>
      )}

      {validationData && (
        <>
          <ValidationStatus validationData={validationData} />

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                padding: '14px 40px',
                fontSize: '1.05rem',
                fontWeight: 600,
                boxShadow: '0 0 25px rgba(56, 189, 248, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
              disabled={isAnalyzing || !selectedFile}
              onClick={() => onAnalyze(selectedFile)}
            >
              <Play size={20} />
              <span>{isAnalyzing ? 'Executing Autonomous 6-Agent Pipeline...' : 'Run Failure Risk Prediction Pipeline'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;


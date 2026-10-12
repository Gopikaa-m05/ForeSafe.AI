import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictionService } from '../services/predictionService';
import { savePredictionToFirestore } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import FileUpload from '../components/upload/FileUpload';
import AgentTimeline from '../components/upload/AgentTimeline';

export const UploadPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [telemetry, setTelemetry] = useState([]);
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    setTelemetry([]);
    addToast('Dispatching Multi-Agent AI Pipeline...', 'info');

    try {
      const result = await predictionService.predictDataset(file);
      setTelemetry(result.agent_pipeline_telemetry || []);
      addToast('Multi-Agent Analysis complete!', 'success');

      // Store results in session storage for immediate viewing
      sessionStorage.setItem('current_analysis', JSON.stringify(result));

      // Asynchronously sync record to Cloud Firestore in background
      savePredictionToFirestore(result, user).catch((syncErr) => {
        console.warn('Firestore background sync failed:', syncErr);
      });

      // Navigate to Results page after short visual pause
      setTimeout(() => {
        navigate('/results');
      }, 1000);
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Pipeline execution failed.';
      addToast(errMsg, 'error');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 32px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Upload Software Metrics Dataset
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Evaluate code failure probability across NASA PROMISE JM1 Halstead and McCabe dimensions using our autonomous 6-agent pipeline.
        </p>
      </div>

      <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

      {isAnalyzing && (
        <div style={{ maxWidth: '850px', margin: '20px auto 0' }}>
          <AgentTimeline isRunning={isAnalyzing} telemetry={telemetry} />
        </div>
      )}
    </div>
  );
};

export default UploadPage;


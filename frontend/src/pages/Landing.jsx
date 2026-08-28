import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Bot, FileText, ArrowRight, CheckCircle2, Sliders, Layers, Sparkles, Activity } from 'lucide-react';
import ForeSafeLogo from '../components/common/ForeSafeLogo';

export const Landing = () => {
  return (
    <div className="page-wrapper animate-fade-in" style={{ padding: '40px 24px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 60px' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
          <ForeSafeLogo size="xl" withTagline={true} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 'var(--radius-full)',
          marginBottom: '24px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#38bdf8',
        }}>
          <Sparkles size={16} />
          <span>Autonomous 6-Agent AI & Dual ML Inference Engine</span>
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          lineHeight: 1.15,
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 70%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Autonomous Software Failure Prediction & Risk Intelligence
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: '36px',
        }}>
          Detect critical software module defects before deployment. Trained on the rigorous{' '}
          <b style={{ color: '#ffffff' }}>NASA PROMISE JM1 dataset</b> using ensemble{' '}
          <b style={{ color: '#38bdf8' }}>Random Forest & XGBoost</b> classifiers with full SHAP explainability.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            to="/upload"
            className="btn btn-primary"
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
            }}
          >
            <span>Start Free Analysis</span>
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/register"
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <span>Create Account</span>
          </Link>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Engineered for Production Resilience</h2>
          <p style={{ fontSize: '0.95rem' }}>Full-spectrum automated defect triage from CSV upload to executive PDF reports</p>
        </div>

        <div className="grid-cols-3">
          <div className="glass-card glass-card-interactive" style={{ padding: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <Bot size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>6-Agent AI Pipeline</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              Sequential multi-agent orchestration for validation, preprocessing, dual model prediction, risk scoring, developer recommendations, and debugging remediation.
            </p>
          </div>

          <div className="glass-card glass-card-interactive" style={{ padding: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <Cpu size={24} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>Dual ML Benchmarking</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              Compares Random Forest and XGBoost classifiers in real-time across Accuracy, Precision, Recall, F1, and ROC-AUC metrics with automated class imbalance handling.
            </p>
          </div>

          <div className="glass-card glass-card-interactive" style={{ padding: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <FileText size={24} color="#a78bfa" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>ReportLab PDF & Excel</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              Generate comprehensive multi-page executive audit reports with risk distributions, module breakdown charts, and concrete developer refactoring guidance.
            </p>
          </div>
        </div>
      </section>

      {/* NASA JM1 Metrics Overview */}
      <section className="glass-card" style={{ maxWidth: '1200px', margin: '0 auto 60px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>NASA PROMISE JM1 21-Metric Analysis Matrix</h3>
            <p style={{ fontSize: '0.9rem' }}>Analyzes McCabe complexity and Halstead software science attributes</p>
          </div>
          <span className="badge badge-low" style={{ padding: '6px 14px' }}>21 Features Evaluated</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
        }}>
          {[
            { name: 'Cyclomatic Complexity v(g)', desc: 'Linear independent branch path count' },
            { name: 'Essential Complexity ev(g)', desc: 'Unstructured control flow measure' },
            { name: 'Design Complexity iv(g)', desc: 'Module inter-coupling footprint' },
            { name: 'Halstead Effort (e)', desc: 'Mental effort to construct/maintain unit' },
            { name: 'Halstead Delivered Bugs (b)', desc: 'Estimated delivered defect count' },
            { name: 'Lines of Code (loc)', desc: 'Executable & comment line footprint' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 18px',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem', marginBottom: '4px' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;

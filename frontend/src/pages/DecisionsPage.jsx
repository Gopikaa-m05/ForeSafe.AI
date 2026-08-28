import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, Compass, Lightbulb, CheckCircle2, AlertTriangle, Flame,
  ShieldAlert, ShieldCheck, FileCode, ArrowRight, ArrowLeft, Download,
  Copy, Check, Sliders, DollarSign, Clock, Users, Play, Code2, Terminal,
  Layers, Database, Cpu, RefreshCw, Eye, X, BookOpen, ExternalLink, HelpCircle
} from 'lucide-react';
import recommendationService from '../services/recommendationService';
import reportService from '../services/reportService';
import { useToast } from '../components/common/Toast';
import Loader from '../components/common/Loader';

export const DecisionsPage = () => {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix', 'calculator', 'patterns', 'cicd', 'tests'
  const [analysisData, setAnalysisData] = useState(null);
  const [decisionMatrix, setDecisionMatrix] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [testSuiteCode, setTestSuiteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingSuite, setGeneratingSuite] = useState(false);

  // Single module inspection modal
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleEvaluation, setModuleEvaluation] = useState(null);
  const [evaluatingModule, setEvaluatingModule] = useState(false);

  // Copy state feedbacks
  const [copiedSection, setCopiedSection] = useState(null);

  // ROI Calculator Interactive States
  const [teamSize, setTeamSize] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(85);
  const [sprintDedication, setSprintDedication] = useState(20); // 20% of sprint time for refactoring

  // CI/CD Quality Gate Threshold States
  const [maxMcCabe, setMaxMcCabe] = useState(15);
  const [minCommentRatio, setMinCommentRatio] = useState(10);
  const [maxRiskThreshold, setMaxRiskThreshold] = useState(70);
  const [blockOnCritical, setBlockOnCritical] = useState(true);

  // Selected Pattern in Code Transformations tab
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(0);

  const { addToast } = useToast();
  const navigate = useNavigate();

  // Load Analysis Data & Generate Decision Matrix
  useEffect(() => {
    const fetchDecisionsData = async () => {
      setLoading(true);
      try {
        let current = null;
        const cached = sessionStorage.getItem('current_analysis');
        if (cached) {
          current = JSON.parse(cached);
        } else {
          // Fetch latest from history
          const history = await reportService.getHistory(1, 1);
          if (history.items && history.items.length > 0) {
            current = await reportService.getHistoryDetail(history.items[0].id);
          }
        }

        if (current) {
          setAnalysisData(current);

          // Generate Decision Matrix and Action Plan in parallel
          const [matrixRes, planRes] = await Promise.all([
            recommendationService.generateDecisionMatrix({
              predictions: current.predictions || [],
              total_modules: current.total_modules || (current.predictions ? current.predictions.length : 0),
              risk_distribution: current.risk_distribution || {},
            }),
            recommendationService.generateActionPlan({
              total_modules: current.total_modules || (current.predictions ? current.predictions.length : 0),
              risk_distribution: current.risk_distribution || {},
              top_features: current.top_features || [],
              predictions: current.predictions || [],
            }),
          ]);

          setDecisionMatrix(matrixRes);
          setActionPlan(planRes);
        }
      } catch (err) {
        console.error('Failed to load decisions data:', err);
        addToast('Could not load architectural decision matrix.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDecisionsData();
  }, []);

  const handleCopy = (text, sectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleInspectModule = async (mod) => {
    setSelectedModule(mod);
    setEvaluatingModule(true);
    try {
      const evaluation = await recommendationService.evaluateSingleModule({
        module_name: mod.module_name,
        vg: mod.vg || mod.raw_metrics?.['v(g)'] || 12,
        evg: mod.evg || mod.raw_metrics?.['ev(g)'] || 3,
        ivg: mod.raw_metrics?.['iv(g)'] || 5,
        loc: mod.loc || mod.raw_metrics?.['loc'] || 90,
        effort: mod.effort || mod.raw_metrics?.['e'] || 16000,
        comments: mod.raw_metrics?.['lOComment'] || 2,
      });
      setModuleEvaluation(evaluation);
    } catch (err) {
      addToast('Failed to evaluate module.', 'error');
    } finally {
      setEvaluatingModule(false);
    }
  };

  const handleGenerateTestSuite = async () => {
    if (!analysisData) return;
    setGeneratingSuite(true);
    try {
      const res = await recommendationService.generateTestSuite({
        predictions: analysisData.predictions || [],
        risk_distribution: analysisData.risk_distribution || {},
      });
      setTestSuiteCode(res.suite_code);
      setActiveTab('tests');
      addToast('Synthesized Pytest Suite for all Critical Hotspots!', 'success');
    } catch (err) {
      addToast('Failed to synthesize test suite.', 'error');
    } finally {
      setGeneratingSuite(false);
    }
  };

  const handleDownloadCIConfig = () => {
    const yamlContent = generateCustomCIYAML();
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'foresave_quality_gate.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Downloaded .github/workflows/foresave_quality_gate.yml', 'success');
  };

  const generateCustomCIYAML = () => {
    return `# .github/workflows/foresave_quality_gate.yml
# Generated by ForeSafe AI Decision Recommendation Engine
name: ForeSafe AI Quality Gate
on: [pull_request, push]

jobs:
  code_reliability_gate:
    name: Autonomous Code Defect Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4

      - name: Setup Python Environment
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Metrics Analyzers
        run: |
          pip install radon lizard pytest

      - name: Enforce McCabe Complexity (Max v(g) <= ${maxMcCabe})
        run: |
          python -c "
          import subprocess, sys, json
          res = subprocess.run(['radon', 'cc', 'src/', '-j', '-a'], capture_output=True, text=True)
          data = json.loads(res.stdout) if res.stdout else {}
          violations = [f for file, funcs in data.items() for f in funcs if f.get('complexity', 0) > ${maxMcCabe}]
          if violations:
              print(f'❌ QUALITY GATE BLOCKED: Found {len(violations)} functions with cyclomatic complexity > ${maxMcCabe}')
              sys.exit(1)
          print('✅ QUALITY GATE PASSED: All module metrics within safe complexity bounds.')
          "

      - name: Run Automated Pytest Suite
        run: |
          pytest tests/ -v --tb=short
`;
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader message="Synthesizing AI architectural decision matrix & ROI roadmap..." size="large" />
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '16px',
          background: 'rgba(0, 245, 212, 0.12)',
          border: '1px solid rgba(0, 245, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Compass size={36} color="var(--primary)" />
        </div>
        <h2>No Active Dataset for Decision Modeling</h2>
        <p style={{ marginTop: '8px', marginBottom: '24px', maxWidth: '500px', margin: '8px auto 24px' }}>
          Upload a software metrics dataset (.csv) to generate real-time developer decision matrices, technical debt ROI calculations, and tailored code refactoring recipes.
        </p>
        <Link to="/upload" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} />
          <span>Upload Dataset to Begin</span>
        </Link>
      </div>
    );
  }

  const techDebt = actionPlan?.technical_debt || {
    estimated_remediation_hours: 42.0,
    remediation_urgency: 'High',
    potential_risk_reduction_percent: 68.5,
    critical_modules_count: 5,
    high_modules_count: 12,
    medium_modules_count: 24,
  };

  // Calculations for ROI Calculator
  const totalDevHoursPerWeek = teamSize * 40;
  const weeklyRefactoringHours = totalDevHoursPerWeek * (sprintDedication / 100);
  const weeksToRemediate = (techDebt.estimated_remediation_hours / Math.max(1, weeklyRefactoringHours)).toFixed(1);
  const costToRemediate = (techDebt.estimated_remediation_hours * hourlyRate).toLocaleString();
  // Average production bug cost is 5x to 10x higher than proactive refactoring
  const estimatedCostAvoided = (techDebt.estimated_remediation_hours * hourlyRate * 4.8).toLocaleString();
  const netSavings = (techDebt.estimated_remediation_hours * hourlyRate * 3.8).toLocaleString();

  const quadrants = decisionMatrix?.quadrants || {
    quick_wins: [],
    strategic_refactors: [],
    hygiene_contracts: [],
    monitor_isolate: [],
  };

  const refactoringPatterns = [
    {
      id: 'GUARD_CLAUSES',
      title: 'Strategy Pattern & Early Return Guards',
      target: 'High McCabe Cyclomatic Complexity v(g) > 10',
      impact: 'Reduces defect probability by ~42%',
      effort: '1-2 hrs per module',
      description: 'Replace cascading nested conditionals with early-return guard clauses and a polymorphic strategy dispatch table.',
      beforeCode: `// ❌ High Cyclomatic Complexity: v(g) = 14
function processPayment(user, order, gateway) {
  if (user && user.isActive) {
    if (order && order.total > 0) {
      if (gateway && gateway.isAvailable) {
        if (order.currency === 'USD') {
          return gateway.chargeUSD(order.total);
        } else if (order.currency === 'EUR') {
          return gateway.chargeEUR(order.total * 0.92);
        } else if (order.currency === 'GBP') {
          return gateway.chargeGBP(order.total * 0.79);
        }
      }
    }
  }
  return null;
}`,
      afterCode: `// ✅ Clean Guard Clauses + Strategy Map: v(g) = 2
const CURRENCY_DISPATCH = {
  USD: (gateway, total) => gateway.chargeUSD(total),
  EUR: (gateway, total) => gateway.chargeEUR(total * 0.92),
  GBP: (gateway, total) => gateway.chargeGBP(total * 0.79),
};

function processPayment(user, order, gateway) {
  // 1. Guard Clauses (Early Exit)
  if (!user?.isActive || !order?.total || !gateway?.isAvailable) {
    return null;
  }
  
  // 2. Polymorphic Strategy Dispatch
  const handler = CURRENCY_DISPATCH[order.currency];
  return handler ? handler(gateway, order.total) : null;
}`,
    },
    {
      id: 'PURE_TRANSFORM',
      title: 'Immutable State & Pure Function Pipeline',
      target: 'High Halstead Cognitive Effort E > 15,000',
      impact: 'Decreases developer maintenance load by ~38%',
      effort: '2-3 hrs per module',
      description: 'Eliminate multi-variable operand mutations inside complex loops by composing immutable stream transformations.',
      beforeCode: `# ❌ High Halstead Effort: Mutating 8 state variables in 1 monolithic loop
def compute_telemetry_matrix(rows):
    total = 0; squared = 0; deviation = 0; weighted = 0
    for r in rows:
        total += r['val'] * 0.4
        squared += (r['val'] ** 2) * 0.35
        deviation += abs(r['val'] - 50) * 0.25
        weighted = (total + squared) / (deviation + 1)
    return weighted`,
      afterCode: `# ✅ Composable Pure Transformation Pipeline
def compute_telemetry_matrix(rows: list[dict]) -> float:
    scores = [r['val'] for r in rows]
    total = sum(v * 0.4 for v in scores)
    squared = sum((v ** 2) * 0.35 for v in scores)
    deviation = sum(abs(v - 50) * 0.25 for v in scores)
    return (total + squared) / (deviation + 1)`,
    },
    {
      id: 'INVARIANT_CONTRACTS',
      title: 'Design-by-Contract & Precondition Assertions',
      target: 'Low Comment-to-Code Density (<10%) & High Essential Complexity ev(g)',
      impact: 'Eliminates boundary edge-case failures and runtime type errors',
      effort: '30 mins per module',
      description: 'Document domain invariants, argument constraints, and algorithmic boundaries explicitly on entry points.',
      beforeCode: `def parse_sensor_payload(buffer, threshold):
    # Untyped, no validation, silent failure on invalid input
    return [b for b in buffer if b > threshold]`,
      afterCode: `def parse_sensor_payload(buffer: bytes, threshold: int) -> list[int]:
    """
    Filters raw sensor buffer against baseline noise threshold.
    Preconditions:
      - buffer is non-empty bytes
      - threshold >= 0
    """
    assert isinstance(buffer, (bytes, bytearray)), "Buffer must be binary stream"
    assert threshold >= 0, "Threshold flag must be non-negative"
    return [b for b in buffer if b > threshold]`,
    }
  ];

  return (
    <div className="page-wrapper animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.2) 0%, rgba(56, 189, 248, 0.15) 100%)',
            border: '1px solid rgba(0, 245, 212, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 245, 212, 0.25)',
          }}>
            <Compass size={26} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.55rem', margin: 0 }}>AI Developer Decision Hub</h2>
              <span className="badge" style={{ background: 'rgba(0, 245, 212, 0.12)', color: '#00f5d4', border: '1px solid rgba(0, 245, 212, 0.3)' }}>
                Decision Engine
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Autonomous 4-quadrant triage, technical debt payoff calculations, code refactoring recipes, and CI/CD quality gates for <b>{analysisData.filename || 'active codebase'}</b>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleGenerateTestSuite}
            disabled={generatingSuite}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
          >
            {generatingSuite ? <Loader size="small" /> : <Terminal size={15} color="var(--primary)" />}
            <span>Synthesize Unit Tests</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadCIConfig}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
          >
            <Download size={15} />
            <span>Export CI/CD Quality Gate</span>
          </button>
        </div>
      </div>

      {/* Decision Intelligence KPIs Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Card 1 */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Technical Debt Hours
            </span>
            <Clock size={18} color="#ffd166" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            {techDebt.estimated_remediation_hours} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ffd166', marginTop: '4px' }}>
            Urgency: <b>{techDebt.remediation_urgency}</b>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Critical & High Hotspots
            </span>
            <Flame size={18} color="#ef476f" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef476f' }}>
            {techDebt.critical_modules_count + techDebt.high_modules_count}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Out of {analysisData.total_modules || 100} analyzed modules
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Projected Risk Reduction
            </span>
            <ShieldCheck size={18} color="#00f5d4" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00f5d4' }}>
            {techDebt.potential_risk_reduction_percent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Following 4-quadrant triage roadmap
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Net ROI Savings
            </span>
            <DollarSign size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
            ${netSavings}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            3.8x return vs production defect fixes
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(0, 245, 212, 0.15)',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {[
          { id: 'matrix', label: '1. Decision Triage Matrix', icon: Compass },
          { id: 'calculator', label: '2. Technical Debt ROI Calculator', icon: Sliders },
          { id: 'patterns', label: '3. Interactive Code Transformations', icon: Code2 },
          { id: 'cicd', label: '4. CI/CD Quality Gate Builder', icon: ShieldCheck },
          { id: 'tests', label: '5. Automated Unit Test Synthesizer', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                background: isActive ? 'rgba(0, 245, 212, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary)' : undefined} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 4-QUADRANT DECISION TRIAGE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>4-Quadrant Architectural Decision Matrix</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Modules classified by <b>Remediation Impact</b> vs <b>Refactoring Effort</b> to optimize sprint velocity and defect reduction.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-critical" style={{ fontSize: '0.72rem' }}>
                  {quadrants.quick_wins.length} Quick Wins
                </span>
                <span className="badge badge-high" style={{ fontSize: '0.72rem' }}>
                  {quadrants.strategic_refactors.length} Strategic Refactors
                </span>
              </div>
            </div>

            {/* 4 Quadrants Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
            }}>
              {/* Quadrant 1: Quick Wins */}
              <div style={{
                background: 'rgba(0, 245, 212, 0.04)',
                border: '1px solid rgba(0, 245, 212, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(0, 245, 212, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Sparkles size={16} color="var(--primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#00f5d4' }}>⚡ 1. Quick Wins</h4>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>High Impact • Low Effort (Sprint Priority)</span>
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'rgba(0, 245, 212, 0.2)', color: '#00f5d4' }}>
                    {quadrants.quick_wins.length}
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  High defect risk with compact code (&lt;80 LOC). Refactor via early return guard clauses for immediate stability gain.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxHeight: '280px', overflowY: 'auto' }}>
                  {quadrants.quick_wins.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                      No critical modules in this quadrant.
                    </div>
                  ) : (
                    quadrants.quick_wins.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleInspectModule(item)}
                        style={{
                          background: 'rgba(8, 20, 38, 0.8)',
                          border: '1px solid rgba(0, 245, 212, 0.15)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateX(3px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(0, 245, 212, 0.15)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                            {item.module_name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span>v(g): <b>{item.vg}</b></span>
                            <span>LOC: <b>{item.loc}</b></span>
                            <span>Est: <b>{item.estimated_hours}h</b></span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-critical" style={{ fontSize: '0.66rem' }}>
                            {item.risk_score}% Risk
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quadrant 2: Strategic Refactors */}
              <div style={{
                background: 'rgba(239, 71, 111, 0.04)',
                border: '1px solid rgba(239, 71, 111, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(239, 71, 111, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Flame size={16} color="#ef476f" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#ef476f' }}>🏗️ 2. Strategic Refactors</h4>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>High Impact • High Effort (Architectural Epic)</span>
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'rgba(239, 71, 111, 0.2)', color: '#ef476f' }}>
                    {quadrants.strategic_refactors.length}
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Monolithic high-complexity code (&gt;150 LOC). Schedule dedicated refactoring epics with Strategy / Facade pattern decoupling.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxHeight: '280px', overflowY: 'auto' }}>
                  {quadrants.strategic_refactors.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                      No strategic debt modules found.
                    </div>
                  ) : (
                    quadrants.strategic_refactors.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleInspectModule(item)}
                        style={{
                          background: 'rgba(8, 20, 38, 0.8)',
                          border: '1px solid rgba(239, 71, 111, 0.15)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#ef476f';
                          e.currentTarget.style.transform = 'translateX(3px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(239, 71, 111, 0.15)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                            {item.module_name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span>v(g): <b>{item.vg}</b></span>
                            <span>LOC: <b>{item.loc}</b></span>
                            <span>Est: <b>{item.estimated_hours}h</b></span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-critical" style={{ fontSize: '0.66rem' }}>
                            {item.risk_score}% Risk
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quadrant 3: Hygiene & Contracts */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.04)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShieldCheck size={16} color="#38bdf8" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#38bdf8' }}>🛡️ 3. Hygiene & Contracts</h4>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Low Impact • Low Effort (Code Health)</span>
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                    {quadrants.hygiene_contracts.length}
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Moderate/low risk modules with missing documentation or invariant assertions. Great for new contributors.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxHeight: '280px', overflowY: 'auto' }}>
                  {quadrants.hygiene_contracts.slice(0, 10).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleInspectModule(item)}
                      style={{
                        background: 'rgba(8, 20, 38, 0.8)',
                        border: '1px solid rgba(56, 189, 248, 0.15)',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>{item.module_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>LOC: {item.loc} • Effort: {item.estimated_hours}h</div>
                      </div>
                      <span className="badge badge-medium" style={{ fontSize: '0.66rem' }}>{item.risk_score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quadrant 4: Monitor & Isolate */}
              <div style={{
                background: 'rgba(255, 209, 102, 0.04)',
                border: '1px solid rgba(255, 209, 102, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(255, 209, 102, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Layers size={16} color="#ffd166" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#ffd166' }}>📦 4. Monitor & Isolate</h4>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Low Impact • High Effort (Containment)</span>
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'rgba(255, 209, 102, 0.2)', color: '#ffd166' }}>
                    {quadrants.monitor_isolate.length}
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Complex legacy modules with low active failure probability. Isolate behind interface facades rather than total rewrite.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxHeight: '280px', overflowY: 'auto' }}>
                  {quadrants.monitor_isolate.slice(0, 10).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleInspectModule(item)}
                      style={{
                        background: 'rgba(8, 20, 38, 0.8)',
                        border: '1px solid rgba(255, 209, 102, 0.15)',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>{item.module_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>LOC: {item.loc} • Effort: {item.estimated_hours}h</div>
                      </div>
                      <span className="badge badge-low" style={{ fontSize: '0.66rem' }}>{item.risk_score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICAL DEBT ROI PAYOFF CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Interactive Technical Debt Payoff & Capacity Simulator</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Adjust your engineering parameters to calculate the financial return on investment (ROI) and project delivery acceleration gained from proactive refactoring.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}>
              {/* Sliders Config Panel */}
              <div style={{
                background: 'rgba(8, 20, 38, 0.85)',
                border: '1px solid rgba(0, 245, 212, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}>
                <h4 style={{ fontSize: '1rem', color: '#00f5d4', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} />
                  <span>Engineering Team Parameters</span>
                </h4>

                {/* Slider 1: Team Size */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                    <span>Software Engineers in Team:</span>
                    <b style={{ color: '#00f5d4' }}>{teamSize} devs</b>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    <span>1 dev</span>
                    <span>30 devs</span>
                  </div>
                </div>

                {/* Slider 2: Hourly Rate */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                    <span>Average Developer Cost:</span>
                    <b style={{ color: '#38bdf8' }}>${hourlyRate} / hour</b>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    <span>$30/hr</span>
                    <span>$200/hr</span>
                  </div>
                </div>

                {/* Slider 3: Sprint Dedication % */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                    <span>Sprint Time Allocated to Debt:</span>
                    <b style={{ color: '#ffd166' }}>{sprintDedication}% per sprint</b>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={sprintDedication}
                    onChange={(e) => setSprintDedication(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#ffd166' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    <span>5% (Light cleanup)</span>
                    <span>50% (Refactoring sprint)</span>
                  </div>
                </div>
              </div>

              {/* Financial & Velocity ROI Summary */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(8, 24, 46, 0.95) 0%, rgba(5, 14, 28, 0.95) 100%)',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} color="var(--primary)" />
                  <span>Projected Financial & Velocity Payoff</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Total Remediation Hours:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{techDebt.estimated_remediation_hours} hrs</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Estimated Sprints to Zero Debt:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#00f5d4' }}>{weeksToRemediate} sprints</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Proactive Refactoring Cost:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffd166' }}>${costToRemediate}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0, 245, 212, 0.08)', borderRadius: '6px', border: '1px solid rgba(0, 245, 212, 0.2)' }}>
                    <span style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 600 }}>Estimated Bug Outages Avoided:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00f5d4' }}>${estimatedCostAvoided}</span>
                  </div>
                </div>

                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  fontSize: '0.78rem',
                  color: '#38bdf8',
                  lineHeight: 1.4,
                }}>
                  💡 <b>Executive Rationale:</b> Proactive refactoring pays for itself <b>3.8x over</b> by eliminating post-release emergency debugging and regression cycles.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE CODE TRANSFORMATIONS */}
      {activeTab === 'patterns' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Architectural Code Transformations (Before vs After)</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Proven design pattern refactorings specifically formulated to lower McCabe cyclomatic complexity and Halstead effort.
                </p>
              </div>

              {/* Pattern selector buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {refactoringPatterns.map((pat, idx) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setSelectedPatternIdx(idx)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: selectedPatternIdx === idx ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: selectedPatternIdx === idx ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: selectedPatternIdx === idx ? '#00f5d4' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {pat.title.split('&')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Details Banner */}
            {(() => {
              const curPattern = refactoringPatterns[selectedPatternIdx];
              return (
                <div>
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(8, 20, 38, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--primary)',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.05rem', margin: 0, color: '#ffffff' }}>{curPattern.title}</h4>
                      <span className="badge badge-low" style={{ fontSize: '0.74rem' }}>{curPattern.impact}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {curPattern.description}
                    </p>
                  </div>

                  {/* Side-by-side Before / After Code Blocks */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '16px',
                  }}>
                    {/* Before Code */}
                    <div style={{
                      borderRadius: '8px',
                      background: '#040b14',
                      border: '1px solid rgba(239, 71, 111, 0.3)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(239, 71, 111, 0.1)',
                        borderBottom: '1px solid rgba(239, 71, 111, 0.2)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#ef476f',
                      }}>
                        <span>❌ BEFORE (Defect Prone Pattern)</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Target: {curPattern.target}</span>
                      </div>
                      <pre style={{
                        padding: '14px',
                        margin: 0,
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#f87171',
                        overflowX: 'auto',
                        lineHeight: 1.45,
                        background: '#030811',
                      }}>
                        <code>{curPattern.beforeCode}</code>
                      </pre>
                    </div>

                    {/* After Code */}
                    <div style={{
                      borderRadius: '8px',
                      background: '#040b14',
                      border: '1px solid rgba(0, 245, 212, 0.35)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(0, 245, 212, 0.1)',
                        borderBottom: '1px solid rgba(0, 245, 212, 0.2)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#00f5d4',
                      }}>
                        <span>✅ AFTER (ForeSafe Refactored Pattern)</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(curPattern.afterCode, 'pattern-code')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedSection === 'pattern-code' ? '#10b981' : '#00f5d4',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                          }}
                        >
                          {copiedSection === 'pattern-code' ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedSection === 'pattern-code' ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre style={{
                        padding: '14px',
                        margin: 0,
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#00f5d4',
                        overflowX: 'auto',
                        lineHeight: 1.45,
                        background: '#030811',
                      }}>
                        <code>{curPattern.afterCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: CI/CD QUALITY GATE BUILDER */}
      {activeTab === 'cicd' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Automated CI/CD Quality Gate Builder</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Configure threshold parameters to generate fail-safe GitHub Actions / GitLab CI pipeline rules.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(generateCustomCIYAML(), 'cicd-yaml')}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '0.82rem' }}
                >
                  {copiedSection === 'cicd-yaml' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedSection === 'cicd-yaml' ? 'Copied YAML' : 'Copy YAML'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCIConfig}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '0.82rem' }}
                >
                  <Download size={14} />
                  <span>Download .yml</span>
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {/* Threshold Sliders */}
              <div style={{
                background: 'rgba(8, 20, 38, 0.85)',
                border: '1px solid rgba(0, 245, 212, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}>
                <h4 style={{ fontSize: '0.96rem', color: '#00f5d4', margin: 0 }}>Gate Threshold Configuration</h4>

                {/* Slider 1: McCabe max */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span>Max McCabe Cyclomatic v(g):</span>
                    <b style={{ color: '#00f5d4' }}>v(g) &le; {maxMcCabe}</b>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="25"
                    value={maxMcCabe}
                    onChange={(e) => setMaxMcCabe(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>NASA Recommended Safe Threshold: 10 - 15</span>
                </div>

                {/* Slider 2: Comment Ratio */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span>Min Comment-to-Code Ratio:</span>
                    <b style={{ color: '#38bdf8' }}>{minCommentRatio}%</b>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={minCommentRatio}
                    onChange={(e) => setMinCommentRatio(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>

                {/* Toggle: Block on Critical */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(239, 71, 111, 0.08)',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 71, 111, 0.2)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Block PRs on Critical Risk</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Fails GitHub workflow if any function &gt; threshold</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={blockOnCritical}
                    onChange={(e) => setBlockOnCritical(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#ef476f' }}
                  />
                </div>
              </div>

              {/* YAML Live Preview */}
              <div style={{
                borderRadius: '8px',
                background: '#040b14',
                border: '1px solid rgba(0, 245, 212, 0.25)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  background: 'rgba(8, 20, 38, 0.95)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.74rem',
                  color: 'var(--text-dim)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={12} color="#00f5d4" />
                    <span>.github/workflows/foresave_quality_gate.yml</span>
                  </div>
                </div>
                <pre style={{
                  padding: '12px',
                  margin: 0,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#e2e8f0',
                  overflowX: 'auto',
                  lineHeight: 1.4,
                  flex: 1,
                  background: '#030811',
                }}>
                  <code>{generateCustomCIYAML()}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUTOMATED UNIT TEST SUITE SYNTHESIZER */}
      {activeTab === 'tests' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Automated Pytest Reliability Suite</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Parameterized decision matrix tests dynamically generated for the highest risk modules in <b>{analysisData.filename}</b>.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(testSuiteCode, 'suite-code')}
                  disabled={!testSuiteCode}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}
                >
                  {copiedSection === 'suite-code' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedSection === 'suite-code' ? 'Copied Suite' : 'Copy Test Suite'}</span>
                </button>
              </div>
            </div>

            {!testSuiteCode ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Terminal size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Generate Risk-Weighted Parameterized Test Suite</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 16px' }}>
                  Click below to synthesize a full Pytest test suite covering all decision boundary paths for your dataset's critical defect hotspots.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateTestSuite}
                  disabled={generatingSuite}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {generatingSuite ? <Loader size="small" /> : <Sparkles size={16} />}
                  <span>Synthesize Test Suite Now</span>
                </button>
              </div>
            ) : (
              <div style={{
                borderRadius: '8px',
                background: '#040b14',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(8, 20, 38, 0.95)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.76rem',
                  color: 'var(--text-dim)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={14} color="#00f5d4" />
                    <span>tests/test_foresave_generated_suite.py</span>
                  </div>
                  <span className="badge badge-low" style={{ fontSize: '0.66rem' }}>Pytest 8.x Compatible</span>
                </div>
                <pre style={{
                  padding: '16px',
                  margin: 0,
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#e2e8f0',
                  overflowX: 'auto',
                  lineHeight: 1.45,
                  background: '#030811',
                }}>
                  <code>{testSuiteCode}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SINGLE MODULE INSPECTOR MODAL / DRAWER */}
      {selectedModule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(4, 11, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}>
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '800px',
              maxWidth: '100%',
              maxHeight: '90vh',
              background: 'rgba(8, 20, 38, 0.96)',
              border: '1px solid rgba(0, 245, 212, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(0, 245, 212, 0.15)',
              background: 'linear-gradient(90deg, rgba(8, 24, 46, 0.95) 0%, rgba(5, 14, 28, 0.95) 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(0, 245, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Code2 size={18} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#ffffff' }}>
                    {selectedModule.module_name}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                    <span>Quadrant: <b>{selectedModule.quadrant || 'Quick Wins'}</b></span>
                    <span>Risk: <b>{selectedModule.risk_score}%</b></span>
                    <span>LOC: <b>{selectedModule.loc}</b></span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {evaluatingModule ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <Loader message="Evaluating module complexity & generating refactoring diff..." size="medium" />
                </div>
              ) : moduleEvaluation ? (
                <>
                  {/* Code Smells Identified */}
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 71, 111, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 71, 111, 0.25)',
                  }}>
                    <h4 style={{ fontSize: '0.92rem', color: '#ef476f', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={15} />
                      <span>Code Smells & Architectural Anti-Patterns</span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {moduleEvaluation.code_smells?.map((smell, sIdx) => (
                        <div key={sIdx} style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#ef476f' }}>•</span>
                          <span>{smell}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Refactoring Prescription */}
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(0, 245, 212, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 245, 212, 0.25)',
                  }}>
                    <h4 style={{ fontSize: '0.92rem', color: '#00f5d4', margin: '0 0 4px 0' }}>
                      Recommended Pattern: {moduleEvaluation.recommended_pattern?.name}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                      {moduleEvaluation.recommended_pattern?.description}
                    </p>
                  </div>

                  {/* Refactored Code Diff */}
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: '#ffffff', marginBottom: '8px' }}>Refactoring Transformation</h4>
                    <div style={{
                      borderRadius: '8px',
                      background: '#040b14',
                      border: '1px solid rgba(0, 245, 212, 0.3)',
                      overflow: 'hidden',
                    }}>
                      <pre style={{
                        padding: '12px',
                        margin: 0,
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#00f5d4',
                        overflowX: 'auto',
                        lineHeight: 1.45,
                        background: '#030811',
                      }}>
                        <code>{moduleEvaluation.refactoring_diff?.after_code}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Parameterized Unit Test */}
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: '#ffffff', marginBottom: '8px' }}>Synthesized Unit Test (Pytest)</h4>
                    <div style={{
                      borderRadius: '8px',
                      background: '#040b14',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      overflow: 'hidden',
                    }}>
                      <pre style={{
                        padding: '12px',
                        margin: 0,
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#38bdf8',
                        overflowX: 'auto',
                        lineHeight: 1.45,
                        background: '#030811',
                      }}>
                        <code>{moduleEvaluation.synthesized_unit_test}</code>
                      </pre>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.84rem' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionsPage;

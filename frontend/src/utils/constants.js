export const RISK_LEVELS = {
  CRITICAL: {
    label: 'Critical',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.14)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
    threshold: '>= 85%',
    description: 'Extremely high defect probability with severe architectural bottlenecks.',
  },
  HIGH: {
    label: 'High',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.14)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    threshold: '60% - 84%',
    description: 'Elevated failure likelihood due to cyclomatic complexity and path explosion.',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.14)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    threshold: '30% - 59%',
    description: 'Moderate code complexity requiring test coverage reviews.',
  },
  LOW: {
    label: 'Low',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.14)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    threshold: '< 30%',
    description: 'Healthy software metrics conforming to maintainability standards.',
  },
};

export const PIPELINE_AGENTS = [
  {
    id: 'validation_agent',
    name: '1. Schema & Validation Agent',
    description: 'Verifies NASA JM1 column headers, null counts, and data format integrity.',
  },
  {
    id: 'preprocessing_agent',
    name: '2. Preprocessing & Scaler Agent',
    description: 'Applies standard scaling and median imputation across 21 Halstead & McCabe dimensions.',
  },
  {
    id: 'prediction_agent',
    name: '3. Dual ML Prediction Agent',
    description: 'Executes Random Forest and XGBoost inference models with local feature explanations.',
  },
  {
    id: 'risk_analysis_agent',
    name: '4. Software Risk & Hotspot Agent',
    description: 'Classifies failure tiers and identifies critical defect hotspots.',
  },
  {
    id: 'recommendation_agent',
    name: '5. Actionable Recommendation Agent',
    description: 'Formulates developer refactoring rules based on cyclomatic and Halstead effort metrics.',
  },
  {
    id: 'debugging_agent',
    name: '6. Defect Debugging Agent',
    description: 'Generates concrete parameterized test plans and mutation testing guardrails.',
  },
];

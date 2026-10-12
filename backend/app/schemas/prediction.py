from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MessageResponse(BaseModel):
    message: str
    status: str = "success"

class AgentStatusStep(BaseModel):
    agent_name: str
    display_name: str
    status: str  # "pending", "running", "completed", "failed"
    duration_ms: float
    summary: str
    details: Optional[Dict[str, Any]] = None

class FeatureImpact(BaseModel):
    feature: str
    display_name: str
    value: float
    importance_score: float
    description: str

class ModulePrediction(BaseModel):
    id: Optional[int] = None
    module_name: str
    rf_probability: float
    xgb_probability: float
    final_risk_score: float
    risk_level: str  # "Low", "Medium", "High", "Critical"
    top_contributing_features: List[FeatureImpact]
    recommendations: List[str]
    debugging_remediations: List[str]
    raw_metrics: Dict[str, Any]

class ModelMetric(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float

class ModelComparison(BaseModel):
    random_forest: ModelMetric
    xgboost: ModelMetric
    selected_primary_model: str
    comparison_summary: str

class RiskDistribution(BaseModel):
    low: int
    medium: int
    high: int
    critical: int
    total: int
    avg_risk_score: float
    critical_hotspots_count: int

class PipelineResultResponse(BaseModel):
    id: Optional[int] = None
    history_id: Optional[int] = None
    dataset_id: Optional[int] = None
    filename: str
    total_modules: int
    risk_distribution: RiskDistribution
    model_comparison: ModelComparison
    top_global_features: List[Dict[str, Any]]
    agent_pipeline_telemetry: List[AgentStatusStep]
    predictions: List[ModulePrediction]
    high_priority_recommendations: List[str]
    generated_at: datetime = datetime.now(timezone.utc)


class HistoryItemOut(BaseModel):
    id: int
    dataset_id: Optional[int] = None
    filename: str
    total_modules: int
    risk_distribution: RiskDistribution
    selected_primary_model: str
    created_at: datetime
    has_pdf_report: bool = False
    report_id: Optional[int] = None

class UploadValidationResponse(BaseModel):
    filename: str
    row_count: int
    is_valid: bool
    schema_status: str
    columns_found: List[str]
    missing_columns: List[str]
    sample_preview: List[Dict[str, Any]]
    message: str

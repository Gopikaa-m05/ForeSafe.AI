import os
import json
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
from sqlalchemy.orm import Session

from app.agents.validation_agent import ValidationAgent
from app.agents.preprocessing_agent import PreprocessingAgent
from app.agents.prediction_agent import PredictionAgent
from app.agents.risk_analysis_agent import RiskAnalysisAgent
from app.agents.recommendation_agent import RecommendationAgent
from app.agents.debugging_agent import DebuggingAgent
from app.ml.train import FEATURE_COLUMNS, FEATURE_DESCRIPTIONS
from app.db.models import Dataset, PredictionResult, AnalysisHistory

logger = logging.getLogger("software_failure.orchestrator")

class AgentPipelineOrchestrator:
    def __init__(self):
        self.pipeline = [
            ValidationAgent(),
            PreprocessingAgent(),
            PredictionAgent(),
            RiskAnalysisAgent(),
            RecommendationAgent(),
            DebuggingAgent()
        ]

    def run_pipeline(
        self,
        raw_df: pd.DataFrame,
        filename: str = "uploaded_modules.csv",
        user_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Executes the full 6-agent AI prediction pipeline sequentially.
        """
        logger.info(f"Starting Multi-Agent Pipeline for file: {filename}")
        
        state: Dict[str, Any] = {
            "raw_df": raw_df,
            "filename": filename,
            "telemetry": []
        }
        
        # Execute each agent in strict sequence
        for agent in self.pipeline:
            state = agent.execute(state)
            
        # Format predictions into structured response payload
        processed_df: pd.DataFrame = state["processed_df"]
        module_names: List[str] = state["module_names"]
        rf_probs = state["rf_probs"]
        xgb_probs = state["xgb_probs"]
        final_risk_scores = state["final_risk_scores"]
        risk_levels: List[str] = state["risk_levels"]
        explanations = state["explanations"]
        recs = state["module_recommendations"]
        debug_plans = state["debugging_remediations"]
        
        predictions_list = []
        for i in range(len(processed_df)):
            raw_row = processed_df.iloc[i].to_dict()
            module_pred = {
                "id": i + 1,
                "module_name": module_names[i],
                "rf_probability": round(float(rf_probs[i]), 4),
                "xgb_probability": round(float(xgb_probs[i]), 4),
                "final_risk_score": round(float(final_risk_scores[i]), 4),
                "risk_level": risk_levels[i],
                "top_contributing_features": explanations[i],
                "recommendations": recs[i],
                "debugging_remediations": debug_plans[i],
                "raw_metrics": {k: float(v) for k, v in raw_row.items() if k in FEATURE_COLUMNS}
            }
            predictions_list.append(module_pred)
            
        # Sort predictions so that Critical & High risk modules appear first
        risk_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
        predictions_list.sort(key=lambda x: (risk_order.get(x["risk_level"], 4), -x["final_risk_score"]))
        
        # Calculate global top contributing features
        xgb_importances = state["model_comparison"]["xgboost"].get("feature_importances", {})
        sorted_global_features = sorted(
            [
                {
                    "feature": k,
                    "display_name": FEATURE_DESCRIPTIONS.get(k, k),
                    "importance_score": v
                }
                for k, v in xgb_importances.items()
            ],
            key=lambda x: x["importance_score"],
            reverse=True
        )[:8]
        
        pipeline_output = {
            "filename": filename,
            "total_modules": len(processed_df),
            "risk_distribution": state["risk_distribution"],
            "model_comparison": state["model_comparison"],
            "top_global_features": sorted_global_features,
            "agent_pipeline_telemetry": state["telemetry"],
            "predictions": predictions_list,
            "high_priority_recommendations": state["high_priority_recommendations"]
        }
        
        # Persist to Database if session provided
        dataset_id = None
        if db and user_id:
            try:
                # 1. Create Dataset record
                dataset = Dataset(
                    user_id=user_id,
                    filename=filename,
                    upload_path=f"uploads/{filename}",
                    row_count=len(processed_df),
                    validation_status=state.get("validation_status", "Valid")
                )
                db.add(dataset)
                db.flush()
                dataset_id = dataset.id
                pipeline_output["dataset_id"] = dataset_id
                
                # 2. Save individual prediction records
                for pred in predictions_list:
                    pred_record = PredictionResult(
                        dataset_id=dataset.id,
                        module_name=pred["module_name"],
                        rf_probability=pred["rf_probability"],
                        xgb_probability=pred["xgb_probability"],
                        final_risk_score=pred["final_risk_score"],
                        risk_level=pred["risk_level"],
                        metrics_json={
                            "top_features": pred["top_contributing_features"],
                            "recommendations": pred["recommendations"],
                            "debugging_remediations": pred["debugging_remediations"],
                            "raw_metrics": pred["raw_metrics"]
                        }
                    )
                    db.add(pred_record)
                    
                # 3. Create AnalysisHistory summary
                history_record = AnalysisHistory(
                    user_id=user_id,
                    dataset_id=dataset.id,
                    summary_json=pipeline_output
                )
                db.add(history_record)
                db.flush()
                
                pipeline_output["id"] = history_record.id
                pipeline_output["history_id"] = history_record.id
                history_record.summary_json = pipeline_output
                db.commit()
                logger.info(f"Successfully saved analysis history for user {user_id} with dataset ID {dataset_id} and history ID {history_record.id}")


                # 4. Optional Server-side Firestore sync if Firebase Admin is initialized
                try:
                    from firebase_config import db as firestore_db
                    if firestore_db:
                        firestore_db.collection("predictions").add({
                            "filename": filename,
                            "user_id": user_id,
                            "total_modules": len(processed_df),
                            "risk_distribution": state.get("risk_distribution", {}),
                            "model_comparison": state.get("model_comparison", {}),
                            "top_hotspots": [
                                {
                                    "module_name": p["module_name"],
                                    "final_risk_score": p["final_risk_score"],
                                    "risk_level": p["risk_level"]
                                }
                                for p in predictions_list[:10]
                            ],
                            "created_at": pd.Timestamp.now().isoformat()
                        })
                        logger.info("Successfully synced prediction record to Cloud Firestore.")
                except Exception as firestore_err:
                    logger.debug(f"Firestore cloud sync skipped/failed: {firestore_err}")
            except Exception as e:
                db.rollback()
                logger.error(f"Error persisting pipeline results to DB: {e}", exc_info=True)
                
        return pipeline_output

pipeline_orchestrator = AgentPipelineOrchestrator()


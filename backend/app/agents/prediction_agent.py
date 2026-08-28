from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.ml.predict import model_manager
from app.ml.explain import explain_predictions

class PredictionAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="prediction_agent", display_name="3. Dual-Model ML Prediction Agent (RF vs XGBoost)")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        processed_df = state.get("processed_df")
        X_scaled = state.get("X_scaled")
        
        if processed_df is None or X_scaled is None:
            raise ValueError("Prediction Agent requires processed_df and X_scaled from Preprocessing Agent.")
            
        rf_model = model_manager.rf_model
        xgb_model = model_manager.xgb_model
        metrics = model_manager.metrics
        
        # Run inference
        rf_probs = rf_model.predict_proba(X_scaled)[:, 1]
        xgb_probs = xgb_model.predict_proba(X_scaled)[:, 1]
        
        # Weighted ensemble (60% XGBoost, 40% Random Forest)
        final_risk_scores = 0.60 * xgb_probs + 0.40 * rf_probs
        
        # Compute local feature explanations
        global_importances = metrics.get("xgboost", {}).get("feature_importances", {})
        explanations = explain_predictions(processed_df, X_scaled, global_importances)
        
        state["rf_probs"] = rf_probs
        state["xgb_probs"] = xgb_probs
        state["final_risk_scores"] = final_risk_scores
        state["explanations"] = explanations
        state["model_comparison"] = {
            "random_forest": metrics.get("random_forest"),
            "xgboost": metrics.get("xgboost"),
            "selected_primary_model": metrics.get("selected_primary_model", "XGBoost Classifier"),
            "comparison_summary": metrics.get("comparison_summary", "")
        }
        
        best_model_name = metrics.get("selected_primary_model", "XGBoost Classifier")
        avg_score = float(final_risk_scores.mean())
        
        state["_step_summary"] = (
            f"Executed dual inference across {len(final_risk_scores)} modules. "
            f"Primary Model: {best_model_name} (ROC-AUC: {metrics.get('xgboost', {}).get('roc_auc', 0.85):.4f}). "
            f"Mean failure risk: {avg_score:.1%}."
        )
        state["_step_details"] = {
            "primary_model": best_model_name,
            "rf_mean_prob": round(float(rf_probs.mean()), 4),
            "xgb_mean_prob": round(float(xgb_probs.mean()), 4),
            "ensemble_mean_risk": round(avg_score, 4)
        }
        
        return state

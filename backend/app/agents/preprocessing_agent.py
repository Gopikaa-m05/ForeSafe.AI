import pandas as pd
import numpy as np
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.ml.predict import model_manager
from app.ml.train import FEATURE_COLUMNS

class PreprocessingAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="preprocessing_agent", display_name="2. Feature Preprocessing & Normalization Agent")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        df: pd.DataFrame = state.get("cleaned_df")
        if df is None:
            raise ValueError("Preprocessing Agent requires cleaned_df from Validation Agent.")
            
        processed_df = df.copy()
        
        # Clean numeric data and impute missing values
        imputed_features = []
        for col in FEATURE_COLUMNS:
            if col in processed_df.columns:
                processed_df[col] = pd.to_numeric(
                    processed_df[col].astype(str).str.replace('?', 'NaN'),
                    errors='coerce'
                )
                median_val = processed_df[col].median()
                if pd.isna(median_val):
                    median_val = 0.0
                if processed_df[col].isna().any():
                    imputed_features.append(col)
                processed_df[col] = processed_df[col].fillna(median_val)
            else:
                # Missing column entirely - fill with baseline zero
                processed_df[col] = 0.0
                imputed_features.append(col)
                
        # Scale features using pre-trained StandardScaler
        X = processed_df[FEATURE_COLUMNS]
        X_scaled = model_manager.scaler.transform(X)
        
        state["processed_df"] = processed_df
        state["X_scaled"] = X_scaled
        state["_step_summary"] = (
            f"Preprocessed and normalized {len(X)} feature vectors across 21 Halstead & McCabe dimensions. "
            f"Transformed matrices ready for ML inference."
        )
        state["_step_details"] = {
            "dimensions_processed": len(FEATURE_COLUMNS),
            "imputed_features": imputed_features[:5],
            "scaling_applied": "StandardScaler (Z-Score Normalization)"
        }
        
        return state

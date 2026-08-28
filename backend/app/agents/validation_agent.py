import pandas as pd
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.ml.train import FEATURE_COLUMNS

class ValidationAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="validation_agent", display_name="1. Schema & Validation Agent")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        df: pd.DataFrame = state.get("raw_df")
        if df is None or not isinstance(df, pd.DataFrame):
            raise ValueError("Validation Agent received invalid or missing input DataFrame.")
            
        if len(df) == 0:
            raise ValueError("Uploaded dataset is empty.")
            
        # Clean column names
        df.columns = [c.strip() for c in df.columns]
        
        # Check standard JM1 columns
        found_features = [c for c in FEATURE_COLUMNS if c in df.columns]
        missing_features = [c for c in FEATURE_COLUMNS if c not in df.columns]
        
        # Identify or synthesize module names
        module_col_candidates = ["module", "module_name", "name", "file", "function", "class", "id"]
        found_mod_col = next((c for c in module_col_candidates if c in [col.lower() for col in df.columns]), None)
        
        if found_mod_col:
            module_names = df[found_mod_col].astype(str).tolist()
        else:
            module_names = [f"Module_{i+1:03d}" for i in range(len(df))]
            
        # Check row anomalies / missing values
        null_count = int(df[found_features].isna().sum().sum())
        
        # Schema validity status
        is_valid = len(found_features) >= 10  # Must match at least 10 key Halstead/McCabe features
        if not is_valid:
            raise ValueError(
                f"Dataset does not conform to NASA JM1 schema. Found only {len(found_features)} features: {found_features}. "
                f"Required features include: {FEATURE_COLUMNS[:8]}"
            )
            
        status_label = "Valid" if len(missing_features) == 0 else "Warning (Imputed Features)"
        
        state["cleaned_df"] = df
        state["module_names"] = module_names
        state["found_features"] = found_features
        state["missing_features"] = missing_features
        state["validation_status"] = status_label
        
        state["_step_summary"] = (
            f"Validated {len(df)} software modules. Schema status: {status_label}. "
            f"Found {len(found_features)}/21 NASA JM1 metric columns with {null_count} null elements handled."
        )
        state["_step_details"] = {
            "total_modules": len(df),
            "found_features_count": len(found_features),
            "missing_features_count": len(missing_features),
            "null_elements": null_count,
            "status": status_label
        }
        
        return state

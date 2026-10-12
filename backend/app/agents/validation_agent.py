import pandas as pd
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.ml.train import FEATURE_COLUMNS
from app.utils.data_parser import prepare_pipeline_dataframe

class ValidationAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="validation_agent", display_name="1. Schema & Validation Agent")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        df: pd.DataFrame = state.get("raw_df")
        if df is None or not isinstance(df, pd.DataFrame):
            raise ValueError("Validation Agent received invalid or missing input DataFrame.")
            
        if len(df) == 0:
            raise ValueError("Uploaded dataset contains 0 records.")
            
        # Process and normalize features using the intelligent dataset parser
        clean_df, module_names, meta = prepare_pipeline_dataframe(df)
        
        found_features = meta["found_features"]
        missing_features = [c for c in FEATURE_COLUMNS if c not in found_features]
        aliased_features = meta.get("aliased_features", [])
        synthesized_features = meta.get("synthesized_features", [])
        
        # Schema validity status
        if len(found_features) == len(FEATURE_COLUMNS):
            status_label = "Valid (Full 21-Feature Schema)"
        elif len(found_features) >= 10:
            status_label = f"Valid ({len(found_features)}/21 Matched)"
        else:
            status_label = f"Synthesized & Imputed ({len(found_features)} Direct / {len(missing_features)} Auto-Mapped)"
            
        state["cleaned_df"] = clean_df
        state["module_names"] = module_names
        state["found_features"] = found_features
        state["missing_features"] = missing_features
        state["validation_status"] = status_label
        
        summary_msg = (
            f"Validated {len(clean_df)} software modules. Schema status: {status_label}. "
            f"Mapped {len(found_features)}/21 NASA JM1 metrics."
        )
        if synthesized_features:
            summary_msg += f" Synthesized {len(synthesized_features)} Halstead/McCabe complexity dimensions."
            
        state["_step_summary"] = summary_msg
        state["_step_details"] = {
            "total_modules": len(clean_df),
            "found_features_count": len(found_features),
            "missing_features_count": len(missing_features),
            "aliased_columns": aliased_features[:5],
            "synthesized_columns": synthesized_features[:5],
            "status": status_label
        }
        
        return state


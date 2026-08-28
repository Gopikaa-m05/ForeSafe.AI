import numpy as np
import pandas as pd
from typing import List, Dict, Any
from app.ml.train import FEATURE_COLUMNS, FEATURE_DESCRIPTIONS

FRIENDLY_EXPLANATIONS = {
    "v(g)": {
        "high": "High cyclomatic complexity indicates excessive conditional branches and deeply nested logic.",
        "normal": "Cyclomatic complexity is within manageable bounds."
    },
    "ev(g)": {
        "high": "High essential complexity reflects unstructured control flow (e.g. goto-like constructs, multiple breaks).",
        "normal": "Essential complexity is structured."
    },
    "iv(g)": {
        "high": "High design complexity points to tight coupling and complex module call graphs.",
        "normal": "Design coupling is within standard tolerances."
    },
    "loc": {
        "high": "Large lines of code size makes the module prone to cognitive overload and regression risks.",
        "normal": "Module length is compact."
    },
    "e": {
        "high": "Extremely high Halstead mental effort required to comprehend and safely modify this unit.",
        "normal": "Mental comprehension effort is reasonable."
    },
    "d": {
        "high": "High Halstead difficulty reflects error-prone operand/operator ratios.",
        "normal": "Program structure is straightforward."
    },
    "b": {
        "high": "Halstead estimated delivered bug count is elevated based on volume and vocabulary.",
        "normal": "Estimated delivered defect density is low."
    },
    "branchCount": {
        "high": "Large number of decision branches exponentially increases test path explosion.",
        "normal": "Branch count is controlled."
    },
    "lOComment": {
        "low": "Low comment ratio indicates poor self-documentation relative to code size.",
        "normal": "Adequately commented."
    }
}

def explain_predictions(
    df: pd.DataFrame,
    X_scaled: np.ndarray,
    feature_importances: Dict[str, float]
) -> List[List[Dict[str, Any]]]:
    """
    Computes local feature contribution explanations for each sample.
    Combines global tree feature importances with normalized sample deviation (z-score impact).
    """
    explanations = []
    
    # Global importance weights array
    importance_vector = np.array([feature_importances.get(f, 0.05) for f in FEATURE_COLUMNS])
    
    for i in range(len(df)):
        sample_scaled = X_scaled[i]
        # Impact is deviation weighted by global feature importance
        impacts = np.abs(sample_scaled) * importance_vector
        top_indices = np.argsort(impacts)[::-1][:3]
        
        module_features = []
        for idx in top_indices:
            feat_name = FEATURE_COLUMNS[idx]
            raw_val = float(df.iloc[i].get(feat_name, 0.0))
            scaled_val = float(sample_scaled[idx])
            imp_score = float(impacts[idx])
            
            # Generate friendly description
            friendly_text = FEATURE_DESCRIPTIONS.get(feat_name, feat_name)
            if feat_name in FRIENDLY_EXPLANATIONS:
                if scaled_val > 0.5:
                    friendly_text = FRIENDLY_EXPLANATIONS[feat_name]["high"]
                else:
                    friendly_text = FRIENDLY_EXPLANATIONS[feat_name].get("normal", friendly_text)
                    
            module_features.append({
                "feature": feat_name,
                "display_name": FEATURE_DESCRIPTIONS.get(feat_name, feat_name),
                "value": round(raw_val, 2),
                "importance_score": round(imp_score, 4),
                "description": friendly_text
            })
            
        explanations.append(module_features)
        
    return explanations

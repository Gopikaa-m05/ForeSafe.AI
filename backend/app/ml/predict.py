import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from app.core.config import settings
from app.ml.train import FEATURE_COLUMNS, train_and_save_models

class ModelManager:
    _instance = None
    
    def __init__(self):
        self.rf_model = None
        self.xgb_model = None
        self.scaler = None
        self.metrics = None
        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance

    def load_models(self, force_retrain: bool = False):
        rf_path = os.path.join(settings.MODEL_DIR, "random_forest_model.joblib")
        xgb_path = os.path.join(settings.MODEL_DIR, "xgboost_model.joblib")
        scaler_path = os.path.join(settings.MODEL_DIR, "scaler.joblib")
        metrics_path = os.path.join(settings.MODEL_DIR, "training_metrics.json")
        
        if (
            force_retrain
            or not os.path.exists(rf_path)
            or not os.path.exists(xgb_path)
            or not os.path.exists(scaler_path)
            or not os.path.exists(metrics_path)
        ):
            print("Models not found or retrain requested. Training models now...")
            self.metrics = train_and_save_models(output_dir=settings.MODEL_DIR)
            
        self.rf_model = joblib.load(rf_path)
        self.xgb_model = joblib.load(xgb_path)
        self.scaler = joblib.load(scaler_path)
        
        with open(metrics_path, "r", encoding="utf-8") as f:
            self.metrics = json.load(f)
            
    def predict_dataframe(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        # Ensure clean numeric columns
        clean_df = df.copy()
        for col in FEATURE_COLUMNS:
            if col in clean_df.columns:
                clean_df[col] = pd.to_numeric(clean_df[col].astype(str).str.replace('?', 'NaN'), errors='coerce')
                median_val = clean_df[col].median()
                clean_df[col] = clean_df[col].fillna(median_val if not pd.isna(median_val) else 0.0)
            else:
                clean_df[col] = 0.0
                
        X = clean_df[FEATURE_COLUMNS]
        X_scaled = self.scaler.transform(X)
        
        rf_probs = self.rf_model.predict_proba(X_scaled)[:, 1]
        xgb_probs = self.xgb_model.predict_proba(X_scaled)[:, 1]
        
        # Weighted ensemble risk score (60% XGBoost, 40% Random Forest)
        final_risk_scores = 0.60 * xgb_probs + 0.40 * rf_probs
        
        return rf_probs, xgb_probs, final_risk_scores, X_scaled

model_manager = ModelManager.get_instance()

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier

FEATURE_COLUMNS = [
    "loc", "v(g)", "ev(g)", "iv(g)", "n", "v", "l", "d", "i", "e", "b", "t",
    "lOCode", "lOComment", "lOBlank", "locCodeAndComment",
    "uniq_Op", "uniq_Opnd", "total_Op", "total_Opnd", "branchCount"
]

FEATURE_DESCRIPTIONS = {
    "loc": "Lines of Code (McCabe's length)",
    "v(g)": "Cyclomatic Complexity (Number of linearly independent paths)",
    "ev(g)": "Essential Complexity (Degree of un-structuredness)",
    "iv(g)": "Design Complexity (Module integration complexity)",
    "n": "Halstead Total Operators and Operands (N1 + N2)",
    "v": "Halstead Volume (Program size in bits)",
    "l": "Halstead Program Level (Abstraction depth)",
    "d": "Halstead Difficulty (Error-proneness to write/maintain)",
    "i": "Halstead Intelligence (Information content)",
    "e": "Halstead Effort (Mental effort to develop/understand)",
    "b": "Halstead Delivered Bugs Estimate",
    "t": "Halstead Time Estimator (Seconds)",
    "lOCode": "Executable Lines of Code",
    "lOComment": "Lines of Comments",
    "lOBlank": "Blank Lines Count",
    "locCodeAndComment": "Lines Containing Both Code and Comment",
    "uniq_Op": "Unique Operators Count (n1)",
    "uniq_Opnd": "Unique Operands Count (n2)",
    "total_Op": "Total Operators Count (N1)",
    "total_Opnd": "Total Operands Count (N2)",
    "branchCount": "Total Decision Branches Count"
}

def train_and_save_models(data_path: str = None, output_dir: str = None):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if not output_dir:
        output_dir = os.path.join(base_dir, "model_registry")
    os.makedirs(output_dir, exist_ok=True)
    
    if not data_path:
        data_path = os.path.abspath(os.path.join(base_dir, "../../data/jm1.csv"))
        
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}. Running generator...")
        import sys
        sys.path.insert(0, os.path.abspath(os.path.join(base_dir, "../..")))
        from data.generate_jm1 import fetch_or_generate_jm1
        fetch_or_generate_jm1()
        
    print(f"Loading NASA JM1 dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Clean non-numeric values and standardize column headers
    df.columns = [c.strip() for c in df.columns]
    
    # Handle missing/object types
    for col in FEATURE_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace('?', 'NaN'), errors='coerce')
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val if not pd.isna(median_val) else 0.0)
            
    # Target column
    target_col = "defects" if "defects" in df.columns else df.columns[-1]
    y = df[target_col].astype(str).str.strip().str.lower().isin(['true', 'y', '1', 't']).astype(int)
    X = df[FEATURE_COLUMNS]
    
    print(f"Dataset Shape: {X.shape}, Defect Class Distribution: {dict(y.value_counts())}")
    
    # Train-test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 1. Random Forest Classifier
    print("Training Random Forest Classifier...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=14,
        min_samples_split=6,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_scaled, y_train)
    rf_preds = rf.predict(X_test_scaled)
    rf_probs = rf.predict_proba(X_test_scaled)[:, 1]
    
    rf_metrics = {
        "model_name": "Random Forest Classifier",
        "accuracy": round(float(accuracy_score(y_test, rf_preds)), 4),
        "precision": round(float(precision_score(y_test, rf_preds, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, rf_preds, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, rf_preds, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, rf_probs)), 4),
        "feature_importances": {
            feat: round(float(imp), 4)
            for feat, imp in zip(FEATURE_COLUMNS, rf.feature_importances_)
        }
    }
    print(f"Random Forest Performance: F1={rf_metrics['f1_score']}, ROC-AUC={rf_metrics['roc_auc']}, Acc={rf_metrics['accuracy']}")
    
    # 2. XGBoost Classifier
    print("Training XGBoost Classifier...")
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos = max(1.0, float(neg_count) / max(1.0, float(pos_count)))
    
    xgb = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.06,
        scale_pos_weight=scale_pos,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1
    )
    xgb.fit(X_train_scaled, y_train)
    xgb_preds = xgb.predict(X_test_scaled)
    xgb_probs = xgb.predict_proba(X_test_scaled)[:, 1]
    
    xgb_metrics = {
        "model_name": "XGBoost Classifier",
        "accuracy": round(float(accuracy_score(y_test, xgb_preds)), 4),
        "precision": round(float(precision_score(y_test, xgb_preds, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, xgb_preds, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, xgb_preds, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, xgb_probs)), 4),
        "feature_importances": {
            feat: round(float(imp), 4)
            for feat, imp in zip(FEATURE_COLUMNS, xgb.feature_importances_)
        }
    }
    print(f"XGBoost Performance: F1={xgb_metrics['f1_score']}, ROC-AUC={xgb_metrics['roc_auc']}, Acc={xgb_metrics['accuracy']}")
    
    # Pick primary model based on ROC-AUC + F1 composite
    rf_composite = rf_metrics["roc_auc"] * 0.6 + rf_metrics["f1_score"] * 0.4
    xgb_composite = xgb_metrics["roc_auc"] * 0.6 + xgb_metrics["f1_score"] * 0.4
    best_model = "XGBoost Classifier" if xgb_composite >= rf_composite else "Random Forest Classifier"
    
    summary = (
        f"Trained on NASA PROMISE JM1 dataset. {best_model} achieved optimal balance of recall and "
        f"discriminative power (ROC-AUC: {max(rf_metrics['roc_auc'], xgb_metrics['roc_auc']):.4f})."
    )
    
    comparison_meta = {
        "random_forest": rf_metrics,
        "xgboost": xgb_metrics,
        "selected_primary_model": best_model,
        "comparison_summary": summary,
        "feature_columns": FEATURE_COLUMNS,
        "feature_descriptions": FEATURE_DESCRIPTIONS,
        "dataset_samples": len(df),
        "defect_rate": round(float(y.mean()), 4)
    }
    
    # Save artifacts
    joblib.dump(rf, os.path.join(output_dir, "random_forest_model.joblib"))
    joblib.dump(xgb, os.path.join(output_dir, "xgboost_model.joblib"))
    joblib.dump(scaler, os.path.join(output_dir, "scaler.joblib"))
    
    with open(os.path.join(output_dir, "training_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(comparison_meta, f, indent=2)
        
    print(f"Successfully trained and saved all models to {output_dir}")
    return comparison_meta

if __name__ == "__main__":
    train_and_save_models()

import io
import os
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.models import User, Dataset, PredictionResult, RiskReport, AnalysisHistory
from app.ml.train import FEATURE_COLUMNS

Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    db = SessionLocal()
    db.query(RiskReport).delete()
    db.query(PredictionResult).delete()
    db.query(AnalysisHistory).delete()
    db.query(Dataset).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    yield

def get_auth_headers():
    reg_payload = {
        "full_name": "Pipeline Tester",
        "email": "pipeline@test.com",
        "password": "Password123!"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def create_sample_csv():
    data = {col: [10.0, 25.0, 50.0, 5.0, 80.0] for col in FEATURE_COLUMNS}
    data["module"] = ["AuthModule", "PaymentService", "DataParser", "CacheManager", "ReportEngine"]
    df = pd.DataFrame(data)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return buf.getvalue().encode('utf-8')

def test_upload_and_predict_flow():
    headers = get_auth_headers()
    csv_bytes = create_sample_csv()
    
    # 1. Test /upload
    upload_res = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("test_modules.csv", io.BytesIO(csv_bytes), "text/csv")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["is_valid"] is True
    assert upload_data["row_count"] == 5

    # 2. Test /predict
    predict_res = client.post(
        "/api/predict",
        headers=headers,
        files={"file": ("test_modules.csv", io.BytesIO(csv_bytes), "text/csv")}
    )
    assert predict_res.status_code == 200
    pred_data = predict_res.json()
    assert pred_data["total_modules"] == 5
    assert len(pred_data["predictions"]) == 5
    assert len(pred_data["agent_pipeline_telemetry"]) == 6
    assert "risk_distribution" in pred_data
    assert "model_comparison" in pred_data

    # 3. Test /history
    history_res = client.get("/api/history", headers=headers)
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert history_data["total"] >= 1
    history_id = history_data["items"][0]["id"]

    # 4. Test /reports/{id}/download (PDF)
    report_res = client.get(f"/api/reports/{history_id}/download", headers=headers)
    assert report_res.status_code == 200
    assert report_res.headers["content-type"] == "application/pdf"

    # 5. Test /reports/{id}/excel (Excel)
    excel_res = client.get(f"/api/reports/{history_id}/excel", headers=headers)
    assert excel_res.status_code == 200

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


def test_uppercase_and_alias_columns():
    headers = get_auth_headers()
    # CSV with alternate alias names and uppercase extension
    csv_text = (
        "Lines_Of_Code,Cyclomatic_Complexity,Essential_Complexity,Design_Complexity,Total_Tokens,effort,module_name\n"
        "25,4,2,3,120,5400,AuthHandler\n"
        "150,30,12,18,650,210000,OrderProcessor\n"
        "12,2,1,1,45,800,Utils\n"
    )
    upload_res = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("CUSTOM_METRICS.CSV", io.BytesIO(csv_text.encode('utf-8')), "text/csv")}
    )
    assert upload_res.status_code == 200
    up_data = upload_res.json()
    assert up_data["is_valid"] is True
    assert up_data["row_count"] == 3

    predict_res = client.post(
        "/api/predict",
        headers=headers,
        files={"file": ("CUSTOM_METRICS.CSV", io.BytesIO(csv_text.encode('utf-8')), "text/csv")}
    )
    assert predict_res.status_code == 200
    p_data = predict_res.json()
    assert p_data["total_modules"] == 3
    assert p_data["predictions"][0]["module_name"] in ["AuthHandler", "OrderProcessor", "Utils"]


def test_semicolon_delimited_and_bom_encoding():
    headers = get_auth_headers()
    # Semicolon delimited with UTF-8 BOM
    csv_text = (
        "\ufeffloc;v(g);ev(g);iv(g);n;v;l;d;i;e;b;t;lOCode;lOComment;lOBlank;locCodeAndComment;uniq_Op;uniq_Opnd;total_Op;total_Opnd;branchCount;name\n"
        "20;4;1;2;80;380;0.08;12;31;4560;0.13;253;16;2;2;0;11;17;45;35;7;ModuleAlpha\n"
        "85;18;7;11;380;2400;0.03;33;72;79200;0.80;4400;68;8;9;2;25;44;220;160;35;ModuleBeta\n"
    )
    bom_bytes = csv_text.encode('utf-8-sig')

    upload_res = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("semicolon_bom.csv", io.BytesIO(bom_bytes), "text/csv")}
    )
    assert upload_res.status_code == 200
    assert upload_res.json()["is_valid"] is True

    predict_res = client.post(
        "/api/predict",
        headers=headers,
        files={"file": ("semicolon_bom.csv", io.BytesIO(bom_bytes), "text/csv")}
    )
    assert predict_res.status_code == 200
    assert predict_res.json()["total_modules"] == 2


def test_arff_format_with_comments():
    headers = get_auth_headers()
    arff_text = (
        "% NASA JM1 Software Defect Data\n"
        "% Promise Repository\n"
        "@relation jm1\n"
        "@attribute loc numeric\n"
        "@attribute v(g) numeric\n"
        "@attribute ev(g) numeric\n"
        "@attribute iv(g) numeric\n"
        "@attribute n numeric\n"
        "@attribute v numeric\n"
        "@attribute l numeric\n"
        "@attribute d numeric\n"
        "@attribute i numeric\n"
        "@attribute e numeric\n"
        "@attribute b numeric\n"
        "@attribute t numeric\n"
        "@attribute lOCode numeric\n"
        "@attribute lOComment numeric\n"
        "@attribute lOBlank numeric\n"
        "@attribute locCodeAndComment numeric\n"
        "@attribute uniq_Op numeric\n"
        "@attribute uniq_Opnd numeric\n"
        "@attribute total_Op numeric\n"
        "@attribute total_Opnd numeric\n"
        "@attribute branchCount numeric\n"
        "@attribute defects {false, true}\n"
        "@data\n"
        "10,2,1,1,30,120,0.15,6.5,18.4,780,0.04,43.3,8,1,1,0,7,11,18,12,3,false\n"
        "65,14,5,9,280,1750,0.04,28,62.5,49000,0.58,2722,50,6,9,1,21,39,165,115,27,true\n"
    )

    upload_res = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("dataset.csv", io.BytesIO(arff_text.encode('utf-8')), "text/csv")}
    )
    assert upload_res.status_code == 200
    assert upload_res.json()["is_valid"] is True
    assert upload_res.json()["row_count"] == 2

    predict_res = client.post(
        "/api/predict",
        headers=headers,
        files={"file": ("dataset.csv", io.BytesIO(arff_text.encode('utf-8')), "text/csv")}
    )
    assert predict_res.status_code == 200
    assert predict_res.json()["total_modules"] == 2

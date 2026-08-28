import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.models import User, Dataset, PredictionResult, RiskReport, AnalysisHistory

# Ensure all database tables exist on engine
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

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["models_ready"] is True

def test_register_and_login_flow():
    # 1. Register
    reg_payload = {
        "full_name": "Test Engineer",
        "email": "engineer@test.com",
        "password": "Password123!"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    assert reg_data["user"]["email"] == "engineer@test.com"

    # 2. Login
    login_payload = {
        "email": "engineer@test.com",
        "password": "Password123!"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 3. Access Protected Route /me
    token = login_data["access_token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "engineer@test.com"

def test_duplicate_registration():
    reg_payload = {
        "full_name": "Duplicate User",
        "email": "dup@test.com",
        "password": "Password123!"
    }
    res1 = client.post("/api/auth/register", json=reg_payload)
    assert res1.status_code == 200
    
    res2 = client.post("/api/auth/register", json=reg_payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_forgot_and_reset_password():
    # 1. Register user
    reg = client.post("/api/auth/register", json={
        "full_name": "Reset Tester",
        "email": "reset@test.com",
        "password": "OldPassword123!"
    })
    assert reg.status_code == 200
    
    # 2. Request forgot password
    forgot_res = client.post("/api/auth/forgot-password", json={"email": "reset@test.com"})
    assert forgot_res.status_code == 200
    
    # 3. Fetch reset token from DB
    db = SessionLocal()
    user = db.query(User).filter(User.email == "reset@test.com").first()
    assert user is not None
    assert user.reset_token is not None
    token = user.reset_token
    db.close()
    
    # 4. Reset password using token
    reset_res = client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": "NewPassword456!"
    })
    assert reset_res.status_code == 200
    
    # 5. Login with new password
    login_res = client.post("/api/auth/login", json={
        "email": "reset@test.com",
        "password": "NewPassword456!"
    })
    assert login_res.status_code == 200

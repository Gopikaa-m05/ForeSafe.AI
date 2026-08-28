import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_message_endpoint():
    payload = {
        "message": "What are the most critical hotspots?",
        "history": [],
        "context": {
            "dataset_name": "Test_Dataset.csv",
            "total_modules": 50,
            "risk_distribution": {
                "critical": 5,
                "high": 10,
                "medium": 15,
                "low": 20,
                "avg_risk_score": 0.45
            },
            "top_hotspots": [
                {"module_name": "auth_core.cpp", "final_risk_score": 0.88, "risk_level": "Critical", "primary_cause": "High McCabe cyclomatic v(g)=18"}
            ]
        }
    }
    response = client.post("/api/chat/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "auth_core.cpp" in data["response"] or "hotspot" in data["response"].lower()
    assert len(data.get("suggested_prompts", [])) > 0

def test_chat_decision_matrix_intent():
    payload = {
        "message": "What should I fix first according to the decision matrix?",
        "history": [],
        "context": {
            "dataset_name": "JM1_Codebase.csv",
            "total_modules": 120,
            "risk_distribution": {"critical": 12, "high": 18, "medium": 30, "low": 60, "avg_risk_score": 0.42}
        }
    }
    response = client.post("/api/chat/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Quick Wins" in data["response"] or "Decision" in data["response"]
    assert data["action_type"] == "view_decision_matrix"

def test_recommendations_action_plan_endpoint():
    payload = {
        "total_modules": 100,
        "risk_distribution": {
            "critical": 8,
            "high": 12,
            "medium": 30,
            "low": 50,
            "avg_risk_score": 0.38
        },
        "top_features": [],
        "predictions": []
    }
    response = client.post("/api/recommendations/action-plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "technical_debt" in data
    assert data["technical_debt"]["estimated_remediation_hours"] > 0
    assert "refactoring_tasks" in data
    assert len(data["refactoring_tasks"]) >= 3
    assert "ci_cd_quality_gate" in data
    assert "yaml_config" in data["ci_cd_quality_gate"]

def test_recommendations_decision_matrix_endpoint():
    payload = {
        "predictions": [
            {
                "module_name": "payment_gateway.py",
                "final_risk_score": 0.85,
                "risk_level": "Critical",
                "raw_metrics": {"v(g)": 18.0, "ev(g)": 5.0, "iv(g)": 8.0, "loc": 65.0, "e": 24000.0, "lOComment": 2.0}
            },
            {
                "module_name": "data_aggregator.py",
                "final_risk_score": 0.78,
                "risk_level": "High",
                "raw_metrics": {"v(g)": 22.0, "ev(g)": 8.0, "iv(g)": 10.0, "loc": 280.0, "e": 45000.0, "lOComment": 8.0}
            },
            {
                "module_name": "user_dto.py",
                "final_risk_score": 0.20,
                "risk_level": "Low",
                "raw_metrics": {"v(g)": 2.0, "ev(g)": 1.0, "iv(g)": 1.0, "loc": 35.0, "e": 1200.0, "lOComment": 0.0}
            }
        ],
        "total_modules": 3,
        "risk_distribution": {"critical": 1, "high": 1, "medium": 0, "low": 1}
    }
    response = client.post("/api/recommendations/decision-matrix", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "quadrants" in data
    assert "quick_wins" in data["quadrants"]
    assert "strategic_refactors" in data["quadrants"]
    assert len(data["quadrants"]["quick_wins"]) >= 1

def test_recommendations_evaluate_single_module():
    payload = {
        "module_name": "process_order",
        "vg": 16.0,
        "evg": 6.0,
        "ivg": 9.0,
        "loc": 140.0,
        "effort": 28000.0,
        "comments": 2.0
    }
    response = client.post("/api/recommendations/evaluate-module", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] in ["Critical", "High"]
    assert len(data["code_smells"]) > 0
    assert "recommended_pattern" in data
    assert "refactoring_diff" in data
    assert "synthesized_unit_test" in data

def test_recommendations_test_suite_generator():
    payload = {
        "predictions": [
            {
                "module_name": "telemetry_processor.cpp",
                "final_risk_score": 0.90,
                "risk_level": "Critical",
                "raw_metrics": {"v(g)": 15.0}
            }
        ],
        "total_modules": 1,
        "risk_distribution": {"critical": 1, "high": 0, "medium": 0, "low": 0}
    }
    response = client.post("/api/recommendations/test-suite", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "suite_code" in data
    assert "pytest" in data["suite_code"]
    assert "test_telemetry_processor_cpp_decision_branches" in data["suite_code"]

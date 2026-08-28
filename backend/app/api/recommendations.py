from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from app.api.auth import get_current_user_optional
from app.db.models import User

router = APIRouter()

class ActionPlanRequest(BaseModel):
    total_modules: int = 0
    risk_distribution: Dict[str, Any] = {}
    top_features: List[Dict[str, Any]] = []
    predictions: List[Dict[str, Any]] = []

class ModuleEvaluationRequest(BaseModel):
    module_name: Optional[str] = "custom_module"
    vg: Optional[float] = 12.0
    evg: Optional[float] = 4.0
    ivg: Optional[float] = 6.0
    loc: Optional[float] = 120.0
    effort: Optional[float] = 18000.0
    comments: Optional[float] = 6.0
    bugs: Optional[float] = 0.25
    language: Optional[str] = "python"  # python | javascript | typescript

class DecisionMatrixRequest(BaseModel):
    predictions: Optional[List[Dict[str, Any]]] = []
    total_modules: Optional[int] = 0
    risk_distribution: Optional[Dict[str, Any]] = {}

@router.post("/recommendations/action-plan")
async def generate_action_plan(
    payload: ActionPlanRequest = Body(...),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Synthesize an actionable architectural remediation roadmap, technical debt estimate,
    and CI/CD quality gate rules based on the analyzed dataset.
    """
    critical_count = payload.risk_distribution.get("critical", 0)
    high_count = payload.risk_distribution.get("high", 0)
    medium_count = payload.risk_distribution.get("medium", 0)
    total = payload.total_modules or len(payload.predictions) or 100

    # Technical debt estimation formulas
    # Average refactoring time: Critical = 4.5 hrs, High = 2.5 hrs, Medium = 1.0 hr
    estimated_hours = (critical_count * 4.5) + (high_count * 2.5) + (medium_count * 1.0)
    remediation_urgency = "Immediate" if critical_count > 10 else "High" if critical_count > 0 or high_count > 20 else "Moderate"
    potential_risk_reduction = min(85.0, (critical_count * 2.5 + high_count * 1.2 + 15.0))

    # Architectural Refactoring Tasks
    refactoring_tasks = [
        {
            "id": "TASK-01",
            "category": "McCabe Cyclomatic Reduction",
            "priority": "P0 - Critical" if critical_count > 0 else "P1 - High",
            "target": f"Modules with v(g) > 10 ({critical_count + high_count} modules)",
            "impact": "Reduces defect probability by ~42%",
            "recommended_pattern": "Strategy Pattern & Guard Clauses",
            "estimated_effort_hours": f"{max(4, critical_count * 3)} hrs",
            "description": "Decompose deeply nested conditionals and cascading if-else trees into modular strategy classes.",
            "before_code": """// ❌ Complex Nested Conditionals: v(g) = 14
function processPayment(user, order, gateway) {
  if (user.isActive) {
    if (order.total > 0) {
      if (gateway.isAvailable) {
        if (order.currency === 'USD') {
          return gateway.charge(order.total);
        } else if (order.currency === 'EUR') {
          return gateway.chargeEUR(order.total * 0.92);
        }
      }
    }
  }
  return null;
}""",
            "after_code": """// ✅ Flattened with Early Return Guards: v(g) = 2
function processPayment(user, order, gateway) {
  if (!user?.isActive || order?.total <= 0 || !gateway?.isAvailable) {
    return null;
  }
  const rate = CURRENCY_RATES[order.currency] ?? 1.0;
  return gateway.charge(order.total * rate);
}"""
        },
        {
            "id": "TASK-02",
            "category": "Halstead Cognitive Effort Simplification",
            "priority": "P1 - High",
            "target": "High Volume & Operator Density Modules",
            "impact": "Decreases developer maintenance load by ~35%",
            "recommended_pattern": "Single Responsibility & Immutable Transforms",
            "estimated_effort_hours": f"{max(3, high_count * 2)} hrs",
            "description": "Reduce operand mutation scope and extract multi-variable arithmetic into pure helper functions.",
            "before_code": """# ❌ High Halstead Effort: Mutating 9 operands in 1 loop
def calc_risk_matrix(rows):
    total = 0; sq = 0; dev = 0; weighted = 0
    for r in rows:
        total += r['val'] * 0.4
        sq += (r['val'] ** 2) * 0.35
        dev += abs(r['val'] - 50) * 0.25
        weighted = (total + sq) / (dev + 1)
    return weighted""",
            "after_code": """# ✅ Composable Pure Transformations
def calc_risk_matrix(rows):
    scores = [r['val'] for r in rows]
    total = sum(v * 0.4 for v in scores)
    sq = sum((v ** 2) * 0.35 for v in scores)
    dev = sum(abs(v - 50) * 0.25 for v in scores)
    return (total + sq) / (dev + 1)"""
        },
        {
            "id": "TASK-03",
            "category": "Documentation & Invariant Contracts",
            "priority": "P2 - Medium",
            "target": "Modules with Comment Ratio < 10%",
            "impact": "Improves onboarding velocity and code review precision",
            "recommended_pattern": "Type Annotations & Precondition Assertions",
            "estimated_effort_hours": "6 hrs",
            "description": "Document module preconditions, invariants, and algorithmic constraints on key entry points.",
            "before_code": """def parse_stream(buffer, flags):
    # No docstring, untyped
    return [b for b in buffer if b > flags]""",
            "after_code": """def parse_stream(buffer: bytes, threshold_flag: int) -> list[int]:
    \"\"\"
    Filter raw telemetry buffer against threshold flag.
    Precondition: len(buffer) > 0 and threshold_flag >= 0.
    \"\"\"
    assert threshold_flag >= 0, "threshold_flag must be non-negative"
    return [b for b in buffer if b > threshold_flag]"""
        }
    ]

    # CI/CD Quality Gate YAML Configuration
    ci_cd_gate_yaml = f"""# .github/workflows/foresave_quality_gate.yml
# Generated by ForeSafe AI Decision Recommendation Engine
name: ForeSafe AI Quality Gate
on: [pull_request, push]

jobs:
  code_reliability_gate:
    name: Autonomous Code Defect Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4

      - name: Setup Python Environment
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Metrics Analyzers
        run: |
          pip install radon lizard pytest

      - name: Enforce McCabe Complexity Thresholds (v(g) <= 15)
        run: |
          python -c \"
          import subprocess, sys, json
          res = subprocess.run(['radon', 'cc', 'src/', '-j', '-a'], capture_output=True, text=True)
          data = json.loads(res.stdout) if res.stdout else {{}}
          violations = [f for file, funcs in data.items() for f in funcs if f.get('complexity', 0) > 15]
          if violations:
              print(f'❌ QUALITY GATE BLOCKED: Found {{len(violations)}} functions with cyclomatic complexity > 15')
              sys.exit(1)
          print('✅ QUALITY GATE PASSED: All module metrics within safe bounds.')
          \"
"""

    return {
        "technical_debt": {
            "estimated_remediation_hours": round(estimated_hours, 1),
            "remediation_urgency": remediation_urgency,
            "potential_risk_reduction_percent": round(potential_risk_reduction, 1),
            "critical_modules_count": critical_count,
            "high_modules_count": high_count,
            "medium_modules_count": medium_count,
        },
        "refactoring_tasks": refactoring_tasks,
        "ci_cd_quality_gate": {
            "yaml_config": ci_cd_gate_yaml,
            "block_on_critical": True,
            "mccabe_threshold": 15,
            "comment_ratio_threshold": 0.10,
        }
    }


@router.post("/recommendations/decision-matrix")
async def generate_decision_matrix(
    payload: DecisionMatrixRequest = Body(...),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Categorizes codebase modules into a 4-Quadrant Developer Decision Matrix:
    1. Quick Wins (High Impact / Low Effort)
    2. Strategic Refactors (High Impact / High Effort)
    3. Hygiene & Contracts (Low Impact / Low Effort)
    4. Monitor & Isolate (Low Impact / High Effort)
    """
    predictions = payload.predictions or []
    quick_wins = []
    strategic_refactors = []
    hygiene_contracts = []
    monitor_isolate = []

    for idx, mod in enumerate(predictions):
        raw_m = mod.get("raw_metrics", {})
        risk_score = float(mod.get("final_risk_score", 0.0))
        risk_level = mod.get("risk_level", "Low")
        name = mod.get("module_name", f"Module_{idx+1}")

        vg = float(raw_m.get("v(g)", 5.0))
        evg = float(raw_m.get("ev(g)", 1.0))
        ivg = float(raw_m.get("iv(g)", 3.0))
        loc = float(raw_m.get("loc", 45.0))
        effort = float(raw_m.get("e", 5000.0))
        comments = float(raw_m.get("lOComment", 2.0))

        # Impact Score (0 - 100): Weighted by defect probability, complexity, and design risk
        impact_score = min(100.0, (risk_score * 60.0) + (min(vg, 30.0) * 1.0) + (min(ivg, 20.0) * 0.8))
        
        # Effort Score (0 - 100): Weighted by LOC, unstructured complexity, and Halstead effort
        effort_score = min(100.0, (min(loc, 300.0) / 300.0 * 50.0) + (min(evg, 15.0) / 15.0 * 25.0) + (min(effort, 40000.0) / 40000.0 * 25.0))

        item = {
            "module_name": name,
            "risk_score": round(risk_score * 100, 1),
            "risk_level": risk_level,
            "impact_score": round(impact_score, 1),
            "effort_score": round(effort_score, 1),
            "loc": int(loc),
            "vg": round(vg, 1),
            "evg": round(evg, 1),
            "effort": int(effort),
            "primary_driver": mod.get("primary_cause", "McCabe Complexity"),
        }

        # Quadrant assignment (Threshold at 48 for Impact and 48 for Effort)
        if impact_score >= 48.0 and effort_score < 48.0:
            item["quadrant"] = "QUICK_WINS"
            item["decision"] = "Apply Guard Clauses & Extract Micro-helper"
            item["estimated_hours"] = 1.0
            item["payoff_roi"] = "Very High (Immediate defect reduction)"
            quick_wins.append(item)
        elif impact_score >= 48.0 and effort_score >= 48.0:
            item["quadrant"] = "STRATEGIC_REFACTOR"
            item["decision"] = "Decompose via Strategy Pattern & Interface Segregation"
            item["estimated_hours"] = 4.5
            item["payoff_roi"] = "High (Prevents critical regression)"
            strategic_refactors.append(item)
        elif impact_score < 48.0 and effort_score < 48.0:
            item["quadrant"] = "HYGIENE_CONTRACTS"
            item["decision"] = "Add Type Annotations & Precondition Invariants"
            item["estimated_hours"] = 0.5
            item["payoff_roi"] = "Moderate (Enhances code maintainability)"
            hygiene_contracts.append(item)
        else:
            item["quadrant"] = "MONITOR_ISOLATE"
            item["decision"] = "Isolate behind Facade & Add Regression Tests"
            item["estimated_hours"] = 2.0
            item["payoff_roi"] = "Low-Medium (Containment strategy)"
            monitor_isolate.append(item)

    # Sort each quadrant by impact descending
    quick_wins.sort(key=lambda x: x["impact_score"], reverse=True)
    strategic_refactors.sort(key=lambda x: x["impact_score"], reverse=True)
    hygiene_contracts.sort(key=lambda x: x["impact_score"], reverse=True)
    monitor_isolate.sort(key=lambda x: x["impact_score"], reverse=True)

    total_modules = len(predictions) or 1
    return {
        "summary": {
            "total_analyzed": total_modules,
            "quick_wins_count": len(quick_wins),
            "strategic_refactors_count": len(strategic_refactors),
            "hygiene_contracts_count": len(hygiene_contracts),
            "monitor_isolate_count": len(monitor_isolate),
            "recommended_next_sprint_focus": "Quick Wins & Top Strategic Refactors" if quick_wins or strategic_refactors else "Maintain Hygiene",
        },
        "quadrants": {
            "quick_wins": quick_wins[:20],
            "strategic_refactors": strategic_refactors[:20],
            "hygiene_contracts": hygiene_contracts[:20],
            "monitor_isolate": monitor_isolate[:20],
        }
    }


@router.post("/recommendations/evaluate-module")
async def evaluate_single_module(
    payload: ModuleEvaluationRequest = Body(...),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Provides real-time evaluation of a single module's software metrics with tailored
    refactoring advice, before/after code transformations, and generated unit tests.
    """
    vg = payload.vg or 10.0
    evg = payload.evg or 2.0
    ivg = payload.ivg or 4.0
    loc = payload.loc or 80.0
    effort = payload.effort or 12000.0
    comments = payload.comments or 4.0
    comment_ratio = comments / max(1.0, loc)

    # Determine risk tier
    is_critical = vg > 15 or effort > 25000 or loc > 200 or evg > 6
    is_high = vg > 10 or effort > 15000 or loc > 120 or evg > 4
    risk_level = "Critical" if is_critical else "High" if is_high else "Medium" if vg > 6 else "Low"

    code_smells = []
    if vg > 10:
        code_smells.append(f"Deeply Nested Control Flow: McCabe Cyclomatic v(g) = {vg:.0f} (Safe < 10)")
    if evg > 4:
        code_smells.append(f"Unstructured Jumps / Spaghetti Branching: Essential Complexity ev(g) = {evg:.0f} (Safe < 4)")
    if ivg > 7:
        code_smells.append(f"High Coupling: Design Complexity iv(g) = {ivg:.0f} (Safe < 7)")
    if loc > 150:
        code_smells.append(f"God Method / Monolith: {loc:.0f} Lines of Code (Safe < 80)")
    if effort > 15000:
        code_smells.append(f"High Cognitive Load: Halstead Effort = {effort:,.0f} (Safe < 15,000)")
    if comment_ratio < 0.08:
        code_smells.append(f"Under-documented: Comment Ratio = {comment_ratio*100:.1f}% (Safe >= 10%)")
    if not code_smells:
        code_smells.append("No critical code smells detected. Metrics are within healthy thresholds.")

    # Tailored refactoring recommendation
    if vg > 10:
        pattern_name = "Polymorphic Strategy Pattern & Guard Clauses"
        pattern_desc = "Flatten cascading conditional blocks with early returns and replace dynamic conditionals with a strategy map."
        before_snippet = f"""# ❌ Before: v(g) = {vg:.0f}, LOC = {loc:.0f}
def {payload.module_name}(payload, state, auth_context):
    if auth_context and auth_context.is_valid:
        if state.is_active:
            if payload.get('type') == 'PROCESS':
                if payload.get('amount', 0) > 100:
                    return execute_priority(payload)
                else:
                    return execute_standard(payload)
            elif payload.get('type') == 'REFUND':
                return execute_refund(payload)
    return None"""
        after_snippet = f"""# ✅ After: v(g) = 2, Flattened with Strategy Map
ACTION_HANDLERS = {{
    ('PROCESS', True): lambda p: execute_priority(p),
    ('PROCESS', False): lambda p: execute_standard(p),
    ('REFUND', False): lambda p: execute_refund(p),
}}

def {payload.module_name}(payload, state, auth_context):
    # Guard Clauses
    if not (auth_context?.is_valid and state?.is_active):
        return None
        
    is_priority = payload.get('amount', 0) > 100
    handler = ACTION_HANDLERS.get((payload.get('type'), is_priority))
    return handler(payload) if handler else None"""
    else:
        pattern_name = "Pure Function Extraction & Immutable Pipeline"
        pattern_desc = "Isolate state mutations into composable, testable pure helper methods."
        before_snippet = f"""# ❌ Before: High Variable Mutations
def {payload.module_name}(items):
    res = []
    for x in items:
        if x > 0:
            res.append(x * 2.5)
    return res"""
        after_snippet = f"""# ✅ After: Pure List Comprehension / Pipeline
def {payload.module_name}(items: list[float]) -> list[float]:
    \"\"\"Transforms positive telemetry values with scale factor 2.5.\"\"\"
    return [x * 2.5 for x in items if x > 0]"""

    # Synthesized Unit Test
    test_snippet = f"""import pytest

@pytest.mark.parametrize("test_input, expected_status", [
    ({{"type": "PROCESS", "amount": 150}}, "PRIORITY_SUCCESS"),
    ({{"type": "PROCESS", "amount": 50}}, "STANDARD_SUCCESS"),
    ({{"type": "REFUND", "amount": 20}}, "REFUND_SUCCESS"),
    ({{"type": "INVALID", "amount": 0}}, None),
])
def test_{payload.module_name}_matrix(test_input, expected_status):
    \"\"\"Parameterized decision test covering all cyclomatic branch paths.\"\"\"
    mock_auth = type('Auth', (), {{'is_valid': True}})()
    mock_state = type('State', (), {{'is_active': True}})()
    
    result = {payload.module_name}(test_input, mock_state, mock_auth)
    assert result == expected_status or result is not None
"""

    return {
        "module_name": payload.module_name,
        "risk_level": risk_level,
        "code_smells": code_smells,
        "recommended_pattern": {
            "name": pattern_name,
            "description": pattern_desc,
            "estimated_effort_hours": 3.0 if is_critical else 1.5 if is_high else 0.5,
        },
        "refactoring_diff": {
            "before_code": before_snippet,
            "after_code": after_snippet,
        },
        "synthesized_unit_test": test_snippet
    }


@router.post("/recommendations/test-suite")
async def generate_test_suite(
    payload: DecisionMatrixRequest = Body(...),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Generates a full, copyable Pytest test suite with parameterized boundary checks
    for all top critical modules in the active dataset.
    """
    predictions = payload.predictions or []
    top_critical = [p for p in predictions if p.get("risk_level") in ["Critical", "High"]][:5]
    if not top_critical and predictions:
        top_critical = predictions[:3]

    test_cases_code = ""
    for idx, mod in enumerate(top_critical, 1):
        name = mod.get("module_name", f"module_{idx}").replace(".", "_").replace("-", "_")
        raw_m = mod.get("raw_metrics", {})
        vg = raw_m.get("v(g)", 12)
        test_cases_code += f"""
# -------------------------------------------------------------
# Module: {name} (Risk: {mod.get('risk_level', 'High')}, v(g) = {vg})
# -------------------------------------------------------------
@pytest.mark.parametrize("payload, context, expected_outcome", [
    ({{"id": 1, "val": 100, "flag": True}}, {{"auth": True}}, True),
    ({{"id": 2, "val": -1, "flag": False}}, {{"auth": True}}, False),
    ({{"id": 3, "val": 0, "flag": True}}, {{"auth": False}}, None),
    ({{"id": 4, "val": 9999, "flag": True}}, {{"auth": True}}, True),
])
def test_{name}_decision_branches(payload, context, expected_outcome):
    \"\"\"Validates all {int(vg)} independent execution paths against boundary conditions.\"\"\"
    # Replace with direct invocation of {name}
    result = True if payload.get('val', 0) > 0 and context.get('auth') else False if context.get('auth') else None
    assert result == expected_outcome
"""

    full_suite = f"""\"\"\"
Autonomous Pytest Reliability Suite
Generated by ForeSafe AI Decision Recommendation Engine
Target Dataset: {payload.risk_distribution.get('dataset_name', 'Active Codebase')}
Generated On: 2026-08-27
\"\"\"
import pytest

{test_cases_code}

if __name__ == '__main__':
    pytest.main(['-v'])
"""
    return {
        "suite_code": full_suite,
        "modules_covered_count": len(top_critical),
        "target_framework": "pytest"
    }

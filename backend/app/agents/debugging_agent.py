import pandas as pd
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent

class DebuggingAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="debugging_agent", display_name="6. Defect Debugging & Rectification Agent")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        df: pd.DataFrame = state.get("processed_df")
        risk_levels: List[str] = state.get("risk_levels", [])
        
        all_debug_plans: List[List[str]] = []
        
        for i in range(len(df)):
            row = df.iloc[i]
            plans = []
            risk = risk_levels[i] if i < len(risk_levels) else "Low"
            
            vg = float(row.get("v(g)", 0))
            branch = float(row.get("branchCount", 0))
            uniq_op = float(row.get("uniq_Op", 0))
            uniq_opnd = float(row.get("uniq_Opnd", 0))
            bugs = float(row.get("b", 0))
            
            if risk in ["Critical", "High"]:
                # Path explosion test requirement
                if branch > 15:
                    plans.append(f"Branch path explosion ({branch:.0f} branches): Write parameterized test matrices to verify all truth tables and edge branches.")
                else:
                    plans.append("Write isolated unit tests covering truth table logic and null pointer inputs.")
                    
                # Operator/operand imbalance
                if uniq_op > 25 or uniq_opnd > 40:
                    plans.append(f"High vocabulary footprint ({uniq_op:.0f} ops / {uniq_opnd:.0f} operands): Audit for duplicate variable mutations and extract shared state.")
                    
                # Defect risk
                if bugs > 0.2:
                    plans.append(f"Execute mutation testing (e.g., MutPy/Cosmic Ray) on this module to ensure test assertions catch subtle logical regressions.")
                    
                plans.append("Introduce static analysis linting rule: Fail CI build if McCabe complexity exceeds 10.")
            elif risk == "Medium":
                plans.append("Verify basic happy path and negative exception handling in test suite.")
                if branch > 10:
                    plans.append(f"Test all {branch:.0f} branching conditions with boundary value tests.")
            else:
                plans.append("Standard test suite passes. Ensure code coverage remains above 80%.")
                
            all_debug_plans.append(plans)
            
        state["debugging_remediations"] = all_debug_plans
        
        state["_step_summary"] = (
            f"Generated actionable debugging remediation and test verification plans across all {len(df)} modules."
        )
        state["_step_details"] = {
            "remediation_plans_generated": len(all_debug_plans),
            "testing_strategy": "Parameterized Branch Coverage + Mutation Testing + Static Analysis CI Gates"
        }
        
        return state

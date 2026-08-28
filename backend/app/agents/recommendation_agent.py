import pandas as pd
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent

class RecommendationAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="recommendation_agent", display_name="5. Developer Actionable Recommendation Agent")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        df: pd.DataFrame = state.get("processed_df")
        risk_levels: List[str] = state.get("risk_levels", [])
        final_risk_scores = state.get("final_risk_scores", [])
        
        all_recommendations: List[List[str]] = []
        global_priority_recs: List[str] = []
        
        high_vg_count = 0
        high_ev_count = 0
        high_effort_count = 0
        low_comment_count = 0
        
        for i in range(len(df)):
            row = df.iloc[i]
            recs = []
            risk = risk_levels[i] if i < len(risk_levels) else "Low"
            
            vg = float(row.get("v(g)", 0))
            evg = float(row.get("ev(g)", 0))
            ivg = float(row.get("iv(g)", 0))
            loc = float(row.get("loc", 0))
            effort = float(row.get("e", 0))
            comments = float(row.get("lOComment", 0))
            bugs = float(row.get("b", 0))
            
            if risk in ["Critical", "High"]:
                if vg > 10:
                    high_vg_count += 1
                    recs.append(f"Cyclomatic complexity ({vg:.0f}) exceeds safe threshold (10). Refactor nested conditionals into Strategy pattern or early return guards.")
                if evg > 4:
                    high_ev_count += 1
                    recs.append(f"Essential complexity ({evg:.0f}) is elevated. Remove unstructured jumps, multiple break/continue points, and tangled control flows.")
                if ivg > 7:
                    recs.append(f"Design complexity ({ivg:.0f}) is high. Decouple module dependencies using Dependency Injection or facade abstractions.")
                if loc > 150:
                    recs.append(f"Module size ({loc:.0f} LOC) is large. Apply Single Responsibility Principle to decompose into specialized helper methods.")
                if effort > 15000:
                    high_effort_count += 1
                    recs.append(f"Halstead comprehension effort ({effort:,.0f}) is extreme. Simplify arithmetic operands and reduce variable mutation scope.")
                if loc > 30 and (comments / max(1.0, loc)) < 0.08:
                    low_comment_count += 1
                    recs.append(f"Documentation density is critically low ({(comments/max(1.0, loc))*100:.1f}%). Document algorithm preconditions and invariants.")
                if bugs > 0.3:
                    recs.append(f"Estimated delivered defects ({bugs:.2f}) is high. Implement boundary value analysis and property-based test cases.")
                    
                if not recs:
                    recs.append("Elevated risk detected. Prioritize code review and add integration test suites.")
            elif risk == "Medium":
                if vg > 7:
                    recs.append(f"Moderate branch complexity ({vg:.0f}). Consider extracting nested conditionals into private helper functions.")
                if loc > 100:
                    recs.append(f"Module length ({loc:.0f} LOC) approaching limit. Monitor for feature creep.")
                if not recs:
                    recs.append("Maintain existing code structure. Add unit test coverage for edge cases.")
            else:
                recs.append("Module complexity metrics are within healthy thresholds. Maintain current coding practices.")
                
            all_recommendations.append(recs)
            
        # Global high-priority system-level recommendations
        if high_vg_count > 0:
            global_priority_recs.append(f"Refactor {high_vg_count} modules with cyclomatic complexity exceeding McCabe's threshold (v(g) > 10).")
        if high_ev_count > 0:
            global_priority_recs.append(f"Eliminate unstructured spaghetti code in {high_ev_count} modules with high essential complexity (ev(g) > 4).")
        if high_effort_count > 0:
            global_priority_recs.append(f"Simplify high Halstead effort in {high_effort_count} complex mathematical/data-processing modules.")
        if low_comment_count > 0:
            global_priority_recs.append(f"Enforce minimum 10% comment-to-code ratio in {low_comment_count} under-documented modules.")
        if not global_priority_recs:
            global_priority_recs.append("System health is excellent. Maintain CI/CD static analysis checks.")
            
        state["module_recommendations"] = all_recommendations
        state["high_priority_recommendations"] = global_priority_recs
        
        state["_step_summary"] = (
            f"Generated tailored developer recommendations across {len(df)} modules. "
            f"Formulated {len(global_priority_recs)} global architectural remediation rules."
        )
        state["_step_details"] = {
            "high_complexity_modules_flagged": high_vg_count,
            "high_effort_modules_flagged": high_effort_count,
            "global_recommendations_count": len(global_priority_recs)
        }
        
        return state

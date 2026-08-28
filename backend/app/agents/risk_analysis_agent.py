import numpy as np
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent

class RiskAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="risk_analysis_agent", display_name="4. Software Risk & Hotspot Analysis Agent")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        final_risk_scores: np.ndarray = state.get("final_risk_scores")
        if final_risk_scores is None:
            raise ValueError("Risk Analysis Agent requires final_risk_scores from Prediction Agent.")
            
        risk_levels: List[str] = []
        low_count = 0
        med_count = 0
        high_count = 0
        crit_count = 0
        
        for score in final_risk_scores:
            if score < 0.30:
                risk_levels.append("Low")
                low_count += 1
            elif score < 0.60:
                risk_levels.append("Medium")
                med_count += 1
            elif score < 0.85:
                risk_levels.append("High")
                high_count += 1
            else:
                risk_levels.append("Critical")
                crit_count += 1
                
        total = len(final_risk_scores)
        avg_score = float(np.mean(final_risk_scores)) if total > 0 else 0.0
        
        risk_distribution = {
            "low": low_count,
            "medium": med_count,
            "high": high_count,
            "critical": crit_count,
            "total": total,
            "avg_risk_score": round(avg_score, 4),
            "critical_hotspots_count": crit_count + high_count
        }
        
        state["risk_levels"] = risk_levels
        state["risk_distribution"] = risk_distribution
        
        state["_step_summary"] = (
            f"Risk Categorization Complete: {crit_count} Critical, {high_count} High, "
            f"{med_count} Medium, {low_count} Low risk modules. System Risk Index: {avg_score * 100:.1f}/100."
        )
        state["_step_details"] = risk_distribution
        
        return state

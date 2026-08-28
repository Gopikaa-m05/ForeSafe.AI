import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any

logger = logging.getLogger("software_failure.agents")

class BaseAgent(ABC):
    def __init__(self, name: str, display_name: str):
        self.name = name
        self.display_name = display_name

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Wrapper around run() that tracks execution time and errors."""
        start_time = time.time()
        logger.info(f"Starting agent: {self.display_name}")
        
        step_telemetry = {
            "agent_name": self.name,
            "display_name": self.display_name,
            "status": "running",
            "duration_ms": 0.0,
            "summary": f"Executing {self.display_name}...",
            "details": {}
        }
        
        try:
            output_state = self.run(state)
            duration_ms = (time.time() - start_time) * 1000.0
            
            step_telemetry["status"] = "completed"
            step_telemetry["duration_ms"] = round(duration_ms, 2)
            step_telemetry["summary"] = output_state.get("_step_summary", f"{self.display_name} finished successfully.")
            step_telemetry["details"] = output_state.get("_step_details", {})
            
            # Append telemetry to state history
            if "telemetry" not in output_state:
                output_state["telemetry"] = []
            output_state["telemetry"].append(step_telemetry)
            
            return output_state
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000.0
            logger.error(f"Agent {self.name} failed: {str(e)}", exc_info=True)
            step_telemetry["status"] = "failed"
            step_telemetry["duration_ms"] = round(duration_ms, 2)
            step_telemetry["summary"] = f"Error in {self.display_name}: {str(e)}"
            
            if "telemetry" not in state:
                state["telemetry"] = []
            state["telemetry"].append(step_telemetry)
            state["_error"] = str(e)
            raise

    @abstractmethod
    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agent business logic on the shared pipeline state dictionary."""
        pass

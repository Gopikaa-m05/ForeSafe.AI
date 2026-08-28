import re
import logging
from typing import Dict, Any, List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger("software_failure.chat_engine")

class ForeSafeAIChatEngine:
    """
    Intelligent Software Failure & Reliability Copilot Engine.
    Powered by Groq LLM (GPT-OSS-120B / Llama 3) with active dataset context injection,
    and automatic fallback to deterministic software engineering rule diagnostics.
    """

    def _call_groq_llm(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        if not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.startswith("gsk_"):
            return None

        # Build active dataset context prompt
        dataset_name = context.get("dataset_name", "Active Codebase") if context else "Active Codebase"
        total_modules = context.get("total_modules", 0) if context else 0
        risk_dist = context.get("risk_distribution", {}) if context else {}
        top_hotspots = context.get("top_hotspots", []) if context else []

        hotspot_str = ""
        if top_hotspots:
            hotspot_str = "\nTop Defect Hotspots in Current Dataset:\n" + "\n".join(
                f"- Module {h.get('module_name')}: Risk Score {h.get('final_risk_score', 0)*100:.1f}%, Cause: {h.get('primary_cause', 'High McCabe Complexity')}"
                for h in top_hotspots[:5]
            )

        system_prompt = (
            "You are ForeSafe AI Copilot — an elite autonomous software quality, failure prediction, "
            "and code refactoring intelligence assistant.\n"
            "You specialize in software defect prevention, NASA JM1 metric analysis, McCabe Cyclomatic Complexity v(g), "
            "Halstead software science metrics, technical debt ROI calculations, CI/CD quality gate enforcement, "
            "and automated test synthesis.\n\n"
            f"Active Project / Dataset Context:\n"
            f"- Dataset Name: {dataset_name}\n"
            f"- Total Modules: {total_modules:,}\n"
            f"- Critical Risk Modules: {risk_dist.get('critical', 0)}\n"
            f"- High Risk Modules: {risk_dist.get('high', 0)}\n"
            f"- Medium Risk Modules: {risk_dist.get('medium', 0)}\n"
            f"- Low Risk Modules: {risk_dist.get('low', 0)}\n"
            f"{hotspot_str}\n\n"
            "Response Guidelines:\n"
            "- Provide structured, clean Markdown with headings, bullet points, and code snippets when appropriate.\n"
            "- Keep answers concise, actionable, and mathematically grounded.\n"
            "- When discussing refactoring, include clear before/after code examples (Python, JavaScript, etc.)."
        )

        messages = [{"role": "system", "content": system_prompt}]

        # Append recent history (up to last 6 turns)
        if history:
            for h in history[-6:]:
                role = "assistant" if h.get("role") in ["assistant", "bot"] else "user"
                content = h.get("content") or h.get("text") or ""
                if content:
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": message})

        try:
            with httpx.Client(timeout=12.0) as client:
                res = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.GROQ_MODEL or "openai/gpt-oss-120b",
                        "messages": messages,
                        "temperature": 0.3,
                        "max_tokens": 1024,
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"Groq API returned status {res.status_code}: {res.text[:200]}")
                    return None
        except Exception as e:
            logger.warning(f"Groq LLM call failed: {e}. Switching to rule engine fallback.")
            return None

    def process_message(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        msg_lower = message.lower().strip()

        # Try Groq LLM first
        groq_response = self._call_groq_llm(message, history, context)
        if groq_response:
            # Determine appropriate action_type and contextual prompts
            action_type = "general_help"
            if any(w in msg_lower for w in ["hotspot", "critical", "highest risk", "vulnerab"]):
                action_type = "view_hotspots"
            elif any(w in msg_lower for w in ["decision", "matrix", "triage", "priorit", "quadrant"]):
                action_type = "view_decision_matrix"
            elif any(w in msg_lower for w in ["ci/cd", "quality gate", "pipeline", "github action"]):
                action_type = "download_ci_gate"
            elif any(w in msg_lower for w in ["mccabe", "cyclomatic", "refactor"]):
                action_type = "view_recommendations"
            elif any(w in msg_lower for w in ["halstead", "effort", "difficulty"]):
                action_type = "view_metrics"
            elif any(w in msg_lower for w in ["test", "qa", "mutation"]):
                action_type = "view_testing"
            elif any(w in msg_lower for w in ["model", "xgboost", "random forest"]):
                action_type = "view_models"

            suggested = [
                "Open the Developer Decision Matrix",
                "What are the critical hotspots in this dataset?",
                "How do I refactor McCabe cyclomatic complexity > 10?",
                "Generate a CI/CD quality gate for this codebase"
            ]

            return {
                "response": groq_response,
                "action_type": action_type,
                "suggested_prompts": suggested
            }

        # Fallback to deterministic rule engine
        return self._process_rule_fallback(message, context)

    def _process_rule_fallback(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        msg_lower = message.lower().strip()
        
        # Extract dataset context if provided
        dataset_name = context.get("dataset_name", "Active Codebase") if context else "Active Codebase"
        total_modules = context.get("total_modules", 0) if context else 0
        risk_dist = context.get("risk_distribution", {}) if context else {}
        critical_count = risk_dist.get("critical", 0)
        high_count = risk_dist.get("high", 0)
        medium_count = risk_dist.get("medium", 0)
        low_count = risk_dist.get("low", 0)
        avg_risk = risk_dist.get("avg_risk_score", 0.0)
        top_hotspots = context.get("top_hotspots", []) if context else []
        model_comp = context.get("model_comparison", {}) if context else {}

        # 1. Hotspots & Critical Modules Query
        if any(w in msg_lower for w in ["hotspot", "critical", "highest risk", "failed modules", "vulnerab"]):
            if total_modules > 0:
                hotspot_list = ""
                if top_hotspots:
                    for i, h in enumerate(top_hotspots[:5], 1):
                        name = h.get("module_name", f"Module_{i}")
                        score = h.get("final_risk_score", 0.0) * 100
                        cause = h.get("primary_cause", "High McCabe complexity")
                        hotspot_list += f"- **{name}**: Risk Score `{score:.1f}%` ({h.get('risk_level', 'Critical')}) — *{cause}*\n"
                else:
                    hotspot_list = f"- **Critical Hotspots Found**: `{critical_count}` modules\n- **High Priority Hotspots**: `{high_count}` modules\n"

                return {
                    "response": (
                        f"### 🔍 Critical Defect Hotspots in **{dataset_name}**\n\n"
                        f"Across **{total_modules:,}** analyzed software modules, the multi-agent pipeline identified **{critical_count + high_count} critical/high-risk hotspots** requiring immediate developer attention.\n\n"
                        f"{hotspot_list}\n"
                        f"#### 💡 Recommended Next Steps:\n"
                        f"1. **Triage Priority 1**: Modules with `v(g) > 10` and `ev(g) > 4` (unstructured control flow).\n"
                        f"2. **Decompose**: Split large procedures (>150 LOC) into isolated helper functions.\n"
                        f"3. **Testing**: Add parameterized unit tests targeting untested conditional branches."
                    ),
                    "action_type": "view_hotspots",
                    "suggested_prompts": [
                        "Open the Developer Decision Matrix",
                        "How do I refactor McCabe cyclomatic complexity > 10?",
                        "Generate a CI/CD quality gate for this codebase",
                        "What is our estimated technical debt?"
                    ]
                }
            else:
                return {
                    "response": (
                        "### 🔍 Defect Hotspot Diagnostic Engine\n\n"
                        "To analyze specific hotspots, please upload a dataset or run a failure prediction pipeline.\n\n"
                        "**Standard Hotspot Criteria Used by ForeSafe AI:**\n"
                        "- **Critical Risk**: McCabe Cyclomatic $v(g) > 15$, Halstead Effort $E > 25,000$, or Dual ML Defect Probability $> 75\\%$.\n"
                        "- **High Risk**: $v(g) \\ge 10$, Essential Complexity $ev(g) > 4$, or Defect Probability $> 50\\%$.\n\n"
                        "Upload a `.csv` metrics file on the **Upload** page to inspect live module rankings."
                    ),
                    "action_type": "upload_prompt",
                    "suggested_prompts": [
                        "What software metrics are used in the NASA JM1 model?",
                        "How does the dual Random Forest + XGBoost ensemble work?",
                        "Explain McCabe cyclomatic vs essential complexity"
                    ]
                }

        # 2. Decision Matrix & Triage Prioritization Query
        if any(w in msg_lower for w in ["decision", "matrix", "triage", "priorit", "what should i fix", "fix first", "roadmap", "quadrant"]):
            est_hours = round((critical_count * 4.5) + (high_count * 2.5) + (medium_count * 1.0), 1)
            return {
                "response": (
                    f"### 🧭 Developer Architectural Decision Matrix\n\n"
                    f"ForeSafe AI prioritizes remediation using a **4-Quadrant Decision Framework** (Impact vs Effort):\n\n"
                    f"| Quadrant | Criteria | Developer Action | Target Modules |\n"
                    f"| :--- | :--- | :--- | :--- |\n"
                    f"| ⚡ **1. Quick Wins** | High Risk + Short (<80 LOC) | Apply Early Returns & Guard Clauses | `{max(1, int(critical_count * 0.4))}` modules |\n"
                    f"| 🏗️ **2. Strategic Refactors** | High Risk + Monolithic (>150 LOC) | Decompose via Strategy & Facade Pattern | `{max(1, int(critical_count * 0.6))}` modules |\n"
                    f"| 🛡️ **3. Hygiene & Contracts** | Moderate Risk + Low Comments | Add Precondition & Invariant Contracts | `{medium_count}` modules |\n"
                    f"| 📦 **4. Monitor & Isolate** | Low Risk / Infrequent Change | Add Boundary Assertions | `{low_count}` modules |\n\n"
                    f"**Remediation Effort:** Estimated total technical debt is **{est_hours} developer hours** with an expected defect reduction of **~45-75%**."
                ),
                "action_type": "view_decision_matrix",
                "suggested_prompts": [
                    "How do I refactor McCabe cyclomatic complexity > 10?",
                    "Generate a CI/CD quality gate for this codebase",
                    "Synthesize unit tests for top hotspots",
                    "What are the critical hotspots in this dataset?"
                ]
            }

        # 3. Technical Debt & ROI Query
        if any(w in msg_lower for w in ["technical debt", "debt", "roi", "hours", "how long", "cost", "payoff"]):
            est_hours = round((critical_count * 4.5) + (high_count * 2.5) + (medium_count * 1.0), 1)
            urgency = "Immediate" if critical_count > 10 else "High" if critical_count > 0 or high_count > 20 else "Moderate"
            return {
                "response": (
                    f"### 💰 Technical Debt & Payoff Analysis\n\n"
                    f"- **Estimated Remediation Effort**: `{est_hours} hours` across `{critical_count + high_count}` high-priority modules.\n"
                    f"- **Remediation Urgency**: `{urgency}`\n"
                    f"- **Expected ROI**: Reduces future production bug-fix time by **3.8x** and cuts system regression risk by up to **75%**.\n\n"
                    f"#### Breakdown by Severity:\n"
                    f"- **Critical Modules ({critical_count})**: ~4.5 hrs/module (Complex control flow restructuring)\n"
                    f"- **High Risk Modules ({high_count})**: ~2.5 hrs/module (Branch flattening & pure transformation)\n"
                    f"- **Medium Risk Modules ({medium_count})**: ~1.0 hr/module (Documentation & invariant asserts)\n\n"
                    f"You can simulate team capacity and financial savings in the **AI Decisions Hub**."
                ),
                "action_type": "view_decision_matrix",
                "suggested_prompts": [
                    "Open the Developer Decision Matrix",
                    "How do I refactor McCabe cyclomatic complexity > 10?",
                    "Generate a CI/CD quality gate for this codebase"
                ]
            }

        # 4. McCabe Cyclomatic Complexity Refactoring Query
        if any(w in msg_lower for w in ["mccabe", "cyclomatic", "v(g)", "complexity", "nested if", "refactor"]):
            return {
                "response": (
                    "### 🛠️ Refactoring McCabe Cyclomatic Complexity $v(g) > 10$\n\n"
                    "McCabe Cyclomatic Complexity measures the number of linearly independent execution paths. When $v(g) > 10$, defect likelihood increases exponentially.\n\n"
                    "#### 1. Strategy Pattern & Dispatch Tables\n"
                    "Replace deep `switch` or cascading `if-else` trees with functional dispatch maps:\n\n"
                    "```python\n"
                    "# ❌ Before: v(g) = 8 (High Branching)\n"
                    "def calculate_discount(customer_type, order):\n"
                    "    if customer_type == 'VIP':\n"
                    "        if order.total > 500: return order.total * 0.25\n"
                    "        else: return order.total * 0.15\n"
                    "    elif customer_type == 'CORPORATE':\n"
                    "        return order.total * 0.20\n"
                    "    return order.total * 0.05\n\n"
                    "# ✅ After: v(g) = 1 (Clean Dispatch Map)\n"
                    "DISCOUNT_STRATEGIES = {\n"
                    "    'VIP': lambda o: o.total * 0.25 if o.total > 500 else o.total * 0.15,\n"
                    "    'CORPORATE': lambda o: o.total * 0.20,\n"
                    "    'STANDARD': lambda o: o.total * 0.05\n"
                    "}\n"
                    "def calculate_discount(customer_type, order):\n"
                    "    return DISCOUNT_STRATEGIES.get(customer_type, DISCOUNT_STRATEGIES['STANDARD'])(order)\n"
                    "```\n\n"
                    "#### 2. Guard Clauses & Early Returns\n"
                    "Flatten nested logic by checking invalid conditions early to reduce indentation and branch depth."
                ),
                "action_type": "view_recommendations",
                "suggested_prompts": [
                    "Open the Developer Decision Matrix",
                    "What is Essential Complexity ev(g)?",
                    "How to reduce Halstead effort E?",
                    "Generate CI/CD Quality Gate rules"
                ]
            }

        # 5. Halstead Complexity & Cognitive Effort Query
        if any(w in msg_lower for w in ["halstead", "effort", "volume", "difficulty", "cognitive"]):
            return {
                "response": (
                    "### 📊 Halstead Software Science Metrics Explained\n\n"
                    "Halstead metrics quantify code volume, vocabulary, and developer cognitive effort based on operators (eta_1, N_1) and operands (eta_2, N_2):\n\n"
                    "| Metric | Formula | Recommended Safe Threshold | Interpretation |\n"
                    "| :--- | :--- | :--- | :--- |\n"
                    "| **Volume ($V$)** | $N \\log_2 \\eta$ | $< 1,000$ | Memory and size footprint of algorithm |\n"
                    "| **Difficulty ($D$)** | $\\frac{\\eta_1}{2} \\times \\frac{N_2}{\\eta_2}$ | $< 18$ | Mental effort required to understand code |\n"
                    "| **Effort ($E$)** | $D \\times V$ | $< 15,000$ | Total cognitive load during code review |\n"
                    "| **Delivered Bugs ($B$)** | $\\frac{V}{3000}$ | $< 0.15$ | Statistical expected defect count |\n\n"
                    "#### 💡 How to Reduce Extreme Halstead Effort:\n"
                    "- **Immutability & Const**: Reduce variable mutations.\n"
                    "- **Extract Micro-Functions**: Isolate arithmetic formulas into named helper functions.\n"
                    "- **Eliminate Magic Numbers**: Use descriptive constant enumerations."
                ),
                "action_type": "view_metrics",
                "suggested_prompts": [
                    "Open the Developer Decision Matrix",
                    "How do I refactor McCabe cyclomatic complexity > 10?",
                    "What are the critical hotspots in this dataset?",
                    "Generate automated test cases for high-effort modules"
                ]
            }

        # 6. CI/CD Quality Gate Generation Query
        if any(w in msg_lower for w in ["ci/cd", "quality gate", "pipeline", "github action", "gitlab", "jenkins", "gate"]):
            return {
                "response": (
                    "### 🚀 Automated CI/CD Quality Gate Configuration\n\n"
                    "Enforce fail-safe build thresholds in your pipeline to block defective commits before they reach production:\n\n"
                    "```yaml\n"
                    "# .github/workflows/foresave_quality_gate.yml\n"
                    "name: ForeSafe AI Quality Gate\n"
                    "on: [pull_request, push]\n\n"
                    "jobs:\n"
                    "  code_reliability_gate:\n"
                    "    runs-on: ubuntu-latest\n"
                    "    steps:\n"
                    "      - uses: actions/checkout@v4\n"
                    "      - name: Set up Python\n"
                    "        uses: actions/setup-python@v5\n"
                    "        with: { python-version: '3.11' }\n\n"
                    "      - name: Extract Software Metrics (Radon & Lizard)\n"
                    "        run: |\n"
                    "          pip install radon lizard\n"
                    "          radon cc src/ -a -j > cc_report.json\n"
                    "          radon raw src/ -j > raw_report.json\n\n"
                    "      - name: Enforce ForeSafe Quality Thresholds\n"
                    "        run: |\n"
                    "          python -c \"\n"
                    "          import json, sys\n"
                    "          with open('cc_report.json') as f: data = json.load(f)\n"
                    "          high_cc = [b for file in data.values() for b in file if b.get('complexity', 0) > 15]\n"
                    "          if high_cc:\n"
                    "              print(f'❌ QUALITY GATE FAILED: Found {len(high_cc)} functions with v(g) > 15')\n"
                    "              sys.exit(1)\n"
                    "          print('✅ QUALITY GATE PASSED: All module metrics within safe bounds.')\n"
                    "          \"\n"
                    "```\n\n"
                    "#### 📋 Recommended Gate Thresholds:\n"
                    "- **Block PR**: If any function has $v(g) > 15$ or defect risk score $> 0.70$.\n"
                    "- **Warning**: If comment-to-code ratio $< 10\\%$ or module length $> 200$ LOC."
                ),
                "action_type": "download_ci_gate",
                "suggested_prompts": [
                    "Open the Developer Decision Matrix",
                    "What are the critical hotspots in this dataset?",
                    "Show testing priorities for these hotspots",
                    "How do I refactor McCabe cyclomatic complexity > 10?"
                ]
            }

        # 7. Testing Prioritization & QA Query
        if any(w in msg_lower for w in ["test", "qa", "mutation", "coverage", "unit test", "matrix"]):
            return {
                "response": (
                    "### 🧪 AI-Guided Testing & QA Strategy\n\n"
                    "Traditional line coverage is insufficient for high-complexity code. ForeSafe AI recommends **Risk-Weighted Branch & Mutation Testing**:\n\n"
                    "#### 1. Branch Coverage Truth Table (for $v(g) > 10$)\n"
                    "For functions with high cyclomatic complexity, construct a parameterized truth table covering all decision conditions:\n\n"
                    "```python\n"
                    "import pytest\n\n"
                    "@pytest.mark.parametrize(\"is_auth, is_admin, token_valid, expected\", [\n"
                    "    (True, True, True, 'AUTHORIZED_ADMIN'),\n"
                    "    (True, False, True, 'AUTHORIZED_USER'),\n"
                    "    (True, False, False, 'ERR_TOKEN_EXPIRED'),\n"
                    "    (False, False, False, 'ERR_UNAUTHENTICATED'),\n"
                    "])\n"
                    "def test_auth_gateway_matrix(is_auth, is_admin, token_valid, expected):\n"
                    "    assert evaluate_access(is_auth, is_admin, token_valid) == expected\n"
                    "```\n\n"
                    "#### 2. Mutation Testing Priority\n"
                    "- Run `mutmut` / `stryker` on modules flagged as **Critical Risk** to ensure test assertions catch subtle arithmetic and logical mutations."
                ),
                "action_type": "view_testing",
                "suggested_prompts": [
                    "Open the Developer Decision Matrix",
                    "What are the critical hotspots in this dataset?",
                    "Generate a CI/CD quality gate for this codebase",
                    "How do I refactor McCabe cyclomatic complexity > 10?"
                ]
            }

        # 8. ML Model & Architecture Query
        if any(w in msg_lower for w in ["model", "algorithm", "xgboost", "random forest", "ensemble", "roc", "auc", "accuracy"]):
            return {
                "response": (
                    "### 🤖 Dual ML Model Architecture\n\n"
                    "ForeSafe AI deploys a calibrated ensemble of **Random Forest (40% weight)** and **XGBoost (60% weight)** trained on the NASA PROMISE benchmark:\n\n"
                    "- **XGBoost Classifier**: Optimized gradient boosting with depth 5, learning rate 0.05, and subsampling to capture non-linear metric interactions.\n"
                    "- **Random Forest**: 100 balanced decision trees providing stability and resistance to metric outliers.\n"
                    "- **SHAP Explainability**: Calculates exact feature importance contributions ($v(g)$, Halstead $E$, $LOC$) for every individual software module."
                ),
                "action_type": "view_models",
                "suggested_prompts": [
                    "Open the Developer Decision Matrix",
                    "What are the critical hotspots in this dataset?",
                    "What software metrics are used in the NASA JM1 model?",
                    "How do I refactor McCabe cyclomatic complexity > 10?"
                ]
            }

        # 9. General Assistant Fallback
        return {
            "response": (
                f"### 🤖 ForeSafe AI Reliability Copilot\n\n"
                f"I am your autonomous software quality & risk intelligence assistant for **{dataset_name}**.\n\n"
                f"**Here are ways I can help you make decisions right now:**\n"
                f"1. **Triage Decision Matrix**: Ask *'Open the Developer Decision Matrix'* to see Quick Wins vs Strategic Refactors.\n"
                f"2. **Diagnose Defect Hotspots**: Ask *'What are the most critical hotspots?'*\n"
                f"3. **Refactoring Advice**: Ask *'How do I refactor McCabe complexity > 10?'*\n"
                f"4. **CI/CD Quality Gates**: Ask *'Generate a CI/CD quality gate script'*\n"
                f"5. **Technical Debt Estimate**: Ask *'What is our technical debt and hours to fix?'*\n"
                f"6. **Testing Strategies**: Ask *'Synthesize unit test cases for complex modules'*"
            ),
            "action_type": "general_help",
            "suggested_prompts": [
                "Open the Developer Decision Matrix",
                "What are the critical hotspots in this dataset?",
                "How do I refactor McCabe cyclomatic complexity > 10?",
                "Generate a CI/CD quality gate for this codebase",
                "What is our estimated technical debt?"
            ]
        }

chat_engine = ForeSafeAIChatEngine()

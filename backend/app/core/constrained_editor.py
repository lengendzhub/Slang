import json
import urllib.request
import urllib.error
import re
from typing import Optional, Dict, Any, Tuple
from app.models.schemas import CareerMode

class ConstrainedEditor:
    """
    LLM-powered bullet rewriter enforcing:
    1. Zero hallucinations: edits only framing of real verified facts from anchor.
    2. Mandatory evidence_id propagation.
    3. Strict JSON-schema output.
    4. Per-bullet character length budgets.
    
    Defaults to local Llama running on Ollama (http://localhost:11434).
    """

    def __init__(
        self,
        ollama_url: str = "http://localhost:11434",
        model_name: str = "llama3.2",
        timeout: int = 15
    ):
        self.ollama_url = ollama_url.rstrip("/")
        self.model_name = model_name
        self.timeout = timeout

    def get_available_model(self) -> str:
        """
        Detects if llama3.2 is available; if not, falls back to another installed model.
        """
        try:
            req = urllib.request.Request(f"{self.ollama_url}/api/tags")
            with urllib.request.urlopen(req, timeout=2) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                models = [m["name"].split(":")[0] for m in data.get("models", [])]
                full_names = [m["name"] for m in data.get("models", [])]
                
                if any("llama3.2" in m for m in full_names):
                    return "llama3.2"
                elif any("llama3" in m for m in full_names):
                    return "llama3"
                elif full_names:
                    return full_names[0]  # Use available installed model
        except Exception:
            pass
        return self.model_name

    def rewrite_bullet(
        self,
        original_text: str,
        evidence_id: str,
        target_role: str,
        target_requirements: list[str],
        max_length_budget: int,
        mode: CareerMode = CareerMode.SAME_CAREER
    ) -> Optional[Dict[str, Any]]:
        """
        Invokes Llama with structured JSON output mode to rephrase bullet.
        """
        active_model = self.get_available_model()

        system_prompt = (
            "You are TailorAI's Constrained LaTeX Resume Editor. "
            "You must rewrite an existing resume bullet to highlight relevance to the target job, "
            "WITHOUT inventing metrics, unearned titles, or skills not present in the original anchor. "
            "NON-NEGOTIABLE RULES:\n"
            "1. NEVER invent new numbers, percentages, or unearned technologies.\n"
            f"2. You MUST retain the exact evidence_id: \"{evidence_id}\".\n"
            f"3. Maximum length budget: {max_length_budget} characters. Do NOT exceed this length.\n"
            "4. Output MUST be valid JSON matching this schema:\n"
            "{\n"
            f'  "rewritten_text": "new bullet string under {max_length_budget} chars",\n'
            '  "reason": "short explanation of why this aligns with the job",\n'
            f'  "evidence_id": "{evidence_id}"\n'
            "}"
        )

        user_prompt = (
            f"Target Role: {target_role}\n"
            f"Career Mode: {mode.value}\n"
            f"Target Requirements: {', '.join(target_requirements[:3])}\n"
            f"Original Bullet Anchor ({evidence_id}): \"{original_text}\"\n"
            f"Character Budget: {max_length_budget} chars max.\n"
            "Respond in JSON format only."
        )

        payload = {
            "model": active_model,
            "system": system_prompt,
            "prompt": user_prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.2,  # Low temperature for factual consistency
                "num_predict": 128
            }
        }

        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                f"{self.ollama_url}/api/generate",
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                result = json.loads(response.read().decode("utf-8"))
                response_text = result.get("response", "")
                
                # Parse JSON output from Llama
                parsed_json = json.loads(response_text)
                
                # Validate schema
                rewritten = parsed_json.get("rewritten_text", "").strip()
                reason = parsed_json.get("reason", "Aligned via Llama").strip()
                ev_id = parsed_json.get("evidence_id", evidence_id).strip()

                if rewritten and ev_id == evidence_id:
                    # Enforce length budget
                    if len(rewritten) > max_length_budget:
                        rewritten = rewritten[:max_length_budget - 3] + "..."
                    
                    return {
                        "rewritten_text": rewritten,
                        "reason": f"[Llama AI] {reason}",
                        "evidence_id": ev_id,
                        "model": active_model
                    }
        except Exception as e:
            # Silently fallback to deterministic planner if Ollama call fails/times out
            pass

        return None

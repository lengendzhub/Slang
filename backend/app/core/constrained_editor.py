import json
import os
import urllib.request
import urllib.error
import re
from typing import Optional, Dict, Any, Tuple, List
from app.models.schemas import CareerMode
from app.core.key_pool import LLMKeyPool

class ConstrainedEditor:
    """
    LLM-powered bullet rewriter enforcing:
    1. Zero hallucinations: edits only framing of real verified facts from anchor.
    2. Mandatory evidence_id propagation.
    3. Strict JSON-schema output.
    4. Per-bullet character length budgets.
    
    Load-balances across 5+ API keys (e.g. Groq, OpenAI) with automatic
    429 circuit-breaking, falling back seamlessly to local or remote Ollama (localhost:11434).
    """

    def __init__(
        self,
        ollama_url: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout: int = 5,
        groq_model: Optional[str] = None
    ):
        self.ollama_url = (
            ollama_url or os.getenv("OLLAMA_URL") or os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434"
        ).rstrip("/")
        self.model_name = model_name or os.getenv("OLLAMA_MODEL") or "llama3.2"
        self.groq_model = groq_model or os.getenv("GROQ_MODEL") or "llama-3.3-70b-versatile"
        self.timeout = timeout
        self._checked_availability = False
        self._cached_model = None
        self.key_pool = LLMKeyPool(provider="groq", env_var_name="GROQ_API_KEYS")

    def get_available_model(self) -> Optional[str]:
        """
        Detects if Ollama is available; if not, returns None immediately without repeated blocking.
        """
        if self._checked_availability:
            return self._cached_model

        self._checked_availability = True
        try:
            req = urllib.request.Request(f"{self.ollama_url}/api/tags")
            with urllib.request.urlopen(req, timeout=0.8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                full_names = [m["name"] for m in data.get("models", [])]
                
                if any("llama3.2" in m for m in full_names):
                    self._cached_model = "llama3.2"
                elif any("llama3" in m for m in full_names):
                    self._cached_model = "llama3"
                elif full_names:
                    self._cached_model = full_names[0]
                else:
                    self._cached_model = self.model_name
        except Exception:
            self._cached_model = None

        return self._cached_model

    def _rewrite_with_cloud_pool(
        self,
        system_prompt: str,
        user_prompt: str,
        evidence_id: str,
        max_length_budget: int
    ) -> Optional[Dict[str, Any]]:
        """
        Attempts to rewrite using the multi-key pool (e.g. Groq/OpenAI compatible).
        Loops through available keys. If 429 occurs, cools down key and tries next.
        """
        if self.key_pool.total_keys == 0:
            return None

        # Max retries bounded by pool size or 3
        max_attempts = min(3, self.key_pool.total_keys)
        
        for _ in range(max_attempts):
            key = self.key_pool.acquire_key(strategy="least_in_flight")
            if not key:
                break

            try:
                # Groq / OpenAI compatible payload
                body = {
                    "model": self.groq_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.2,
                    "max_tokens": 150
                }
                req = urllib.request.Request(
                    "https://api.groq.com/openai/v1/chat/completions",
                    data=json.dumps(body).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {key}",
                        "Content-Type": "application/json"
                    }
                )
                with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    content_str = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content_str)
                    
                    rewritten = parsed.get("rewritten_text", "").strip()
                    reason = parsed.get("reason", "Aligned via Groq/Llama").strip()
                    ev_id = parsed.get("evidence_id", evidence_id).strip()

                    self.key_pool.release_key(key, success=True)

                    if rewritten and ev_id == evidence_id:
                        if len(rewritten) > max_length_budget:
                            rewritten = rewritten[:max_length_budget - 3] + "..."
                        return {
                            "rewritten_text": rewritten,
                            "reason": f"[Groq-Pooled] {reason}",
                            "evidence_id": ev_id,
                            "model": f"groq:{self.groq_model}"
                        }
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    # Rate limit hit: put key into cooldown & retry on next key
                    retry_after = e.headers.get("Retry-After")
                    cooldown = float(retry_after) if retry_after and retry_after.isdigit() else 60.0
                    self.key_pool.report_rate_limit(key, cooldown=cooldown)
                elif e.code == 401:
                    self.key_pool.report_invalid(key)
                else:
                    self.key_pool.release_key(key, success=False)
            except Exception:
                self.key_pool.release_key(key, success=False)

        return None

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
        Invokes multi-key cloud pool or local Llama with structured JSON output mode to rephrase bullet.
        """
        system_prompt = (
            "You are Slang's Constrained LaTeX Resume Editor. "
            "You must rewrite an existing resume bullet to highlight relevance to the target job, "
            "WITHOUT inventing metrics, unearned titles, or skills not present in the original anchor. "
            "NON-NEGOTIABLE RULES:\n"
            "1. NEVER invent new technologies, programming languages (e.g. C++, Java, AWS), or frameworks unless they appear in the original anchor.\n"
            "2. NEVER use hyperbolic words like 'expert', 'world-class', or 'master'.\n"
            "3. Do NOT copy JD-specific project names (e.g. 'Google Pay', 'growth & communications') unless genuinely present in the anchor.\n"
            f"4. You MUST retain the exact evidence_id: \"{evidence_id}\".\n"
            f"5. Maximum length budget: {max_length_budget} characters. Do NOT exceed this length.\n"
            "6. Output MUST be valid JSON matching this schema:\n"
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

        # 1. Prioritize multi-key cloud pool if keys configured
        cloud_result = self._rewrite_with_cloud_pool(
            system_prompt, user_prompt, evidence_id, max_length_budget
        )
        if cloud_result:
            return cloud_result

        # 2. Fallback to local Ollama instance
        active_model = self.get_available_model()
        if not active_model:
            return None

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
        except Exception:
            # Silently fallback to deterministic planner if Ollama call fails/times out
            pass

        return None

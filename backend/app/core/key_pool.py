import time
import os
import threading
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field

@dataclass
class KeyState:
    key: str
    is_active: bool = True
    cooldown_until: float = 0.0
    total_requests: int = 0
    total_failures: int = 0
    consecutive_429s: int = 0
    in_flight: int = 0

    @property
    def is_available(self) -> bool:
        if not self.is_active:
            return False
        return time.time() >= self.cooldown_until

    def remaining_cooldown(self) -> float:
        return max(0.0, self.cooldown_until - time.time())


class LLMKeyPool:
    """
    Thread-safe Load Balancer for 5+ LLM API keys (Groq, OpenAI, Gemini, etc.).
    
    Features:
    1. Weighted Round-Robin key rotation.
    2. Circuit Breaker / Cooldown: marks rate-limited keys (429) for a cooldown period (e.g., 60s).
    3. Automatic Failover: retries request across remaining healthy keys.
    4. Least-in-flight concurrency balancing.
    5. Permanent removal of revoked/invalid keys (401).
    """

    def __init__(
        self,
        provider: str = "groq",
        env_var_name: str = "GROQ_API_KEYS",
        default_cooldown: float = 60.0
    ):
        self.provider = provider
        self.default_cooldown = default_cooldown
        self._lock = threading.Lock()
        self._keys: List[KeyState] = []
        self._cursor = 0

        # Load keys from environment variable (comma or newline separated)
        raw_keys = os.getenv(env_var_name, "")
        if raw_keys:
            keys = [k.strip() for k in raw_keys.replace("\n", ",").split(",") if k.strip()]
            self.load_keys(keys)

    def load_keys(self, keys: List[str]) -> None:
        """Loads or replaces the key pool with a list of API keys."""
        with self._lock:
            # Avoid duplicate keys
            existing_keys = {k.key for k in self._keys}
            for k in keys:
                if k not in existing_keys:
                    self._keys.append(KeyState(key=k))

    @property
    def total_keys(self) -> int:
        return len(self._keys)

    @property
    def active_keys_count(self) -> int:
        with self._lock:
            return sum(1 for k in self._keys if k.is_available)

    def acquire_key(self, strategy: str = "round_robin") -> Optional[str]:
        """
        Acquires the next available healthy key from the pool.
        Strategies:
          - 'round_robin': cycles sequentially through healthy keys.
          - 'least_in_flight': picks healthy key with lowest current requests.
        """
        with self._lock:
            if not self._keys:
                return None

            available = [k for k in self._keys if k.is_available]
            if not available:
                # All keys in cooldown; find the one that will recover earliest
                earliest = min(self._keys, key=lambda k: k.cooldown_until if k.is_active else float("inf"))
                if earliest.is_active and earliest.remaining_cooldown() < 1.0:
                    # If it's less than a second away, wait and return it
                    time.sleep(earliest.remaining_cooldown())
                    earliest.in_flight += 1
                    earliest.total_requests += 1
                    return earliest.key
                return None

            if strategy == "least_in_flight":
                chosen = min(available, key=lambda k: k.in_flight)
            else:  # round_robin
                # Pick next available key starting from cursor
                n = len(self._keys)
                chosen = None
                for i in range(n):
                    idx = (self._cursor + i) % n
                    candidate = self._keys[idx]
                    if candidate.is_available:
                        chosen = candidate
                        self._cursor = (idx + 1) % n
                        break
                if not chosen:
                    chosen = available[0]

            chosen.in_flight += 1
            chosen.total_requests += 1
            return chosen.key

    def release_key(self, key: str, success: bool = True) -> None:
        """Releases an in-flight hold on a key after request completion."""
        with self._lock:
            for k in self._keys:
                if k.key == key:
                    k.in_flight = max(0, k.in_flight - 1)
                    if success:
                        k.consecutive_429s = 0
                    break

    def report_rate_limit(self, key: str, cooldown: Optional[float] = None) -> None:
        """
        Triggered on HTTP 429 Too Many Requests.
        Puts key into cooldown with exponential backoff on repeated 429s.
        """
        with self._lock:
            for k in self._keys:
                if k.key == key:
                    k.in_flight = max(0, k.in_flight - 1)
                    k.total_failures += 1
                    k.consecutive_429s += 1
                    
                    # Exponential cooldown: 60s, 120s, 240s...
                    cd = cooldown or (self.default_cooldown * (1.5 ** min(k.consecutive_429s - 1, 4)))
                    k.cooldown_until = time.time() + cd
                    break

    def report_invalid(self, key: str) -> None:
        """Triggered on HTTP 401 Unauthorized (expired or invalid key)."""
        with self._lock:
            for k in self._keys:
                if k.key == key:
                    k.is_active = False
                    k.in_flight = max(0, k.in_flight - 1)
                    break

    def get_stats(self) -> Dict[str, Any]:
        """Telemetry diagnostics for the admin or monitoring dashboard."""
        with self._lock:
            return {
                "provider": self.provider,
                "total_keys": len(self._keys),
                "healthy_keys": sum(1 for k in self._keys if k.is_available),
                "cooling_down": sum(1 for k in self._keys if k.is_active and not k.is_available),
                "revoked_keys": sum(1 for k in self._keys if not k.is_active),
                "keys_detail": [
                    {
                        "key_mask": f"{k.key[:6]}...{k.key[-4:]}" if len(k.key) > 10 else "***",
                        "status": "active" if k.is_available else ("cooling_down" if k.is_active else "revoked"),
                        "cooldown_seconds": round(k.remaining_cooldown(), 1),
                        "total_requests": k.total_requests,
                        "failures": k.total_failures,
                        "in_flight": k.in_flight
                    }
                    for k in self._keys
                ]
            }

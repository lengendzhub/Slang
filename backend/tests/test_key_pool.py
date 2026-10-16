import time
from app.core.key_pool import LLMKeyPool

def test_key_pool_round_robin():
    pool = LLMKeyPool()
    pool.load_keys(["key_a", "key_b", "key_c"])
    
    # Sequential acquisitions should cycle through keys
    assert pool.acquire_key(strategy="round_robin") == "key_a"
    assert pool.acquire_key(strategy="round_robin") == "key_b"
    assert pool.acquire_key(strategy="round_robin") == "key_c"
    assert pool.acquire_key(strategy="round_robin") == "key_a"

def test_key_pool_cooldown_on_rate_limit():
    pool = LLMKeyPool()
    pool.load_keys(["key_1", "key_2"])

    # Key 1 hits rate limit
    pool.report_rate_limit("key_1", cooldown=5.0)

    # Next key should automatically be key_2
    assert pool.acquire_key() == "key_2"
    # Even if called again, key_1 is skipped while cooling down
    assert pool.acquire_key() == "key_2"

    stats = pool.get_stats()
    assert stats["cooling_down"] == 1
    assert stats["healthy_keys"] == 1

def test_key_pool_least_in_flight():
    pool = LLMKeyPool()
    pool.load_keys(["k1", "k2", "k3"])

    # Pick k1 and don't release yet (in_flight = 1)
    k1 = pool.acquire_key(strategy="least_in_flight")
    assert k1 == "k1"

    # Next pick should be k2 or k3 (in_flight = 0)
    k2 = pool.acquire_key(strategy="least_in_flight")
    assert k2 in ["k2", "k3"]

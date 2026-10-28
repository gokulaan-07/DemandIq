"""
DemandIQ Python Keyed HMAC Privacy Lab Module
"""
import hmac
import hashlib
import os
import re

HMAC_SECRET = os.getenv("HMAC_SECRET_SALT", "demandiq_privacy_hmac_secret_salt_2026_isolated_key").encode()

def normalize_identifier(raw_input: str) -> str:
    digits = re.sub(r"\D", "", raw_input)
    if len(digits) >= 10:
        return digits[-10:]
    return re.sub(r"[^a-z0-9]", "", raw_input.lower().strip())

def generate_keyed_hmac(normalized_input: str) -> str:
    return hmac.new(HMAC_SECRET, normalized_input.encode(), hashlib.sha256).hexdigest()

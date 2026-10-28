"""
DemandIQ Python Lost Demand NLP Extractor
"""
import re
from typing import Dict, Any, List

def parse_customer_enquiry(text: str, inventory: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    lower = f" {text.lower()} "
    
    # Regional code-mixed detection
    has_tamil = bool(re.search(r"(irukka|kedaikkuma|venum|pudichirukku|irundha|sollunga|ethana)", text, re.I))
    has_hindi = bool(re.search(r"(chahiye|milega|hai kya|bhaiya|kitne ka|batao|lena hai)", text, re.I))
    
    lang = "English"
    if has_tamil and has_hindi:
        lang = "Mixed Regional"
    elif has_tamil:
        lang = "Tamil-English (Tanglish)"
    elif has_hindi:
        lang = "Hindi-English (Hinglish)"

    # Product matching
    product = None
    if any(k in lower for k in ["kurti", "kurtis", "cotton kurti"]):
        product = "Chanderi Cotton Kurti"
    elif any(k in lower for k in ["saree", "sari", "silk saree", "banarasi"]):
        product = "Banarasi Soft Silk Saree"
    elif any(k in lower for k in ["shirt", "linen shirt"]):
        product = "Pure Linen Mandarin Shirt"
    elif any(k in lower for k in ["lehenga", "choli"]):
        product = "Handcrafted Heritage Lehenga"

    # Color matching
    color = None
    if any(k in lower for k in ["blue", "royal blue", "navy"]):
        color = "Royal Blue"
    elif any(k in lower for k in ["olive", "olive green"]):
        color = "Olive Green"
    elif any(k in lower for k in ["red", "crimson", "maroon"]):
        color = "Crimson Red"

    # Size matching
    size = None
    if re.search(r"\b(40|m|medium)\b", lower):
        size = "M"
    elif re.search(r"\b(42|l|large)\b", lower):
        size = "L"
    elif re.search(r"\b(s|small|38)\b", lower):
        size = "S"

    return {
        "raw_text": text,
        "language_detected": lang,
        "product": product,
        "color": color,
        "size": size,
        "intent": "availability" if any(w in lower for w in ["available", "irukka", "milega", "chahiye"]) else "general"
    }

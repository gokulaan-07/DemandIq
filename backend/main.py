"""
DemandIQ — FastAPI Microservice & API Documentation Hub (ExaThon India 2026)
Provides Swagger UI at /docs and OpenAPI schemas.
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from schemas import (
    OrderCreate, 
    RiskAnalysisResponse, 
    EnquiryCreate, 
    ChannelConfigUpdate, 
    PrivacySignalCreate, 
    PrivacyQueryRequest
)
from financials import calculate_channel_profit
from ml_risk import compute_order_risk
from nlp_enquiry import parse_customer_enquiry
from privacy_hmac import normalize_identifier, generate_keyed_hmac

app = FastAPI(
    title="DemandIQ Intelligence Engine API",
    description="Intelligent Demand & Profit Analytics Platform for Indian D2C and Social Commerce Sellers. CLEAN → COMPLETE → CONVERT.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "platform": "DemandIQ",
        "tagline": "Clean → Complete → Convert",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.post("/api/v1/orders/score-risk", response_model=RiskAnalysisResponse)
def score_order(order: OrderCreate):
    """
    Module A: DemandTruth. Scores incoming order for COD refusal & RTO risk.
    Returns explainable SHAP-like factor attributions.
    """
    res = compute_order_risk(order.model_dump())
    return res

@app.post("/api/v1/enquiries/parse-lost-demand")
def parse_enquiry(enquiry: EnquiryCreate):
    """
    Module B: Lost Demand Radar. Multi-lingual NLP parsing for Indian social buyer enquiries.
    Extracts intent, product variant, color, and size.
    """
    res = parse_customer_enquiry(enquiry.raw_text)
    return res

@app.post("/api/v1/channels/calculate-profit")
def calculate_profit(config: ChannelConfigUpdate):
    """
    Module C: Channel Profit Optimizer. Full logistics, commission, and ad-spend ledger accounting.
    """
    res = calculate_channel_profit(config.model_dump(exclude_unset=True))
    return res

@app.post("/api/v1/privacy/keyed-hmac-query")
def privacy_query(req: PrivacyQueryRequest):
    """
    Module E: Privacy Lab. Queries network risk registry using keyed HMAC-SHA256 without exposing raw PII.
    """
    norm = normalize_identifier(req.query_input)
    digest = generate_keyed_hmac(norm)
    return {
        "input_masked": req.query_input[:6] + "***",
        "hmac_digest": f"{digest[:12]}...{digest[-8:]}",
        "status": "Isolated Evaluation Completed"
    }

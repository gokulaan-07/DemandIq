from pydantic import BaseModel, Field
from typing import Optional, List

class OrderCreate(BaseModel):
    customer_ref: str
    order_value: float = Field(gt=0, description="Order value in INR")
    channel: str = Field(default="Instagram")
    payment_method: str = Field(default="COD")
    customer_phone: Optional[str] = None
    customer_city: Optional[str] = "Bengaluru"
    customer_pincode: Optional[str] = "560001"
    items_count: int = Field(default=1, ge=1)
    prev_order_count: int = Field(default=0, ge=0)
    prev_cancellation_count: int = Field(default=0, ge=0)
    prev_rto_count: int = Field(default=0, ge=0)
    address_score: float = Field(default=75.0, ge=0.0, le=100.0)

class RiskFactorSchema(BaseModel):
    factor: str
    impact: float
    description: str
    type: str

class RiskAnalysisResponse(BaseModel):
    risk_score: int
    risk_category: str
    risk_factors: List[RiskFactorSchema]
    model_confidence: int
    is_flagged: bool
    duplicate_candidate: bool
    duplicate_reason: Optional[str] = None
    missing_data_warning: Optional[str] = None

class EnquiryCreate(BaseModel):
    raw_text: str
    customer_handle: Optional[str] = "@shopper"
    channel: str = Field(default="Instagram")

class ChannelConfigUpdate(BaseModel):
    channel: str
    selling_price_avg: Optional[float] = None
    product_cost_avg: Optional[float] = None
    commission_percent: Optional[float] = None
    payment_fee_percent: Optional[float] = None
    forward_shipping: Optional[float] = None
    reverse_shipping: Optional[float] = None
    return_rate_percent: Optional[float] = None
    ad_spend: Optional[float] = None
    order_count: Optional[int] = None

class PrivacySignalCreate(BaseModel):
    identifier: str
    reason_code: str
    notes: Optional[str] = ""

class PrivacyQueryRequest(BaseModel):
    query_input: str

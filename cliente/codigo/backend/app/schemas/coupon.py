from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class CouponBase(BaseModel):
    code: str = Field(..., max_length=50)
    discount_type: str = Field(..., description="percentage or fixed")
    value: float = Field(..., gt=0)
    min_purchase_amount: float = Field(0.0, ge=0)
    is_active: bool = True
    expiration_date: Optional[datetime] = None

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class CouponValidate(BaseModel):
    code: str
    total_amount: float

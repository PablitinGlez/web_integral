from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class CouponBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    discount_type: str
    value: Decimal
    min_amount: Decimal = Decimal("0")
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    usage_limit: int = 0


class CouponCreate(CouponBase):
    pass


class CouponResponse(CouponBase):
    id: UUID
    used_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

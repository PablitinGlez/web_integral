from sqlalchemy import Column, String, Numeric, Boolean, DateTime, Uuid
import uuid
from datetime import datetime
from .base import Base

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), nullable=False, unique=True, index=True)
    discount_type = Column(String(20), nullable=False)  # 'percentage' o 'fixed'
    value = Column(Numeric(10, 2), nullable=False)
    min_purchase_amount = Column(Numeric(10, 2), default=0.0)
    is_active = Column(Boolean, default=True)
    expiration_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

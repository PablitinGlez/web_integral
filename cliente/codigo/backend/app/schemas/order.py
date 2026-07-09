from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from .product import Product
from .user import User

class OrderItemBase(BaseModel):
    product_id: UUID
    size: float
    quantity: int
    unit_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: UUID
    order_id: UUID
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    status: str = "pendiente"
    total_amount: float
    shipping_address: Optional[str] = None
    paypal_order_id: Optional[str] = None

class OrderCreate(BaseModel):
    shipping_address: Optional[str] = None
    paypal_order_id: Optional[str] = None
    items: List[OrderItemCreate]

class OrderResponse(OrderBase):
    id: UUID
    user_id: Optional[UUID] = None
    user: Optional[User] = None
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class ProductImageBase(BaseModel):
    image_url: str
    display_order: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImage(ProductImageBase):
    id: UUID
    product_id: UUID

    class Config:
        from_attributes = True

class InventoryBase(BaseModel):
    size: Decimal
    stock_quantity: int

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    id: UUID
    product_id: UUID

    class Config:
        from_attributes = True

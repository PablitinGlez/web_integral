from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from .category import Category
from .product_variants import ProductImage, Inventory

class ProductBase(BaseModel):
    name: str
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Decimal
    base_price: Optional[Decimal] = None
    category_id: Optional[UUID] = None
    main_image_url: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    images: List[ProductImage] = []
    inventory: List[Inventory] = []

    class Config:
        from_attributes = True

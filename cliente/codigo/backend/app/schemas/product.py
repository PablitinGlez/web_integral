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
    price: float
    base_price: Optional[float] = None
    category_id: Optional[UUID] = None
    main_image_url: Optional[str] = None
    gender: Optional[str] = None
    colors: Optional[str] = None
    sku: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand_id: Optional[UUID] = None
    description: Optional[str] = None
    price: Optional[float] = None
    base_price: Optional[float] = None
    category_id: Optional[UUID] = None
    main_image_url: Optional[str] = None
    gender: Optional[str] = None
    colors: Optional[str] = None
    sku: Optional[str] = None
    is_active: Optional[bool] = None


class Product(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    images: List[ProductImage] = []
    inventory: List[Inventory] = []
    category: Optional[Category] = None

    class Config:
        from_attributes = True
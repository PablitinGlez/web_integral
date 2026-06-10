from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

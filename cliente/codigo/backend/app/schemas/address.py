from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class AddressBase(BaseModel):
    label: str = Field(..., min_length=1, max_length=50)
    street: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1, max_length=100)
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = "México"
    phone: Optional[str] = None


class AddressCreate(AddressBase):
    is_default: Optional[bool] = False


class AddressUpdate(AddressBase):
    pass


class Address(AddressBase):
    id: UUID
    user_id: UUID
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
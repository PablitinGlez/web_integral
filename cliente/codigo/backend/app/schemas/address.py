from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class AddressBase(BaseModel):
    label: str = Field(..., min_length=1, max_length=50, examples=[""])
    street: str = Field(..., min_length=1, examples=[""])
    city: str = Field(..., min_length=1, max_length=100, examples=[""])
    state: Optional[str] = Field(None, examples=[""])
    zip_code: Optional[str] = Field(None, examples=[""])
    country: Optional[str] = Field("México", examples=["México"])
    phone: Optional[str] = Field(None, examples=[""])


class AddressCreate(AddressBase):
    is_default: Optional[bool] = False


class AddressUpdate(AddressBase):
    pass


class AddressPatch(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=50, examples=[""])
    street: Optional[str] = Field(None, min_length=1, examples=[""])
    city: Optional[str] = Field(None, min_length=1, max_length=100, examples=[""])
    state: Optional[str] = Field(None, examples=[""])
    zip_code: Optional[str] = Field(None, examples=[""])
    country: Optional[str] = Field(None, examples=[""])
    phone: Optional[str] = Field(None, examples=[""])


class Address(AddressBase):
    id: UUID
    user_id: UUID
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
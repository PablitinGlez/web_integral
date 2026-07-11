from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    role: str = "user"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """Usado por PUT /auth/me: reemplaza los datos editables del perfil por completo."""
    full_name: str = Field(..., min_length=1, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=120)
    phone: Optional[str] = None


class UserProfilePatch(BaseModel):
    """Usado por PATCH /auth/me: solo actualiza los campos que vienen incluidos."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=120)
    phone: Optional[str] = None
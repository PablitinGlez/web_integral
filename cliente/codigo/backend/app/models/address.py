from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Uuid
import uuid
from datetime import datetime
from .base import Base


class Address(Base):
    __tablename__ = "addresses"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(50), nullable=False, default="Casa")
    street = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100))
    zip_code = Column(String(20))
    country = Column(String(100), default="México")
    phone = Column(String(30))
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
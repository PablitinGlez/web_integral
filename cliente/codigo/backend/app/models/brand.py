from sqlalchemy import Column, String, Text, DateTime, Boolean, Uuid
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .base import Base

class Brand(Base):
    __tablename__ = "brands"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    products = relationship("Product", back_populates="brand_rel")

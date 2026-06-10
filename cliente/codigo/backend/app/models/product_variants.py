from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .base import Base

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    size = Column(Numeric(3, 1), nullable=False)
    stock_quantity = Column(Integer, default=0)

    product = relationship("Product", back_populates="inventory")

class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    image_url = Column(Text, nullable=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="images")

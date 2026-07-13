from sqlalchemy import Column, String, Text, Numeric, Integer, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .base import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="pending") # pending, completed, cancelled
    total_amount = Column(Numeric(10, 2), nullable=False)
    shipping_address = Column(Text, nullable=True)
    paypal_order_id = Column(String(100), nullable=True)
    coupon_code = Column(String(50), nullable=True)
    discount_amount = Column(Numeric(10, 2), default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    user = relationship("User", foreign_keys=[user_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(Uuid(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False)
    size = Column(Numeric(3, 1), nullable=False) # Guardamos la talla del zapato vendido
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    # Relaciones
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

from sqlalchemy import Column, String, Text, Numeric, Boolean, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy
import uuid
from datetime import datetime
from .base import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    brand_id = Column(Uuid(as_uuid=True), ForeignKey("brands.id"))
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    base_price = Column(Numeric(10, 2))
    category_id = Column(Uuid(as_uuid=True), ForeignKey("categories.id"))
    main_image_url = Column(Text)
    gender = Column(String(20))  # Hombre / Mujer / Niño / Unisex
    colors = Column(Text)  # Colores disponibles, separados por coma (ej: "Negro,Blanco,Rojo")
    sku = Column(String(100), unique=True, index=True)  # Código interno para inventario y pedidos
    is_active = Column(Boolean, default=True)  # Estado del producto: True = Activo, False = Borrador
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    brand_rel = relationship("Brand", back_populates="products")
    inventory = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

    # Proxy para obtener el nombre de la marca
    brand = association_proxy('brand_rel', 'name')
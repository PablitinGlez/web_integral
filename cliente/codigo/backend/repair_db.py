from app.database import engine
from app.models.base import Base
from app.models import Product, Category, User, Inventory, ProductImage

print("Dropping all tables...")
# Usamos el engine para limpiar y recrear
Base.metadata.drop_all(bind=engine)
print("Creating all tables with correct schema...")
Base.metadata.create_all(bind=engine)
print("Database repaired successfully!")

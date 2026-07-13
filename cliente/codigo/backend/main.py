from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import products, auth, categories, brands, inventory, metrics, addresses, coupons, orders

# Importar modelos para que SQLAlchemy los reconozca al crear las tablas
from app.models import product, category, brand, user, product_variants, address, coupon, order

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# Ejecutar migración preventiva para agregar columnas
try:
    with engine.connect() as connection:
        from sqlalchemy import text
        connection.execute(text("ALTER TABLE orders ADD COLUMN paypal_order_id VARCHAR(100)"))
        connection.commit()
except Exception:
    pass

try:
    with engine.connect() as connection:
        from sqlalchemy import text
        connection.execute(text("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50)"))
        connection.execute(text("ALTER TABLE orders ADD COLUMN discount_amount NUMERIC(10, 2) DEFAULT 0.0"))
        connection.commit()
except Exception:
    pass

app = FastAPI(title="El Zapatito API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(products.router)
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(brands.router)
app.include_router(inventory.router)
app.include_router(metrics.router)
app.include_router(addresses.router)
app.include_router(coupons.router)
app.include_router(orders.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de El Zapatito"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fastapi"}
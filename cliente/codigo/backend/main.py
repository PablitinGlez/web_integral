from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import products, auth, categories, inventory, metrics

# Importar modelos para que SQLAlchemy los reconozca al crear las tablas
from app.models import product, category, user, product_variants #, order

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

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
app.include_router(inventory.router)
app.include_router(metrics.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de El Zapatito"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fastapi"}

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from ..database import get_db
from ..models import product as product_model
from ..models import brand as brand_model
from ..schemas import product as product_schema
from ..services.cloudinary_service import CloudinaryService

router = APIRouter(prefix="/products", tags=["products"], redirect_slashes=False)

@router.get("/", response_model=List[product_schema.Product])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(product_model.Product).offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=product_schema.Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@router.post("/", response_model=product_schema.Product)
async def create_product(
    name: str = Form(...),
    brand: str = Form(None),
    description: str = Form(None),
    price: float = Form(...),
    base_price: float = Form(None),
    category_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Subir imagen a Cloudinary
    image_url = CloudinaryService.upload_image(file.file)
    if not image_url:
        raise HTTPException(status_code=500, detail="Error al subir la imagen")

    # Resolver brand_id
    brand_id = None
    if brand:
        # Verificar si brand es un UUID válido
        is_uuid = False
        try:
            UUID(brand)
            is_uuid = True
        except ValueError:
            is_uuid = False

        if is_uuid:
            db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.id == brand).first()
        else:
            db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.name == brand).first()
        
        if db_brand:
            brand_id = db_brand.id

    # 2. Crear producto en DB
    new_product = product_model.Product(
        name=name,
        brand_id=brand_id,
        description=description,
        price=price,
        base_price=base_price,
        category_id=category_id if category_id else None,
        main_image_url=image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.delete("/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db.delete(product)
    db.commit()
    return {"message": "Producto eliminado exitosamente"}

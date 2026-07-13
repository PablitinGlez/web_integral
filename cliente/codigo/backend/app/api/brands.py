from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import brand as brand_model
from ..schemas import brand as brand_schema

router = APIRouter(prefix="/brands", tags=["brands"], redirect_slashes=False)


@router.get("/", response_model=List[brand_schema.Brand])
def get_brands(db: Session = Depends(get_db)):
    # El admin necesita ver todas (activas e inactivas)
    return db.query(brand_model.Brand).order_by(brand_model.Brand.created_at.desc()).all()


@router.get("/{brand_id}", response_model=brand_schema.Brand)
def get_brand(brand_id: str, db: Session = Depends(get_db)):
    db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.id == brand_id).first()
    if not db_brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return db_brand


@router.post("/", response_model=brand_schema.Brand)
def create_brand(brand: brand_schema.BrandCreate, db: Session = Depends(get_db)):
    # Validar nombre duplicado (insensible a mayúsculas/minúsculas)
    name_normalized = brand.name.strip()
    existing = db.query(brand_model.Brand).filter(
        func.lower(brand_model.Brand.name) == func.lower(name_normalized)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una marca con este nombre.")

    db_brand = brand_model.Brand(
        name=name_normalized,
        description=brand.description.strip() if brand.description else None,
        is_active=brand.is_active
    )
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)
    return db_brand


@router.put("/{brand_id}", response_model=brand_schema.Brand)
def update_brand(brand_id: str, brand: brand_schema.BrandUpdate, db: Session = Depends(get_db)):
    db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.id == brand_id).first()
    if not db_brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    update_data = brand.model_dump(exclude_unset=True) if hasattr(brand, "model_dump") else brand.dict(exclude_unset=True)

    if "name" in update_data:
        name_normalized = update_data["name"].strip()
        existing = db.query(brand_model.Brand).filter(
            func.lower(brand_model.Brand.name) == func.lower(name_normalized),
            brand_model.Brand.id != brand_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ya existe una marca con este nombre.")
        update_data["name"] = name_normalized

    if "description" in update_data and update_data["description"] is not None:
        update_data["description"] = update_data["description"].strip()

    for key, value in update_data.items():
        setattr(db_brand, key, value)

    db.commit()
    db.refresh(db_brand)
    return db_brand


@router.patch("/{brand_id}", response_model=brand_schema.Brand)
def patch_brand(brand_id: str, brand: brand_schema.BrandUpdate, db: Session = Depends(get_db)):
    db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.id == brand_id).first()
    if not db_brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    update_data = brand.model_dump(exclude_unset=True) if hasattr(brand, "model_dump") else brand.dict(exclude_unset=True)

    if "name" in update_data:
        name_normalized = update_data["name"].strip()
        existing = db.query(brand_model.Brand).filter(
            func.lower(brand_model.Brand.name) == func.lower(name_normalized),
            brand_model.Brand.id != brand_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ya existe una marca con este nombre.")
        update_data["name"] = name_normalized

    if "description" in update_data and update_data["description"] is not None:
        update_data["description"] = update_data["description"].strip()

    for key, value in update_data.items():
        setattr(db_brand, key, value)

    db.commit()
    db.refresh(db_brand)
    return db_brand



@router.delete("/{brand_id}")
def delete_brand(brand_id: str, db: Session = Depends(get_db)):
    db_brand = db.query(brand_model.Brand).filter(brand_model.Brand.id == brand_id).first()
    if not db_brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Importación diferida para evitar dependencias circulares
    from ..models.product import Product
    associated_products = db.query(Product).filter(Product.brand_id == brand_id).count()
    if associated_products > 0:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la marca porque tiene productos asociados. Intente desactivarla."
        )

    db.delete(db_brand)
    db.commit()
    return {"message": "Marca eliminada correctamente"}
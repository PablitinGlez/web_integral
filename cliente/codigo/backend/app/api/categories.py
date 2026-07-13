from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import category as cat_model
from ..schemas import category as cat_schema

router = APIRouter(prefix="/categories", tags=["categories"], redirect_slashes=False)

@router.get("/", response_model=List[cat_schema.Category])
def get_categories(db: Session = Depends(get_db)):
    # El admin necesita ver todas (activas e inactivas)
    return db.query(cat_model.Category).order_by(cat_model.Category.created_at.desc()).all()

@router.post("/", response_model=cat_schema.Category)
def create_category(category: cat_schema.CategoryCreate, db: Session = Depends(get_db)):
    db_cat = cat_model.Category(name=category.name, description=category.description, is_active=category.is_active)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.put("/{category_id}", response_model=cat_schema.Category)
def update_category(category_id: str, category: cat_schema.CategoryUpdate, db: Session = Depends(get_db)):
    db_cat = db.query(cat_model.Category).filter(cat_model.Category.id == category_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cat, key, value)
        
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.patch("/{category_id}", response_model=cat_schema.Category)
def patch_category(category_id: str, category: cat_schema.CategoryUpdate, db: Session = Depends(get_db)):
    db_cat = db.query(cat_model.Category).filter(cat_model.Category.id == category_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cat, key, value)
        
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.delete("/{category_id}")
def delete_category(category_id: str, db: Session = Depends(get_db)):
    db_cat = db.query(cat_model.Category).filter(cat_model.Category.id == category_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")

    # Verificar si hay productos asociados
    from ..models.product import Product
    associated_products = db.query(Product).filter(Product.category_id == category_id).count()
    if associated_products > 0:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la categoría porque tiene productos asociados. Intenta desactivarla."
        )

    db.delete(db_cat)
    db.commit()
    return {"message": "Categoría eliminada correctamente."}

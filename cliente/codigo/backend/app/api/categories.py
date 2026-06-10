from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import category as cat_model
from ..schemas import category as cat_schema

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[cat_schema.Category])
def get_categories(db: Session = Depends(get_db)):
    return db.query(cat_model.Category).all()

@router.post("/", response_model=cat_schema.Category)
def create_category(category: cat_schema.CategoryCreate, db: Session = Depends(get_db)):
    db_cat = cat_model.Category(name=category.name, description=category.description)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

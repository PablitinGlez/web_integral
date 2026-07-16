from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import supplier as supplier_model
from ..schemas import supplier as supplier_schema
from ..services.auth_service import AuthService

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.get("/", response_model=List[supplier_schema.Supplier])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(supplier_model.Supplier).order_by(supplier_model.Supplier.created_at.desc()).all()

@router.get("/{supplier_id}", response_model=supplier_schema.Supplier)
def get_supplier(supplier_id: str, db: Session = Depends(get_db)):
    db_supplier = db.query(supplier_model.Supplier).filter(supplier_model.Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return db_supplier

@router.post("/", response_model=supplier_schema.Supplier)
def create_supplier(supplier: supplier_schema.SupplierCreate, db: Session = Depends(get_db), token: dict = Depends(AuthService.verify_supabase_token)):
    # Validar nombre duplicado (insensible a mayúsculas/minúsculas)
    name_normalized = supplier.name.strip()
    existing = db.query(supplier_model.Supplier).filter(
        func.lower(supplier_model.Supplier.name) == func.lower(name_normalized)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un proveedor con este nombre.")

    db_supplier = supplier_model.Supplier(
        name=name_normalized,
        contact_name=supplier.contact_name.strip() if supplier.contact_name else None,
        phone=supplier.phone.strip() if supplier.phone else None,
        email=supplier.email.strip() if supplier.email else None,
        address=supplier.address.strip() if supplier.address else None,
        is_active=supplier.is_active
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.put("/{supplier_id}", response_model=supplier_schema.Supplier)
def update_supplier(supplier_id: str, supplier: supplier_schema.SupplierUpdate, db: Session = Depends(get_db), token: dict = Depends(AuthService.verify_supabase_token)):
    db_supplier = db.query(supplier_model.Supplier).filter(supplier_model.Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    update_data = supplier.model_dump(exclude_unset=True) if hasattr(supplier, "model_dump") else supplier.dict(exclude_unset=True)

    if "name" in update_data:
        name_normalized = update_data["name"].strip()
        existing = db.query(supplier_model.Supplier).filter(
            func.lower(supplier_model.Supplier.name) == func.lower(name_normalized),
            supplier_model.Supplier.id != supplier_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ya existe un proveedor con este nombre.")
        update_data["name"] = name_normalized

    for key, value in update_data.items():
        if isinstance(value, str):
            setattr(db_supplier, key, value.strip())
        else:
            setattr(db_supplier, key, value)

    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: str, db: Session = Depends(get_db), token: dict = Depends(AuthService.verify_supabase_token)):
    db_supplier = db.query(supplier_model.Supplier).filter(supplier_model.Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    # Verificar si hay productos asociados antes de eliminar o simplemente desvincularlos
    # Vamos a desvincularlos poniendo supplier_id a NULL en products
    from ..models.product import Product
    db.query(Product).filter(Product.supplier_id == supplier_id).update({Product.supplier_id: None})
    
    db.delete(db_supplier)
    db.commit()
    return {"message": "Proveedor eliminado con éxito y productos desvinculados"}

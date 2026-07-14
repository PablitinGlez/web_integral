from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import product_variants as inv_model
from ..schemas import product_variants as inv_schema
from ..services.auth_service import AuthService

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/{product_id}", response_model=List[inv_schema.Inventory])
def get_product_inventory(product_id: str, db: Session = Depends(get_db)):
    return db.query(inv_model.Inventory).filter(inv_model.Inventory.product_id == product_id).all()

@router.post("/", response_model=inv_schema.Inventory)
def add_inventory(inventory: inv_schema.InventoryCreate, product_id: str, db: Session = Depends(get_db), token: dict = Depends(AuthService.verify_supabase_token)):
    # Verificar si ya existe la talla para este producto
    db_inv = db.query(inv_model.Inventory).filter(
        inv_model.Inventory.product_id == product_id,
        inv_model.Inventory.size == inventory.size
    ).first()

    if db_inv:
        db_inv.stock_quantity += inventory.stock_quantity
    else:
        db_inv = inv_model.Inventory(
            product_id=product_id,
            size=inventory.size,
            stock_quantity=inventory.stock_quantity
        )
        db.add(db_inv)
    
    db.commit()
    db.refresh(db_inv)
    return db_inv

@router.put("/{inventory_id}", response_model=inv_schema.Inventory)
def update_stock(inventory_id: str, quantity: int, db: Session = Depends(get_db), token: dict = Depends(AuthService.verify_supabase_token)):
    db_inv = db.query(inv_model.Inventory).filter(inv_model.Inventory.id == inventory_id).first()
    if not db_inv:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    
    db_inv.stock_quantity = quantity
    db.commit()
    db.refresh(db_inv)
    return db_inv

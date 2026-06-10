from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import product as product_model
from ..models import product_variants as inv_model

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/summary")
def get_metrics_summary(db: Session = Depends(get_db)):
    total_products = db.query(product_model.Product).count()
    total_stock = db.query(func.sum(inv_model.Inventory.stock_quantity)).scalar() or 0
    total_value = db.query(func.sum(product_model.Product.price * inv_model.Inventory.stock_quantity)).\
        join(inv_model.Inventory).scalar() or 0
    
    low_stock_count = db.query(inv_model.Inventory).filter(inv_model.Inventory.stock_quantity < 5).count()

    return {
        "total_products": total_products,
        "total_stock": int(total_stock),
        "total_value_estimated": float(total_value),
        "low_stock_alerts": low_stock_count
    }

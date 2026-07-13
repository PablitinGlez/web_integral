from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import product as product_model
from ..models import product_variants as inv_model
from ..models.category import Category
from ..models.brand import Brand
from ..models.order import Order

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/summary")
def get_metrics_summary(db: Session = Depends(get_db)):
    total_products = db.query(product_model.Product).count()
    total_categories = db.query(Category).count()
    total_brands = db.query(Brand).count()

    total_stock = db.query(func.sum(inv_model.Inventory.stock_quantity)).scalar() or 0
    available_products = (
        db.query(func.count(func.distinct(inv_model.Inventory.product_id)))
        .filter(inv_model.Inventory.stock_quantity > 0)
        .scalar() or 0
    )
    active_products = (
        db.query(product_model.Product)
        .filter(product_model.Product.is_active == True)
        .count()
    )
    total_value = db.query(func.sum(product_model.Product.price * inv_model.Inventory.stock_quantity)).\
        join(inv_model.Inventory).scalar() or 0

    low_stock_count = db.query(inv_model.Inventory).filter(inv_model.Inventory.stock_quantity < 5).count()

    total_orders = db.query(Order).count()
    total_sales = db.query(func.sum(Order.total_amount)).filter(Order.status == 'completado').scalar() or 0

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_brands": total_brands,
        "total_stock": int(total_stock),
        "available_products": int(available_products),
        "active_products": active_products,
        "total_value_estimated": float(total_value),
        "low_stock_alerts": low_stock_count,
        "total_orders": total_orders,
        "total_sales": float(total_sales)
    }

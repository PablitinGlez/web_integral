from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import product as product_model
from ..models import product_variants as inv_model
from ..models.category import Category
from ..models.brand import Brand
from ..models.order import Order
from ..models.coupon import Coupon

router = APIRouter(prefix="/metrics", tags=["metrics"])


def get_metrics_summary_data(db: Session):
    total_products = db.query(product_model.Product).count()
    total_categories = db.query(Category).filter(Category.is_active.is_(True)).count()
    total_brands = db.query(Brand).filter(Brand.is_active.is_(True)).count()
    active_products = db.query(product_model.Product).filter(product_model.Product.is_active.is_(True)).count()
    available_products = db.query(product_model.Product).filter(product_model.Product.is_active.is_(True)).join(inv_model.Inventory).filter(
        inv_model.Inventory.stock_quantity > 0
    ).distinct().count()
    total_stock = db.query(func.sum(inv_model.Inventory.stock_quantity)).scalar() or 0
    total_value = db.query(func.sum(product_model.Product.price * inv_model.Inventory.stock_quantity)).join(inv_model.Inventory).scalar() or 0
    low_stock_count = db.query(inv_model.Inventory).filter(inv_model.Inventory.stock_quantity < 5).count()
    total_orders = db.query(Order).count()
    active_coupons = db.query(Coupon).filter(Coupon.is_active.is_(True)).count()

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_brands": total_brands,
        "available_products": available_products,
        "active_products": active_products,
        "total_stock": int(total_stock),
        "total_value_estimated": float(total_value),
        "low_stock_alerts": low_stock_count,
        "total_orders": total_orders,
        "active_coupons": active_coupons,
    }


@router.get("/summary")
def get_metrics_summary(db: Session = Depends(get_db)):
    return get_metrics_summary_data(db)

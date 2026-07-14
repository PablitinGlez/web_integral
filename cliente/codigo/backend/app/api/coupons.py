from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.coupon import Coupon
from ..schemas.coupon import CouponCreate, CouponResponse

router = APIRouter(prefix="/coupons", tags=["coupons"], redirect_slashes=False)


def calculate_discounted_total(subtotal: Decimal, coupon: Optional[dict] = None):
    discount_amount = Decimal("0")
    final_total = subtotal

    if coupon:
        if coupon.get("discount_type") == "percentage":
            discount_amount = (subtotal * coupon.get("value", Decimal("0"))) / Decimal("100")
        elif coupon.get("discount_type") == "fixed":
            discount_amount = min(subtotal, coupon.get("value", Decimal("0")))

        final_total = subtotal - discount_amount

    return {
        "subtotal": subtotal,
        "discount_amount": round(discount_amount, 2),
        "final_total": round(final_total, 2),
    }


@router.get("/validate", response_model=dict)
def validate_coupon(
    code: str = Query(...),
    subtotal: Decimal = Query(...),
    db: Session = Depends(get_db),
):
    coupon = db.query(Coupon).filter(Coupon.code == code.upper()).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")

    now = datetime.now(timezone.utc)
    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="El cupón no está activo")
    if coupon.start_date and now < coupon.start_date:
        raise HTTPException(status_code=400, detail="El cupón aún no está disponible")
    if coupon.end_date and now > coupon.end_date:
        raise HTTPException(status_code=400, detail="El cupón ha expirado")
    if coupon.min_amount and Decimal(str(subtotal)) < coupon.min_amount:
        raise HTTPException(status_code=400, detail="El subtotal no alcanza el monto mínimo")
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="El cupón ya alcanzó su límite de uso")

    return {
        "valid": True,
        "coupon": {
            "code": coupon.code,
            "name": coupon.name,
            "discount_type": coupon.discount_type,
            "value": float(coupon.value),
        },
        **calculate_discounted_total(Decimal(str(subtotal)), {
            "discount_type": coupon.discount_type,
            "value": coupon.value,
        }),
    }


@router.get("/", response_model=list[CouponResponse])
def list_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()


@router.post("/", response_model=CouponResponse)
def create_coupon(coupon_in: CouponCreate, db: Session = Depends(get_db)):
    coupon = Coupon(
        code=coupon_in.code.upper(),
        name=coupon_in.name,
        description=coupon_in.description,
        discount_type=coupon_in.discount_type,
        value=coupon_in.value,
        min_amount=coupon_in.min_amount,
        is_active=coupon_in.is_active,
        start_date=coupon_in.start_date,
        end_date=coupon_in.end_date,
        usage_limit=coupon_in.usage_limit,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

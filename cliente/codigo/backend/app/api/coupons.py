from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models.coupon import Coupon
from ..schemas.coupon import CouponCreate, CouponResponse, CouponValidate

router = APIRouter(prefix="/coupons", tags=["coupons"], redirect_slashes=False)

@router.get("/", response_model=List[CouponResponse])
def get_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()

@router.post("/", response_model=CouponResponse)
def create_coupon(coupon_in: CouponCreate, db: Session = Depends(get_db)):
    # Verificar si el código ya existe
    existing = db.query(Coupon).filter(Coupon.code == coupon_in.code.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un cupón con este código.")

    new_coupon = Coupon(
        code=coupon_in.code.upper().strip(),
        discount_type=coupon_in.discount_type,
        value=coupon_in.value,
        min_purchase_amount=coupon_in.min_purchase_amount,
        is_active=coupon_in.is_active,
        expiration_date=coupon_in.expiration_date
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

@router.delete("/{coupon_id}")
def delete_coupon(coupon_id: str, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupón no encontrado.")
    db.delete(coupon)
    db.commit()
    return {"message": "Cupón eliminado correctamente."}

@router.post("/validate")
def validate_coupon(payload: CouponValidate, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.code == payload.code.upper().strip()).first()
    
    if not coupon:
        raise HTTPException(status_code=400, detail="Código de cupón no válido.")
    
    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="Este cupón está desactivado.")
        
    if coupon.expiration_date and coupon.expiration_date < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Este cupón ha expirado.")
        
    if payload.total_amount < coupon.min_purchase_amount:
        raise HTTPException(
            status_code=400, 
            detail=f"La compra mínima para usar este cupón es de ${coupon.min_purchase_amount:.2f} MXN."
        )
        
    # Calcular el descuento
    discount_amount = 0.0
    if coupon.discount_type == "percentage":
        discount_amount = float(payload.total_amount) * (float(coupon.value) / 100.0)
    elif coupon.discount_type == "fixed":
        discount_amount = float(coupon.value)
        
    # El descuento no puede superar el total de la compra
    discount_amount = min(discount_amount, float(payload.total_amount))
    
    return {
        "valid": True,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "value": float(coupon.value),
        "discount_amount": discount_amount
    }

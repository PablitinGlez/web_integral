from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from jose import jwt, JWTError
from ..database import get_db
from ..core.config import settings
from ..models.order import Order, OrderItem
from ..models.product_variants import Inventory
from ..schemas import order as order_schema
from ..services.auth_service import AuthService

router = APIRouter(prefix="/orders", tags=["orders"], redirect_slashes=False)
security = HTTPBearer(auto_error=False)

from ..models.user import User

def get_current_user_id_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[str]:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        from ..services.auth_service import verify_token_with_supabase
        user_data = verify_token_with_supabase(token)
    except Exception:
        return None

    uid = user_data.get("id")
    email = user_data.get("email")
    user_metadata = user_data.get("user_metadata", {})
    full_name = user_metadata.get("full_name") if isinstance(user_metadata, dict) else None


    # Sync/Ensure user exists in the public.users table
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        user = User(
            id=uid,
            email=email,
            full_name=full_name,
            role="user",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return str(uid)




@router.post("/", response_model=order_schema.OrderResponse)
def create_order(
    order_in: order_schema.OrderCreate,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id_optional)
):
    try:
        total = 0
        order_items = []
        
        for item in order_in.items:
            # Buscar variante de talla
            inv = db.query(Inventory).filter(
                Inventory.product_id == item.product_id,
                Inventory.size == item.size
            ).first()
            
            if not inv:
                raise HTTPException(
                    status_code=400,
                    detail=f"La variante de talla {item.size} para el producto {item.product_id} no existe en el inventario."
                )
                
            if inv.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para el producto {item.product_id} talla {item.size}. Disponible: {inv.stock_quantity}, Solicitado: {item.quantity}"
                )
                
            # Restar stock
            inv.stock_quantity -= item.quantity
            
            # Acumular total
            item_total = item.unit_price * item.quantity
            total += item_total
            
            order_items.append(
                OrderItem(
                    product_id=item.product_id,
                    size=item.size,
                    quantity=item.quantity,
                    unit_price=item.unit_price
                )
            )
            
        # Crear orden con descuento aplicado
        final_total = max(0.0, float(total) - (order_in.discount_amount or 0.0))
        status = "completado" if order_in.paypal_order_id else "pendiente"
        new_order = Order(
            user_id=user_id,
            status=status,
            total_amount=final_total,
            shipping_address=order_in.shipping_address,
            paypal_order_id=order_in.paypal_order_id,
            coupon_code=order_in.coupon_code,
            discount_amount=order_in.discount_amount or 0.0,
            items=order_items
        )
        
        db.add(new_order)
        db.commit()
        
        # Recargar con relaciones precargadas para la respuesta
        db.refresh(new_order)
        return db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.user)
        ).filter(Order.id == new_order.id).first()
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar el pedido: {str(e)}")

@router.get("/", response_model=List[order_schema.OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.user)
    ).order_by(Order.created_at.desc()).all()

@router.get("/my-orders", response_model=List[order_schema.OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    payload: dict = Depends(AuthService.verify_supabase_token)
):
    uid = payload.get("sub")
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.user)
    ).filter(Order.user_id == uid).order_by(Order.created_at.desc()).all()

@router.put("/{order_id}/status", response_model=order_schema.OrderResponse)
def update_order_status(
    order_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
    old_status = order.status.lower()
    new_status = status.lower()
    
    if old_status == new_status:
        return order
        
    # Devolver stock si se cancela
    if new_status == "cancelado" and old_status != "cancelado":
        for item in order.items:
            inv = db.query(Inventory).filter(
                Inventory.product_id == item.product_id,
                Inventory.size == item.size
            ).first()
            if inv:
                inv.stock_quantity += item.quantity
    # Si estaba cancelado y se reactiva, restar stock nuevamente
    elif old_status == "cancelado" and new_status != "cancelado":
        for item in order.items:
            inv = db.query(Inventory).filter(
                Inventory.product_id == item.product_id,
                Inventory.size == item.size
            ).first()
            if inv:
                if inv.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"No se puede reactivar el pedido. Stock insuficiente para {item.product_id} talla {item.size}."
                    )
                inv.stock_quantity -= item.quantity
                
    order.status = status
    db.commit()
    
    # Retornar con relaciones precargadas
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.user)
    ).filter(Order.id == order_id).first()

@router.get("/config/paypal")
def get_paypal_config():
    return {"client_id": settings.PAYPAL_CLIENT_ID or "test"}

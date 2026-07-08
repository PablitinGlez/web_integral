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

def get_current_user_id_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[str]:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload.get("sub")
    except JWTError:
        return None

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
            
        # Crear orden
        new_order = Order(
            user_id=user_id,
            status="pendiente",
            total_amount=total,
            shipping_address=order_in.shipping_address,
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

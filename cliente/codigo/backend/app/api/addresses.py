from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..models import address as address_model
from ..schemas import address as address_schema
from ..services.auth_service import AuthService

router = APIRouter(prefix="/addresses", tags=["addresses"])


def get_current_user_id(payload: dict = Depends(AuthService.verify_supabase_token)) -> UUID:
    """Extrae el id del usuario autenticado a partir del token de Supabase."""
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido: no contiene el id del usuario")
    return UUID(user_id)


def _get_owned_address(db: Session, address_id: UUID, user_id: UUID) -> address_model.Address:
    address = db.query(address_model.Address).filter(address_model.Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Dirección no encontrada")
    if address.user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta dirección")
    return address


def _clear_defaults(db: Session, user_id: UUID):
    db.query(address_model.Address).filter(
        address_model.Address.user_id == user_id,
        address_model.Address.is_default == True  # noqa: E712
    ).update({"is_default": False})


@router.get("/", response_model=List[address_schema.Address])
def list_addresses(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return (
        db.query(address_model.Address)
        .filter(address_model.Address.user_id == user_id)
        .order_by(address_model.Address.is_default.desc(), address_model.Address.created_at.asc())
        .all()
    )


@router.post("/", response_model=address_schema.Address)
def create_address(
    payload: address_schema.AddressCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    is_first_address = db.query(address_model.Address).filter(address_model.Address.user_id == user_id).count() == 0
    should_be_default = payload.is_default or is_first_address

    if should_be_default:
        _clear_defaults(db, user_id)

    new_address = address_model.Address(
        user_id=user_id,
        label=payload.label,
        street=payload.street,
        city=payload.city,
        state=payload.state,
        zip_code=payload.zip_code,
        country=payload.country or "México",
        phone=payload.phone,
        is_default=should_be_default
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


@router.put("/{address_id}", response_model=address_schema.Address)
def update_address(
    address_id: UUID,
    payload: address_schema.AddressUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    address = _get_owned_address(db, address_id, user_id)

    address.label = payload.label
    address.street = payload.street
    address.city = payload.city
    address.state = payload.state
    address.zip_code = payload.zip_code
    address.country = payload.country or "México"
    address.phone = payload.phone

    db.commit()
    db.refresh(address)
    return address


@router.patch("/{address_id}", response_model=address_schema.Address)
def patch_address(
    address_id: UUID,
    payload: address_schema.AddressPatch,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    address = _get_owned_address(db, address_id, user_id)

    # Solo se actualizan los campos que realmente vinieron en la petición
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}")
def delete_address(
    address_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    address = _get_owned_address(db, address_id, user_id)
    was_default = address.is_default

    db.delete(address)
    db.commit()

    # Si borramos la dirección principal y quedan otras, la más antigua pasa a ser principal
    if was_default:
        next_address = (
            db.query(address_model.Address)
            .filter(address_model.Address.user_id == user_id)
            .order_by(address_model.Address.created_at.asc())
            .first()
        )
        if next_address:
            next_address.is_default = True
            db.commit()

    return {"message": "Dirección eliminada exitosamente"}


@router.post("/{address_id}/set-default", response_model=address_schema.Address)
def set_default_address(
    address_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    address = _get_owned_address(db, address_id, user_id)

    _clear_defaults(db, user_id)
    address.is_default = True

    db.commit()
    db.refresh(address)
    return address
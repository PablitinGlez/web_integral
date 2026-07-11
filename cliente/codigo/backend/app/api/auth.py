from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional
from ..services.auth_service import AuthService
from ..core.config import settings
from ..database import get_db
from ..models import user as user_model
from ..schemas.user import UserProfileUpdate, UserProfilePatch
import urllib.request
import urllib.error
import json


router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


# ── Schemas ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str = Field(default="20233l001043@utcv.edu.mx", description="Correo del usuario")
    password: str = Field(default="123456", description="Contraseña del usuario")

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_email: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_or_build_user(db: Session, payload: dict) -> user_model.User:
    """Obtiene la fila del usuario en la tabla `users`. Si todavía no existe
    (por ejemplo, un usuario recién registrado que nunca guardó su perfil),
    la crea con los datos básicos que trae el token, para que quede lista
    y se pueda consultar/editar sin errores."""
    user_id = payload.get("sub")
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()

    if not user:
        user = user_model.User(
            id=user_id,
            email=payload.get("email"),
            full_name=(payload.get("user_metadata") or {}).get("full_name"),
            role=payload.get("role", "user")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Iniciar sesión",
    description=(
        "Recibe email y contraseña, los envía a Supabase Auth y devuelve el "
        "access_token. Úsalo para obtener el token y luego autorizarte en "
        "Swagger con el candado 🔒."
    ),
)
def login(body: LoginRequest):
    """
    Pasos para usar la documentación completa:
    1. Ejecuta este endpoint con tu email y contraseña de Supabase.
    2. Copia el access_token de la respuesta.
    3. Haz clic en 'Authorize 🔒' arriba a la derecha en Swagger.
    4. Pega el token y haz clic en Authorize.
    5. Ahora puedes usar cualquier endpoint protegido (como GET /auth/me).
    """
    supabase_login_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password"
    req = urllib.request.Request(
        supabase_login_url,
        data=json.dumps({"email": body.email, "password": body.password}).encode(),
        headers={
            "apikey": settings.SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        try:
            error_data = json.loads(e.read().decode())
            error_detail = error_data.get("error_description", "Credenciales incorrectas")
        except Exception:
            error_detail = "Credenciales incorrectas"
        raise HTTPException(status_code=401, detail=error_detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al conectar con Supabase: {str(e)}")

    return LoginResponse(
        access_token=data["access_token"],
        token_type="bearer",
        expires_in=data.get("expires_in", 3600),
        user_email=data["user"]["email"],
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener usuario actual (protegido 🔒)",
    description=(
        "Devuelve los datos del usuario autenticado, incluyendo nombre, edad y teléfono. "
        "Requiere Bearer token — usa primero POST /auth/login para obtenerlo."
    ),
)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = AuthService.verify_supabase_token(credentials)

    if not payload.get("sub") or not payload.get("email"):
        raise HTTPException(
            status_code=401,
            detail="Token inválido: no contiene datos de usuario",
        )

    user = _get_or_build_user(db, payload)

    return UserResponse(
        id=str(user.id),
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        age=user.age,
        phone=user.phone,
    )


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Editar perfil (protegido 🔒)",
    description=(
        "Reemplaza el nombre, edad y teléfono del usuario autenticado. "
        "Requiere Bearer token — usa primero POST /auth/login para obtenerlo."
    ),
)
def update_current_user(
    profile: UserProfileUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = AuthService.verify_supabase_token(credentials)
    user = _get_or_build_user(db, payload)

    user.full_name = profile.full_name
    user.age = profile.age
    user.phone = profile.phone

    db.commit()
    db.refresh(user)

    return UserResponse(
        id=str(user.id),
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        age=user.age,
        phone=user.phone,
    )


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Editar parcialmente el perfil (protegido 🔒)",
    description=(
        "Actualiza solo los campos incluidos en la petición (nombre, edad y/o teléfono), "
        "sin tocar el resto. Requiere Bearer token."
    ),
)
def patch_current_user(
    profile: UserProfilePatch,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = AuthService.verify_supabase_token(credentials)
    user = _get_or_build_user(db, payload)

    updates = profile.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return UserResponse(
        id=str(user.id),
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        age=user.age,
        phone=user.phone,
    )
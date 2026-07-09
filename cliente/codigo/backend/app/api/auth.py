from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from ..services.auth_service import AuthService
from ..core.config import settings
import httpx

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

    class Config:
        from_attributes = True


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
    supabase_login_url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"

    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }
    payload = {"email": body.email, "password": body.password}

    with httpx.Client() as client:
        response = client.post(supabase_login_url, json=payload, headers=headers)

    if response.status_code != 200:
        error_detail = response.json().get("error_description", "Credenciales incorrectas")
        raise HTTPException(status_code=401, detail=error_detail)

    data = response.json()
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
        "Devuelve los datos del usuario autenticado. "
        "Requiere Bearer token — usa primero POST /auth/login para obtenerlo."
    ),
)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = AuthService.verify_supabase_token(credentials)

    user_id = payload.get("sub")
    email = payload.get("email")
    role = payload.get("role", "authenticated")

    if not user_id or not email:
        raise HTTPException(
            status_code=401,
            detail="Token inválido: no contiene datos de usuario",
        )

    return UserResponse(id=user_id, email=email, role=role)




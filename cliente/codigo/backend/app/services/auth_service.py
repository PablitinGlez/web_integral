from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..core.config import settings
import httpx

security = HTTPBearer()

class AuthService:
    @staticmethod
    def verify_supabase_token(credentials: HTTPAuthorizationCredentials = Security(security)):
        token = credentials.credentials
        
        # Llama a Supabase para verificar el token y obtener el usuario
        # Esto funciona con ES256 y HS256 sin importar el algoritmo
        headers = {
            "apikey": settings.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {token}",
        }
        
        with httpx.Client() as client:
            response = client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers=headers,
            )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Token inválido o expirado")
        
        user_data = response.json()
        
        # Retornamos un payload compatible con el formato anterior
        return {
            "sub": user_data.get("id"),
            "email": user_data.get("email"),
            "role": user_data.get("role", "authenticated"),
        }

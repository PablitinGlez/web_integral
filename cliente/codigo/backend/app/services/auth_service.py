from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from ..core.config import settings

security = HTTPBearer()

class AuthService:
    @staticmethod
    def verify_supabase_token(credentials: HTTPAuthorizationCredentials = Security(security)):
        token = credentials.credentials
        try:
            # Supabase JWTs are signed with the JWT Secret
            payload = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET, 
                algorithms=["HS256"], 
                audience="authenticated"
            )
            return payload
        except JWTError as e:
            raise HTTPException(status_code=401, detail="Token inválido o expirado")


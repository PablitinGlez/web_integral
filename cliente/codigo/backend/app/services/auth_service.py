from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import httpx
from ..core.config import settings
from ..database import get_db
from ..models.user import User

security = HTTPBearer()

def verify_token_with_supabase(token: str) -> dict:
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
    }
    with httpx.Client() as client:
        response = client.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers=headers,
            timeout=5
        )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return response.json()

class AuthService:
    @staticmethod
    def verify_supabase_token(
        credentials: HTTPAuthorizationCredentials = Security(security),
        db: Session = Depends(get_db)
    ):
        token = credentials.credentials
        try:
            user_data = verify_token_with_supabase(token)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=401, detail=f"Token inválido o expirado: {e}")
        
        uid = user_data.get("id")
        email = user_data.get("email")
        user_metadata = user_data.get("user_metadata", {})
        full_name = user_metadata.get("full_name") if isinstance(user_metadata, dict) else None

        # Sync user to database
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

        # Return a payload structure matching expectations
        return {
            "sub": uid,
            "email": email,
            "role": user_data.get("role", "authenticated"),
            "user_metadata": user_metadata
        }

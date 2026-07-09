from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import urllib.request
import urllib.error
import json
from ..core.config import settings
from ..database import get_db
from ..models.user import User

security = HTTPBearer()

def verify_token_with_supabase(token: str) -> dict:
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": settings.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {token}"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Error de autenticación con Supabase: {str(e)}")

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
        # Check if db is a Session. If not (e.g. called directly), retrieve one manually.
        from sqlalchemy.orm import Session as SQLAlchemySession
        db_session = db
        is_local_session = not isinstance(db, SQLAlchemySession)
        if is_local_session:
            from ..database import SessionLocal
            db_session = SessionLocal()

        try:
            user = db_session.query(User).filter(User.id == uid).first()
            if not user:
                user = User(
                    id=uid,
                    email=email,
                    full_name=full_name,
                    role="user",
                    is_active=True
                )
                db_session.add(user)
                db_session.commit()
                db_session.refresh(user)
        finally:
            if is_local_session:
                db_session.close()


        # Return a payload structure matching expectations
        return {
            "sub": uid,
            "email": email,
            "role": user_data.get("role", "authenticated"),
            "user_metadata": user_metadata
        }

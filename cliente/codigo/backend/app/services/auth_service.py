from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt, jwk
import base64
import urllib.request
import json
from ..core.config import settings
from ..database import get_db
from ..models.user import User

security = HTTPBearer()

_jwks = None

def get_jwks(supabase_url: str):
    global _jwks
    if _jwks is None:
        try:
            jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
            with urllib.request.urlopen(jwks_url, timeout=5) as response:
                _jwks = json.loads(response.read().decode())
        except Exception as e:
            print(f"[AUTH ERROR] Failed to fetch JWKS from Supabase: {e}")
    return _jwks

def decode_and_verify_token(token: str) -> dict:
    try:
        header = jwt.get_unverified_header(token)
    except Exception as e:
        raise JWTError(f"Failed to parse token header: {e}")

    alg = header.get("alg")
    kid = header.get("kid")

    if alg == "HS256":
        # Symmetric validation (Legacy)
        try:
            secret = base64.b64decode(settings.SUPABASE_JWT_SECRET)
        except Exception:
            secret = settings.SUPABASE_JWT_SECRET

        try:
            return jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
        except JWTError:
            # Fallback to raw string secret
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
    else:
        # Asymmetric validation using JWKS (ES256, RS256, etc.)
        jwks_data = get_jwks(settings.SUPABASE_URL)
        if not jwks_data:
            raise JWTError("Could not retrieve JWKS for asymmetric verification")
            
        key_data = next((k for k in jwks_data.get("keys", []) if k.get("kid") == kid), None)
        if not key_data:
            raise JWTError(f"Key ID {kid} not found in JWKS")

        # Construct public key and verify
        key = jwk.construct(key_data)
        return jwt.decode(
            token,
            key,
            algorithms=[alg],
            audience="authenticated"
        )

class AuthService:
    @staticmethod
    def verify_supabase_token(
        credentials: HTTPAuthorizationCredentials = Security(security),
        db: Session = Depends(get_db)
    ):
        token = credentials.credentials
        try:
            payload = decode_and_verify_token(token)
        except Exception as e:
            print(f"[AUTH ERROR] Token verification failed: {e}")
            try:
                unverified = jwt.get_unverified_claims(token)
                print(f"  Unverified claims: {unverified}")
            except Exception:
                pass
            raise HTTPException(status_code=401, detail=f"Token inválido o expirado: {e}")

        uid = payload.get("sub")
        email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
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

        return payload






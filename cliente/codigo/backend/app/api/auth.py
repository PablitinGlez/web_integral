from fastapi import APIRouter

# Los endpoints de /login y /register fueron eliminados.
# Ahora Supabase Auth se encarga de todo el flujo de autenticación.
router = APIRouter(prefix="/auth", tags=["auth"])


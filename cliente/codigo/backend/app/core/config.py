from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = "https://fnkmgolemfkyqldopjfr.supabase.co"
    SUPABASE_ANON_KEY: str = "mock_anon_key"
    SUPABASE_SERVICE_ROLE_KEY: str = "mock_service_key"
    DATABASE_URL: str = "sqlite:///./zapatito.db"
    
    CLOUDINARY_CLOUD_NAME: str = "mock"
    CLOUDINARY_API_KEY: str = "mock"
    CLOUDINARY_API_SECRET: str = "mock"
    
    SECRET_KEY: str = "mock_secret"
    SUPABASE_JWT_SECRET: str = "mock_secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

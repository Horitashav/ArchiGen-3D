from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ArchSynth 3D"
    PROJECT_NAME: str = "ArchSynth 3D"
    APP_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # AI & Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL_NAME: str = "openai/gpt-oss-20b"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    
    # Authentication
    SECRET_KEY: str = "your-32-char-random-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
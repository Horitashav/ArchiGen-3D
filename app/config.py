from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Text-to-3D Architect"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # AI Service Keys (Groq is free)
    # AI Service Keys
    GROQ_API_KEY: str = "gsk_placeholder"
    TRIPO_API_KEY: Optional[str] = None
    \

    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
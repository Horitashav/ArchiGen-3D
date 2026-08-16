from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Application settings loaded and validated from environment variables.
    """
    APP_NAME: str = "Text-to-3D Architect"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # AI Service API Keys
    OPENAI_API_KEY: str = "sk-placeholder"
    MESHY_API_KEY: Optional[str] = None
    MESHY_API_BASE_URL: str = "https://api.meshy.ai/v2"

    # Persistence & Cache
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Load from .env file automatically
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

# Singleton settings instance shared across the entire project
settings = Settings()
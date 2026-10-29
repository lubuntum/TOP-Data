from functools import lru_cache

from pydantic_settings import SettingsConfigDict, BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Top Data"
    DEBUG: bool = False
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./proforient.db"
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 360
    # CORS & Cookies
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    COOKIE_SECURE: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )


@lru_cache(maxsize=128)
def get_settings() -> Settings:
    return Settings()

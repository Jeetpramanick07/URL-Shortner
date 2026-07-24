from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables and .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Amazon Smart Link Shortener"
    app_env: str = "development"
    debug: bool = False
    database_url: str = Field(min_length=1)
    test_database_url: str | None = None
    admin_api_key: SecretStr
    public_scheme: Literal["http", "https"] = "http"
    ip_hash_secret: SecretStr
    seed_domains: str = "localhost"
    trust_proxy_headers: bool = False
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @field_validator("debug", mode="before")
    @classmethod
    def normalize_debug(cls, value: object) -> bool:
        if isinstance(value, str) and value.strip().lower() in {"release", "production", "prod"}:
            return False
        return value

    @field_validator("database_url")
    @classmethod
    def validate_postgres_url(cls, value: str) -> str:
        if not value.startswith("postgresql+psycopg://"):
            raise ValueError(
                "DATABASE_URL must use the postgresql+psycopg:// SQLAlchemy driver."
            )
        return value

    @field_validator("admin_api_key")
    @classmethod
    def validate_admin_key(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value()) < 8:
            raise ValueError("ADMIN_API_KEY must contain at least 8 characters.")
        return value

    @field_validator("ip_hash_secret")
    @classmethod
    def validate_hash_secret(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value()) < 16:
            raise ValueError("IP_HASH_SECRET must contain at least 16 characters.")
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def seed_domain_list(self) -> list[str]:
        return [item.strip() for item in self.seed_domains.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached validated Settings instance."""
    return Settings()


settings = get_settings()

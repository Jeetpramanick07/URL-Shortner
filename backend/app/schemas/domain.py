from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.utils.host import normalize_hostname


class DomainCreate(BaseModel):
    hostname: str
    display_name: str = Field(min_length=1, max_length=255)

    @field_validator("hostname", mode="before")
    @classmethod
    def normalize_domain_hostname(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Hostname must be a string.")
        return normalize_hostname(value)

    @field_validator("display_name", mode="before")
    @classmethod
    def clean_display_name(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Display name must be a string.")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Display name cannot be empty.")
        return cleaned


class DomainResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hostname: str
    display_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

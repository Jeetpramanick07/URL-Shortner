import re
from datetime import datetime, timezone
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import PaginationMeta
from app.services.amazon_url import AMAZON_HOSTS


ASIN_PATTERN = re.compile(r"^[A-Z0-9]{10}$")
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
RESERVED_SLUGS = {
    "api",
    "docs",
    "redoc",
    "openapi.json",
    "health",
    "admin",
    "login",
    "logout",
    "favicon.ico",
    "robots.txt",
}


def normalize_slug(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("Slug must be a string.")
    slug = value.strip().lower()
    if not 3 <= len(slug) <= 80:
        raise ValueError("Slug must contain between 3 and 80 characters.")
    if slug in RESERVED_SLUGS:
        raise ValueError("This slug is reserved and cannot be used.")
    if not SLUG_PATTERN.fullmatch(slug):
        raise ValueError(
            "Slug may contain lowercase letters, numbers and single hyphens only."
        )
    return slug


def normalize_asin(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("ASIN must be a string.")
    asin = value.strip().upper()
    if not ASIN_PATTERN.fullmatch(asin):
        raise ValueError("ASIN must contain exactly 10 uppercase letters or digits.")
    return asin


def normalize_country(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("Target country must be a string.")
    country = value.strip().upper()
    if country not in AMAZON_HOSTS:
        supported = ", ".join(sorted(AMAZON_HOSTS))
        raise ValueError(f"Unsupported marketplace. Supported values: {supported}.")
    return country


def normalize_keywords(value: object) -> list[str]:
    if not isinstance(value, list):
        raise ValueError("Keywords must be provided as a list.")

    cleaned: list[str] = []
    seen: set[str] = set()
    for item in value:
        if not isinstance(item, str):
            raise ValueError("Every keyword must be a string.")
        keyword = item.strip()
        if not keyword:
            continue
        if len(keyword) > 100:
            raise ValueError("Each keyword must contain at most 100 characters.")
        comparison_key = keyword.casefold()
        if comparison_key in seen:
            raise ValueError("Duplicate keywords are not allowed.")
        seen.add(comparison_key)
        cleaned.append(keyword)

    if not cleaned:
        raise ValueError("At least one non-empty keyword is required.")
    if len(cleaned) > 20:
        raise ValueError("A maximum of 20 keywords is allowed.")
    return cleaned


def normalize_optional_text(value: object) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError("Value must be a string or null.")
    cleaned = value.strip()
    return cleaned or None


def ensure_aware_datetime(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("Datetime values must include a timezone offset.")
    return value.astimezone(timezone.utc)


class LinkCreate(BaseModel):
    domain_id: int = Field(gt=0)
    slug: str
    asin: str
    target_country: str
    keywords: list[str]
    associate_tag: str | None = Field(default=None, max_length=100)
    expires_at: datetime | None = None

    _slug_validator = field_validator("slug", mode="before")(normalize_slug)
    _asin_validator = field_validator("asin", mode="before")(normalize_asin)
    _country_validator = field_validator("target_country", mode="before")(
        normalize_country
    )
    _keywords_validator = field_validator("keywords", mode="before")(
        normalize_keywords
    )
    _associate_tag_validator = field_validator("associate_tag", mode="before")(
        normalize_optional_text
    )
    _expires_at_validator = field_validator("expires_at")(ensure_aware_datetime)


class LinkUpdate(BaseModel):
    domain_id: int | None = Field(default=None, gt=0)
    slug: str | None = None
    asin: str | None = None
    target_country: str | None = None
    keywords: list[str] | None = None
    associate_tag: str | None = Field(default=None, max_length=100)
    expires_at: datetime | None = None
    is_active: bool | None = None

    _slug_validator = field_validator("slug", mode="before")(normalize_slug)
    _asin_validator = field_validator("asin", mode="before")(normalize_asin)
    _country_validator = field_validator("target_country", mode="before")(
        normalize_country
    )
    _keywords_validator = field_validator("keywords", mode="before")(
        normalize_keywords
    )
    _associate_tag_validator = field_validator("associate_tag", mode="before")(
        normalize_optional_text
    )
    _expires_at_validator = field_validator("expires_at")(ensure_aware_datetime)


class LinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    domain_id: int
    domain: str
    slug: str
    short_url: str
    asin: str
    target_country: str
    keywords: list[str]
    associate_tag: str | None
    click_sequence: int
    total_clicks: int
    is_active: bool
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime


class LinkListResponse(PaginationMeta):
    items: list[LinkResponse]

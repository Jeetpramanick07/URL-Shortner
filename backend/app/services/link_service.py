from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.click_event import ClickEvent
from app.models.domain import Domain
from app.models.link import Link
from app.schemas.link import LinkResponse


def build_short_url(domain: str, slug: str) -> str:
    return f"{settings.public_scheme}://{domain}/{slug}"


def get_domain(db: Session, domain_id: int) -> Domain | None:
    return db.get(Domain, domain_id)


def get_link(db: Session, link_id: UUID) -> Link | None:
    return db.get(Link, link_id)


def get_click_count(db: Session, link_id: UUID) -> int:
    statement = select(func.count(ClickEvent.id)).where(
        ClickEvent.link_id == link_id, ClickEvent.is_human.is_(True)
    )
    return int(db.scalar(statement) or 0)


def serialize_link(
    *,
    link: Link,
    domain_hostname: str,
    total_clicks: int,
) -> LinkResponse:
    return LinkResponse(
        id=link.id,
        domain_id=link.domain_id,
        domain=domain_hostname,
        slug=link.slug,
        short_url=build_short_url(domain_hostname, link.slug),
        asin=link.asin,
        target_country=link.target_country,
        keywords=list(link.keywords),
        associate_tag=link.associate_tag,
        click_sequence=link.click_sequence,
        total_clicks=total_clicks,
        is_active=link.is_active,
        expires_at=link.expires_at,
        created_at=link.created_at,
        updated_at=link.updated_at,
    )

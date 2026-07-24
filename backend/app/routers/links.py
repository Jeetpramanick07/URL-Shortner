import math
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin_key
from app.models.click_event import ClickEvent
from app.models.domain import Domain
from app.models.link import Link
from app.schemas.link import LinkCreate, LinkListResponse, LinkResponse, LinkUpdate
from app.services.link_service import get_click_count, serialize_link


router = APIRouter(
    prefix="/api/links",
    tags=["Links"],
    dependencies=[Depends(require_admin_key)],
)


def _missing_link() -> HTTPException:
    return HTTPException(status_code=404, detail="Link not found.")


def _get_active_or_inactive_domain(db: Session, domain_id: int) -> Domain:
    domain = db.get(Domain, domain_id)
    if domain is None:
        raise HTTPException(status_code=404, detail="Domain not found.")
    return domain


def _commit_or_slug_conflict(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A link with this slug already exists for the selected domain.",
        ) from exc


@router.post("", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
def create_link(payload: LinkCreate, db: Session = Depends(get_db)) -> LinkResponse:
    domain = _get_active_or_inactive_domain(db, payload.domain_id)
    link = Link(
        domain_id=payload.domain_id,
        slug=payload.slug,
        asin=payload.asin,
        target_country=payload.target_country,
        keywords=payload.keywords,
        associate_tag=payload.associate_tag,
        expires_at=payload.expires_at,
        is_active=True,
        click_sequence=0,
    )
    db.add(link)
    _commit_or_slug_conflict(db)
    db.refresh(link)
    return serialize_link(link=link, domain_hostname=domain.hostname, total_clicks=0)


@router.get("", response_model=LinkListResponse)
def list_links(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    domain_id: int | None = Query(default=None, gt=0),
    is_active: bool | None = Query(default=None),
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
) -> LinkListResponse:
    filters = []
    if domain_id is not None:
        filters.append(Link.domain_id == domain_id)
    if is_active is not None:
        filters.append(Link.is_active == is_active)
    if search and search.strip():
        term = f"%{search.strip()}%"
        filters.append(or_(Link.slug.ilike(term), Link.asin.ilike(term)))

    total_statement = select(func.count(Link.id))
    if filters:
        total_statement = total_statement.where(*filters)
    total = int(db.scalar(total_statement) or 0)

    click_count = (
        select(func.count(ClickEvent.id))
        .where(ClickEvent.link_id == Link.id)
        .correlate(Link)
        .scalar_subquery()
    )
    statement = (
        select(Link, Domain.hostname, click_count.label("total_clicks"))
        .join(Domain, Domain.id == Link.domain_id)
        .order_by(Link.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    if filters:
        statement = statement.where(*filters)

    rows = db.execute(statement).all()
    items = [
        serialize_link(
            link=row.Link,
            domain_hostname=row.hostname,
            total_clicks=int(row.total_clicks or 0),
        )
        for row in rows
    ]
    pages = math.ceil(total / page_size) if total else 0
    return LinkListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        pages=pages,
    )


@router.get("/{link_id}", response_model=LinkResponse)
def get_one_link(link_id: UUID, db: Session = Depends(get_db)) -> LinkResponse:
    row = db.execute(
        select(Link, Domain.hostname)
        .join(Domain, Domain.id == Link.domain_id)
        .where(Link.id == link_id)
    ).one_or_none()
    if row is None:
        raise _missing_link()
    return serialize_link(
        link=row.Link,
        domain_hostname=row.hostname,
        total_clicks=get_click_count(db, link_id),
    )


@router.patch("/{link_id}", response_model=LinkResponse)
def update_link(
    link_id: UUID,
    payload: LinkUpdate,
    db: Session = Depends(get_db),
) -> LinkResponse:
    link = db.get(Link, link_id)
    if link is None:
        raise _missing_link()

    update_data = payload.model_dump(exclude_unset=True)
    if "domain_id" in update_data:
        domain_id = update_data["domain_id"]
        if domain_id is None:
            raise HTTPException(status_code=422, detail="domain_id cannot be null.")
        _get_active_or_inactive_domain(db, domain_id)

    required_non_nullable = {"domain_id", "slug", "asin", "target_country", "keywords", "is_active"}
    for field in required_non_nullable:
        if field in update_data and update_data[field] is None:
            raise HTTPException(status_code=422, detail=f"{field} cannot be null.")

    keywords_changed = "keywords" in update_data
    for field, value in update_data.items():
        setattr(link, field, value)
    if keywords_changed:
        link.click_sequence = 0

    _commit_or_slug_conflict(db)
    db.refresh(link)
    domain = _get_active_or_inactive_domain(db, link.domain_id)
    return serialize_link(
        link=link,
        domain_hostname=domain.hostname,
        total_clicks=get_click_count(db, link.id),
    )


@router.post("/{link_id}/enable", response_model=LinkResponse)
def enable_link(link_id: UUID, db: Session = Depends(get_db)) -> LinkResponse:
    return _set_link_status(link_id=link_id, enabled=True, db=db)


@router.post("/{link_id}/disable", response_model=LinkResponse)
def disable_link(link_id: UUID, db: Session = Depends(get_db)) -> LinkResponse:
    return _set_link_status(link_id=link_id, enabled=False, db=db)


def _set_link_status(*, link_id: UUID, enabled: bool, db: Session) -> LinkResponse:
    link = db.get(Link, link_id)
    if link is None:
        raise _missing_link()
    link.is_active = enabled
    db.commit()
    db.refresh(link)
    domain = _get_active_or_inactive_domain(db, link.domain_id)
    return serialize_link(
        link=link,
        domain_hostname=domain.hostname,
        total_clicks=get_click_count(db, link.id),
    )


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_link(link_id: UUID, db: Session = Depends(get_db)) -> Response:
    link = db.get(Link, link_id)
    if link is None:
        raise _missing_link()
    db.delete(link)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

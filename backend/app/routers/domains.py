from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin_key
from app.models.domain import Domain
from app.schemas.domain import DomainCreate, DomainResponse


router = APIRouter(
    prefix="/api/domains",
    tags=["Domains"],
    dependencies=[Depends(require_admin_key)],
)


@router.get("", response_model=list[DomainResponse])
def list_domains(db: Session = Depends(get_db)) -> list[Domain]:
    return list(db.scalars(select(Domain).order_by(Domain.hostname)).all())


@router.post("", response_model=DomainResponse, status_code=status.HTTP_201_CREATED)
def create_domain(payload: DomainCreate, db: Session = Depends(get_db)) -> Domain:
    domain = Domain(
        hostname=payload.hostname,
        display_name=payload.display_name,
        is_active=True,
    )
    db.add(domain)
    try:
        db.commit()
        db.refresh(domain)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A domain with this hostname already exists.",
        ) from exc
    return domain

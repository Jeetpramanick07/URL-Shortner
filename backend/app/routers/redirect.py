from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.click_event import ClickEvent
from app.models.domain import Domain
from app.models.link import Link
from app.services.amazon_url import build_amazon_url
from app.services.rotation_service import (
    advance_and_select_keyword,
    select_keyword_without_increment,
)
from app.utils.datetime import utc_now
from app.utils.host import get_request_hostname
from app.utils.ip_hash import hash_ip


router = APIRouter(tags=["Redirect"])


def _redirect_response(destination: str) -> RedirectResponse:
    response = RedirectResponse(url=destination, status_code=302)
    response.headers["Cache-Control"] = "no-store, private, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response


@router.api_route("/{slug}", methods=["GET", "HEAD"], include_in_schema=False)
def resolve_short_link(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    try:
        hostname = get_request_hostname(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Domain not found.") from exc

    row = db.execute(
        select(Link)
        .join(Domain, Domain.id == Link.domain_id)
        .where(
            Domain.hostname == hostname,
            Domain.is_active.is_(True),
            Link.slug == slug.lower(),
        )
    ).scalar_one_or_none()

    if row is None or not row.is_active:
        raise HTTPException(status_code=404, detail="Link not found.")

    if row.expires_at is not None and row.expires_at <= utc_now():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This link has expired.",
        )

    if request.method == "HEAD":
        selection = select_keyword_without_increment(
            click_sequence=row.click_sequence,
            keywords=row.keywords,
        )
    else:
        try:
            selection = advance_and_select_keyword(
                db,
                link_id=row.id,
                keywords=row.keywords,
            )
            db.add(
                ClickEvent(
                    link_id=row.id,
                    clicked_at=utc_now(),
                    keyword_used=selection.keyword,
                    keyword_position=selection.keyword_index,
                    request_method="GET",
                    user_agent=request.headers.get("user-agent"),
                    referrer=request.headers.get("referer"),
                    ip_hash=hash_ip(
                        request.client.host if request.client else None,
                        settings.ip_hash_secret.get_secret_value(),
                    ),
                )
            )
            db.commit()
        except Exception:
            db.rollback()
            raise

    destination = build_amazon_url(
        asin=row.asin,
        country=row.target_country,
        keyword=selection.keyword,
        associate_tag=row.associate_tag,
    )
    return _redirect_response(destination)

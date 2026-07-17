from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.utils.datetime import utc_now

if TYPE_CHECKING:
    from app.models.click_event import ClickEvent
    from app.models.domain import Domain


class Link(Base):
    __tablename__ = "links"
    __table_args__ = (
        UniqueConstraint("domain_id", "slug", name="uq_links_domain_slug"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    domain_id: Mapped[int] = mapped_column(
        ForeignKey("domains.id", ondelete="CASCADE"), index=True, nullable=False
    )
    slug: Mapped[str] = mapped_column(String(80), nullable=False)
    asin: Mapped[str] = mapped_column(String(10), index=True, nullable=False)
    target_country: Mapped[str] = mapped_column(String(2), nullable=False)
    keywords: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    associate_tag: Mapped[str | None] = mapped_column(String(100), nullable=True)
    click_sequence: Mapped[int] = mapped_column(
        BigInteger, default=0, server_default="0", nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    domain: Mapped["Domain"] = relationship(back_populates="links")
    click_events: Mapped[list["ClickEvent"]] = relationship(
        back_populates="link",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

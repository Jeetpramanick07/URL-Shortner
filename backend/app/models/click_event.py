from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.utils.datetime import utc_now

if TYPE_CHECKING:
    from app.models.link import Link


class ClickEvent(Base):
    __tablename__ = "click_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    link_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("links.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    clicked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, index=True, nullable=False
    )
    keyword_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    keyword_position: Mapped[int] = mapped_column(Integer, nullable=False)
    request_method: Mapped[str] = mapped_column(String(10), nullable=False)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    classification: Mapped[str] = mapped_column(String(20), default="unknown", nullable=False)
    device_category: Mapped[str] = mapped_column(String(20), default="unknown", nullable=False)
    operating_system: Mapped[str] = mapped_column(String(50), default="unknown", nullable=False)
    browser: Mapped[str] = mapped_column(String(80), default="unknown", nullable=False)
    device_family: Mapped[str] = mapped_column(String(100), default="unknown", nullable=False)
    country: Mapped[str | None] = mapped_column(String(10), nullable=True)
    city: Mapped[str | None] = mapped_column(String(255), nullable=True)
    language: Mapped[str] = mapped_column(String(35), default="unknown", nullable=False)
    referrer_domain: Mapped[str] = mapped_column(String(255), default="direct", nullable=False)
    visitor_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_bot: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_prefetch: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_human: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    link: Mapped["Link"] = relationship(back_populates="click_events")

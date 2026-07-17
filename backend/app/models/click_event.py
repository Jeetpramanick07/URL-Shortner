from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text
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
    keyword_used: Mapped[str] = mapped_column(String(100), nullable=False)
    keyword_position: Mapped[int] = mapped_column(Integer, nullable=False)
    request_method: Mapped[str] = mapped_column(String(10), nullable=False)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    link: Mapped["Link"] = relationship(back_populates="click_events")

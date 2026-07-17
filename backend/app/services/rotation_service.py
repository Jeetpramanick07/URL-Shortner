from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models.link import Link


@dataclass(frozen=True, slots=True)
class RotationSelection:
    sequence_used: int
    keyword_index: int
    keyword: str


def advance_and_select_keyword(
    db: Session,
    *,
    link_id: UUID,
    keywords: list[str],
) -> RotationSelection:
    """Atomically advance the PostgreSQL counter and select the used keyword."""
    statement = (
        update(Link)
        .where(Link.id == link_id)
        .values(click_sequence=Link.click_sequence + 1)
        .returning(Link.click_sequence)
    )
    new_sequence = db.execute(statement).scalar_one()
    sequence_used = int(new_sequence) - 1
    keyword_index = sequence_used % len(keywords)
    return RotationSelection(
        sequence_used=sequence_used,
        keyword_index=keyword_index,
        keyword=keywords[keyword_index],
    )


def select_keyword_without_increment(
    *,
    click_sequence: int,
    keywords: list[str],
) -> RotationSelection:
    keyword_index = click_sequence % len(keywords)
    return RotationSelection(
        sequence_used=click_sequence,
        keyword_index=keyword_index,
        keyword=keywords[keyword_index],
    )

import re

from sqlalchemy import select

from app.config import settings
from app.database import SessionLocal
from app.models.domain import Domain
from app.utils.host import normalize_hostname


def make_display_name(hostname: str) -> str:
    if hostname == "localhost":
        return "Local Development"
    words = [word for word in re.split(r"[^a-zA-Z0-9]+", hostname) if word]
    return " ".join(word.capitalize() for word in words)


def seed_domains() -> None:
    db = SessionLocal()
    created = 0
    existing = 0
    try:
        for raw_hostname in settings.seed_domain_list:
            hostname = normalize_hostname(raw_hostname)
            found = db.scalar(select(Domain).where(Domain.hostname == hostname))
            if found:
                existing += 1
                continue
            db.add(
                Domain(
                    hostname=hostname,
                    display_name=make_display_name(hostname),
                    is_active=True,
                )
            )
            created += 1
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print(f"Domain seed complete: {created} created, {existing} already present.")


if __name__ == "__main__":
    seed_domains()

import hashlib
import hmac
from datetime import datetime, timezone

def daily_visitor_hash(ip_address: str | None, user_agent: str | None, secret: str) -> str | None:
    if not ip_address: return None
    date = datetime.now(timezone.utc).date().isoformat()
    normalized_ua = " ".join((user_agent or "").lower().split())
    return hmac.new(secret.encode(), f"{date}:{ip_address}:{normalized_ua}".encode(), hashlib.sha256).hexdigest()

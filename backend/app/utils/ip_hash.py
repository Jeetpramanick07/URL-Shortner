import hashlib
import hmac
from datetime import datetime, timezone


def hash_ip(ip_address: str | None, secret: str) -> str | None:
    """Return a daily rotating HMAC-SHA256 digest instead of storing a raw IP."""
    if not ip_address:
        return None

    utc_date = datetime.now(timezone.utc).date().isoformat()
    message = f"{utc_date}:{ip_address}".encode("utf-8")
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()

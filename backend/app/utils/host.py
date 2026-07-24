import ipaddress
import re
from urllib.parse import urlsplit

from fastapi import Request

from app.config import settings


_HOST_LABEL_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")


def _validate_hostname(hostname: str) -> None:
    if hostname == "localhost":
        return

    try:
        ipaddress.ip_address(hostname)
        return
    except ValueError:
        pass

    if len(hostname) > 253:
        raise ValueError("Hostname is too long.")

    labels = hostname.rstrip(".").split(".")
    if len(labels) < 2 or any(not _HOST_LABEL_RE.fullmatch(label) for label in labels):
        raise ValueError("Invalid hostname.")


def normalize_hostname(value: str) -> str:
    """Normalize an admin-supplied or request hostname and remove its port."""
    raw = value.strip()
    if not raw:
        raise ValueError("Hostname is required.")

    has_scheme = "://" in raw
    parsed = urlsplit(raw if has_scheme else f"//{raw}")

    if has_scheme and parsed.scheme.lower() not in {"http", "https"}:
        raise ValueError("Only http and https hostnames are supported.")

    if parsed.username or parsed.password:
        raise ValueError("Hostname must not include credentials.")

    if parsed.query or parsed.fragment:
        raise ValueError("Hostname must not include a query string or fragment.")

    if parsed.path not in {"", "/"}:
        raise ValueError("Hostname must not include a path.")

    hostname = parsed.hostname
    if hostname is None:
        raise ValueError("Invalid hostname.")

    normalized = hostname.lower().rstrip(".")
    _validate_hostname(normalized)
    return normalized


def get_request_hostname(request: Request) -> str:
    """Resolve a request host, optionally honoring proxy headers when enabled."""
    host_value: str | None = None

    if settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-host")
        if forwarded:
            host_value = forwarded.split(",", maxsplit=1)[0].strip()

    if not host_value:
        host_value = request.headers.get("host")

    if not host_value and request.url.hostname:
        host_value = request.url.hostname

    if not host_value:
        raise ValueError("Request hostname is missing.")

    return normalize_hostname(host_value)

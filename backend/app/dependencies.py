import secrets

from fastapi import Header, HTTPException, status

from app.config import settings


def require_admin_key(
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
) -> None:
    """Protect management endpoints with a constant-time API-key comparison."""
    expected = settings.admin_api_key.get_secret_value()
    if x_admin_key is None or not secrets.compare_digest(x_admin_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin API key.",
            headers={"WWW-Authenticate": "ApiKey"},
        )

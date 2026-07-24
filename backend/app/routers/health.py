from fastapi import APIRouter

from app.config import settings


router = APIRouter(tags=["Health"])


@router.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.app_env,
    }

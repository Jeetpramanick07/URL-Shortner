from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.database import engine
from app.routers import analytics, domains, health, links, redirect


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Validate database connectivity without creating or modifying schema."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise RuntimeError(
            "Database connection failed during startup. Check DATABASE_URL and PostgreSQL."
        ) from exc
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=(
        "Phase 1 backend for owned-domain Amazon smart links with atomic keyword "
        "rotation and direct HTTP redirects."
    ),
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Key"],
)

app.include_router(health.router)
app.include_router(domains.router)
app.include_router(links.router)
app.include_router(analytics.router)
# The catch-all redirect router must remain last.
app.include_router(redirect.router)

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

# Tests must target the dedicated PostgreSQL service before application imports.
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5433/amazon_shortener_test",
)
DEVELOPMENT_DATABASE_URL = os.getenv(
    "DEVELOPMENT_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/amazon_shortener",
)
if TEST_DATABASE_URL == DEVELOPMENT_DATABASE_URL:
    raise RuntimeError("Tests cannot use the development database URL.")

os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["TEST_DATABASE_URL"] = TEST_DATABASE_URL
os.environ.setdefault("APP_NAME", "Amazon Smart Link Shortener")
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DEBUG", "false")
os.environ.setdefault("ADMIN_API_KEY", "test-admin-secret")
os.environ.setdefault("PUBLIC_SCHEME", "http")
os.environ.setdefault("IP_HASH_SECRET", "test-ip-hash-secret-value")
os.environ.setdefault("SEED_DOMAINS", "localhost,go.example.com")
os.environ.setdefault("TRUST_PROXY_HEADERS", "false")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")

from app.database import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def ensure_test_database() -> Generator[None, None, None]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except OperationalError as exc:
        pytest.fail(
            "The PostgreSQL test database is unavailable. Start it with "
            "`docker compose up -d test-db` before running pytest.\n"
            f"Original error: {exc}"
        )
    yield


@pytest.fixture(autouse=True)
def reset_database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(app, follow_redirects=False) as test_client:
        yield test_client


@pytest.fixture
def admin_headers() -> dict[str, str]:
    return {"X-Admin-Key": "test-admin-secret"}


@pytest.fixture
def localhost_domain(client: TestClient, admin_headers: dict[str, str]) -> dict:
    response = client.post(
        "/api/domains",
        headers=admin_headers,
        json={"hostname": "localhost", "display_name": "Local Development"},
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def second_domain(client: TestClient, admin_headers: dict[str, str]) -> dict:
    response = client.post(
        "/api/domains",
        headers=admin_headers,
        json={"hostname": "go.example.com", "display_name": "Go Example"},
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def create_link(client: TestClient, admin_headers: dict[str, str]):
    def _create(domain_id: int, **overrides) -> dict:
        payload = {
            "domain_id": domain_id,
            "slug": "wireless-earbuds",
            "asin": "B0ABC12345",
            "target_country": "IN",
            "keywords": [
                "wireless earbuds",
                "bluetooth earbuds",
                "noise cancelling earbuds",
                "best earbuds",
                "earbuds for calls",
            ],
            "associate_tag": None,
            "expires_at": None,
        }
        payload.update(overrides)
        response = client.post("/api/links", headers=admin_headers, json=payload)
        assert response.status_code == 201, response.text
        return response.json()

    return _create

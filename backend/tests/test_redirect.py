from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlparse

from app.database import SessionLocal
from app.models.click_event import ClickEvent
from app.models.link import Link


def _location_query(response) -> tuple[str, dict[str, list[str]]]:
    location = response.headers["location"]
    parsed = urlparse(location)
    return location, parse_qs(parsed.query)


def test_redirect_uses_correct_marketplace_and_product_path(
    client, localhost_domain, create_link
):
    create_link(localhost_domain["id"])
    response = client.get("/wireless-earbuds", headers={"Host": "localhost"})
    assert response.status_code == 302
    location, query = _location_query(response)
    assert location.startswith("https://www.amazon.in/dp/B0ABC12345?")
    assert query["psc"] == ["1"]


def test_keyword_url_encoding(client, localhost_domain, create_link):
    create_link(localhost_domain["id"], keywords=["earbuds & calls"])
    response = client.get("/wireless-earbuds", headers={"Host": "localhost"})
    location, query = _location_query(response)
    assert "earbuds+%26+calls" in location
    assert query["keywords"] == ["earbuds & calls"]


def test_associate_tag_is_included(client, localhost_domain, create_link):
    create_link(localhost_domain["id"], associate_tag="sample-tag-21")
    response = client.get("/wireless-earbuds", headers={"Host": "localhost"})
    _, query = _location_query(response)
    assert query["tag"] == ["sample-tag-21"]


def test_keywords_rotate_cyclically(client, localhost_domain, create_link):
    keywords = ["one", "two", "three", "four", "five"]
    create_link(localhost_domain["id"], keywords=keywords)
    observed = []
    for _ in range(6):
        response = client.get("/wireless-earbuds", headers={"Host": "localhost"})
        _, query = _location_query(response)
        observed.append(query["keywords"][0])
    assert observed == ["one", "two", "three", "four", "five", "one"]


def test_get_requests_increase_click_count(
    client, admin_headers, localhost_domain, create_link
):
    link = create_link(localhost_domain["id"])
    client.get("/wireless-earbuds", headers={"Host": "localhost"})
    client.get("/wireless-earbuds", headers={"Host": "localhost"})
    response = client.get(f"/api/links/{link['id']}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["total_clicks"] == 2
    assert response.json()["click_sequence"] == 2


def test_head_does_not_change_counter_or_insert_human_event(
    client, admin_headers, localhost_domain, create_link
):
    link = create_link(localhost_domain["id"])
    response = client.head("/wireless-earbuds", headers={"Host": "localhost"})
    assert response.status_code == 302
    assert response.content == b""

    details = client.get(f"/api/links/{link['id']}", headers=admin_headers).json()
    assert details["click_sequence"] == 0
    assert details["total_clicks"] == 0

    with SessionLocal() as db:
        event = db.query(ClickEvent).one()
        assert event.classification == "head"
        assert event.is_human is False


def test_disabled_link_returns_404(
    client, admin_headers, localhost_domain, create_link
):
    link = create_link(localhost_domain["id"])
    disable = client.post(f"/api/links/{link['id']}/disable", headers=admin_headers)
    assert disable.status_code == 200
    response = client.get("/wireless-earbuds", headers={"Host": "localhost"})
    assert response.status_code == 404


def test_expired_link_returns_410(client, localhost_domain, create_link):
    expired = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
    create_link(localhost_domain["id"], expires_at=expired)
    response = client.get("/wireless-earbuds", headers={"Host": "localhost"})
    assert response.status_code == 410


def test_unknown_domain_returns_404(client, localhost_domain, create_link):
    create_link(localhost_domain["id"])
    response = client.get("/wireless-earbuds", headers={"Host": "unknown.example"})
    assert response.status_code == 404


def test_unknown_slug_returns_404(client, localhost_domain):
    response = client.get("/unknown-slug", headers={"Host": "localhost"})
    assert response.status_code == 404


def test_redirect_has_no_cache_headers(client, localhost_domain, create_link):
    create_link(localhost_domain["id"])
    response = client.get("/wireless-earbuds", headers={"Host": "localhost"})
    assert response.headers["cache-control"] == "no-store, private, max-age=0"
    assert response.headers["pragma"] == "no-cache"
    assert response.headers["expires"] == "0"
    assert response.headers["x-robots-tag"] == "noindex, nofollow"


def test_click_event_does_not_store_raw_ip(client, localhost_domain, create_link):
    create_link(localhost_domain["id"])
    client.get("/wireless-earbuds", headers={"Host": "localhost"})
    with SessionLocal() as db:
        event = db.query(ClickEvent).one()
        assert event.ip_hash is not None
        assert len(event.ip_hash) == 64
        assert event.ip_hash != "testclient"


def test_changing_keywords_resets_rotation_not_historical_clicks(
    client, admin_headers, localhost_domain, create_link
):
    link = create_link(localhost_domain["id"], keywords=["one", "two"])
    client.get("/wireless-earbuds", headers={"Host": "localhost"})
    patch = client.patch(
        f"/api/links/{link['id']}",
        headers=admin_headers,
        json={"keywords": ["new-one", "new-two"]},
    )
    assert patch.status_code == 200
    assert patch.json()["click_sequence"] == 0
    assert patch.json()["total_clicks"] == 1
    response = client.get("/wireless-earbuds", headers={"Host": "localhost"})
    _, query = _location_query(response)
    assert query["keywords"] == ["new-one"]

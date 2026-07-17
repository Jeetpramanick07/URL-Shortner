def test_management_endpoint_requires_admin_key(client):
    response = client.get("/api/domains")
    assert response.status_code == 401


def test_management_endpoint_rejects_wrong_admin_key(client):
    response = client.get("/api/domains", headers={"X-Admin-Key": "wrong-key"})
    assert response.status_code == 401


def test_management_endpoint_accepts_correct_admin_key(client, admin_headers):
    response = client.get("/api/domains", headers=admin_headers)
    assert response.status_code == 200


def test_valid_link_creation_normalizes_fields(
    client, admin_headers, localhost_domain
):
    response = client.post(
        "/api/links",
        headers=admin_headers,
        json={
            "domain_id": localhost_domain["id"],
            "slug": "Wireless-Earbuds",
            "asin": "b0abc12345",
            "target_country": "in",
            "keywords": [" wireless earbuds ", "bluetooth earbuds"],
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["slug"] == "wireless-earbuds"
    assert body["asin"] == "B0ABC12345"
    assert body["target_country"] == "IN"
    assert body["keywords"] == ["wireless earbuds", "bluetooth earbuds"]
    assert body["total_clicks"] == 0


def test_invalid_asin_returns_422(client, admin_headers, localhost_domain):
    response = client.post(
        "/api/links",
        headers=admin_headers,
        json={
            "domain_id": localhost_domain["id"],
            "slug": "valid-slug",
            "asin": "invalid",
            "target_country": "IN",
            "keywords": ["keyword"],
        },
    )
    assert response.status_code == 422


def test_unsupported_country_returns_422(client, admin_headers, localhost_domain):
    response = client.post(
        "/api/links",
        headers=admin_headers,
        json={
            "domain_id": localhost_domain["id"],
            "slug": "valid-slug",
            "asin": "B0ABC12345",
            "target_country": "ZZ",
            "keywords": ["keyword"],
        },
    )
    assert response.status_code == 422


def test_empty_keywords_return_422(client, admin_headers, localhost_domain):
    response = client.post(
        "/api/links",
        headers=admin_headers,
        json={
            "domain_id": localhost_domain["id"],
            "slug": "valid-slug",
            "asin": "B0ABC12345",
            "target_country": "IN",
            "keywords": ["  "],
        },
    )
    assert response.status_code == 422


def test_duplicate_keywords_return_422(client, admin_headers, localhost_domain):
    response = client.post(
        "/api/links",
        headers=admin_headers,
        json={
            "domain_id": localhost_domain["id"],
            "slug": "valid-slug",
            "asin": "B0ABC12345",
            "target_country": "IN",
            "keywords": ["Best Earbuds", "best earbuds"],
        },
    )
    assert response.status_code == 422


def test_invalid_slug_returns_422(client, admin_headers, localhost_domain):
    response = client.post(
        "/api/links",
        headers=admin_headers,
        json={
            "domain_id": localhost_domain["id"],
            "slug": "bad--slug",
            "asin": "B0ABC12345",
            "target_country": "IN",
            "keywords": ["keyword"],
        },
    )
    assert response.status_code == 422


def test_reserved_slug_returns_422(client, admin_headers, localhost_domain):
    response = client.post(
        "/api/links",
        headers=admin_headers,
        json={
            "domain_id": localhost_domain["id"],
            "slug": "docs",
            "asin": "B0ABC12345",
            "target_country": "IN",
            "keywords": ["keyword"],
        },
    )
    assert response.status_code == 422


def test_duplicate_domain_and_slug_returns_409(
    client, admin_headers, localhost_domain, create_link
):
    create_link(localhost_domain["id"])
    response = client.post(
        "/api/links",
        headers=admin_headers,
        json={
            "domain_id": localhost_domain["id"],
            "slug": "wireless-earbuds",
            "asin": "B0ABC99999",
            "target_country": "IN",
            "keywords": ["keyword"],
        },
    )
    assert response.status_code == 409


def test_same_slug_on_two_domains_is_allowed(
    localhost_domain, second_domain, create_link
):
    first = create_link(localhost_domain["id"])
    second = create_link(second_domain["id"])
    assert first["slug"] == second["slug"]
    assert first["domain"] != second["domain"]

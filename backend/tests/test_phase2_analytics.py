from app.database import SessionLocal
from app.models.click_event import ClickEvent

def test_non_human_requests_do_not_rotate_and_are_classified(client, localhost_domain, create_link):
    create_link(localhost_domain["id"], keywords=["one", "two"])
    for headers in ({"Host":"localhost", "User-Agent":"Googlebot/2.1"}, {"Host":"localhost", "User-Agent":"facebookexternalhit/1.1"}, {"Host":"localhost", "Purpose":"prefetch"}):
        assert client.get("/wireless-earbuds", headers=headers).status_code == 302
    response=client.get("/wireless-earbuds",headers={"Host":"localhost","User-Agent":"Mozilla/5.0 (Linux; Android 14) Chrome/126 Mobile Safari/537.36","Accept-Language":"en-IN,en;q=0.9","Referer":"https://www.google.com/search?q=x"})
    assert "keywords=one" in response.headers["location"]
    with SessionLocal() as db:
        human=db.query(ClickEvent).filter_by(is_human=True).one()
        assert human.device_category == "mobile" and human.language == "en-IN" and human.referrer_domain == "www.google.com" and human.visitor_hash

def test_summary_is_protected_and_counts_classes(client, admin_headers, localhost_domain, create_link):
    link=create_link(localhost_domain["id"])
    client.get("/wireless-earbuds",headers={"Host":"localhost"})
    client.get("/wireless-earbuds",headers={"Host":"localhost","User-Agent":"Googlebot/2.1"})
    assert client.get(f"/api/links/{link['id']}/analytics/summary").status_code == 401
    data=client.get(f"/api/links/{link['id']}/analytics/summary",headers=admin_headers).json()
    assert data["total_human_clicks"] == 1 and data["total_bot_requests"] == 1

# Amazon Smart Link Shortener — Phase 1 Backend

A FastAPI and PostgreSQL backend that creates branded Amazon smart links. Every counted `GET` request atomically rotates through the configured keyword list, records a click event, and immediately returns an HTTP `302` redirect to the exact Amazon `/dp/ASIN` product page. It never renders an intermediate page.

## Phase 1 features

- Multiple platform-owned domains resolved through the HTTP `Host` header
- Custom slugs
- ASIN and Amazon marketplace validation
- One to twenty cyclic keywords
- Optional Amazon Associates tag
- Optional link expiration
- Atomic PostgreSQL keyword rotation
- Basic click records with daily HMAC IP hashing
- Management API protected by `X-Admin-Key`
- `HEAD` support without counting or rotating
- Alembic migration, Docker Compose and PostgreSQL-backed Pytest suite

## Prerequisites

- Python 3.11 or newer
- Docker Desktop with Docker Compose
- Windows PowerShell

## Setup on Windows PowerShell

```powershell
cd backend

python -m venv venv
.\venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install -r requirements.txt

Copy-Item .env.example .env

docker compose up -d db test-db

docker compose ps

alembic upgrade head

python -m app.scripts.seed_domains

python -m uvicorn app.main:app --reload --port 8000
```

The application intentionally does **not** create tables at startup. Run `alembic upgrade head` before starting it.

## URLs

- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health: `http://127.0.0.1:8000/health`

## Create a domain

```powershell
curl.exe -X POST `
  "http://127.0.0.1:8000/api/domains" `
  -H "X-Admin-Key: change-this-secret" `
  -H "Content-Type: application/json" `
  -d '{"hostname":"localhost","display_name":"Local Development"}'
```

The seed command already creates domains listed in `SEED_DOMAINS`, so this request is only needed for additional domains.

## Create a short link

Replace `1` with the actual domain ID returned by `GET /api/domains`.

```powershell
curl.exe -X POST `
  "http://127.0.0.1:8000/api/links" `
  -H "X-Admin-Key: change-this-secret" `
  -H "Content-Type: application/json" `
  -d '{"domain_id":1,"slug":"wireless-earbuds","asin":"B0ABC12345","target_country":"IN","keywords":["wireless earbuds","bluetooth earbuds","noise cancelling earbuds","best earbuds","earbuds for calls"],"associate_tag":null,"expires_at":null}'
```

Example response short URL:

```text
http://localhost/wireless-earbuds
```

Because local Uvicorn runs on port 8000, open:

```text
http://localhost:8000/wireless-earbuds
```

## Inspect the redirect without following it

The `Host` header determines which domain and slug pair is resolved.

```powershell
curl.exe -I `
  -H "Host: localhost" `
  "http://127.0.0.1:8000/wireless-earbuds"
```

Expected key headers:

```text
HTTP/1.1 302 Found
location: https://www.amazon.in/dp/B0ABC12345?keywords=wireless+earbuds&psc=1
cache-control: no-store, private, max-age=0
x-robots-tag: noindex, nofollow
```

`curl -I` sends `HEAD`, so it does not count the click or advance the keyword. Use a normal browser request or this command to count a GET without following it:

```powershell
curl.exe -v `
  -H "Host: localhost" `
  "http://127.0.0.1:8000/wireless-earbuds" `
  -o NUL
```

## Test a custom local domain

1. Open Notepad as Administrator.
2. Edit:

```text
C:\Windows\System32\drivers\etc\hosts
```

3. Add:

```text
127.0.0.1 go.example.com
```

4. Ensure `go.example.com` exists in the `domains` table, then open:

```text
http://go.example.com:8000/wireless-earbuds
```

The stored hostname must be `go.example.com` without a scheme, path or port.

## Run tests

Start the dedicated test database first:

```powershell
docker compose up -d test-db
pytest -v
```

Tests refuse to use the development database. The default test database runs on port `5433`.

## Compile check

```powershell
python -m compileall app tests alembic
```

## Database migrations

Apply migrations:

```powershell
alembic upgrade head
```

Roll back the initial migration:

```powershell
alembic downgrade base
```

Create a future migration after changing models:

```powershell
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Management endpoints

All management endpoints require:

```http
X-Admin-Key: change-this-secret
```

Available endpoints:

```text
GET    /api/domains
POST   /api/domains
POST   /api/links
GET    /api/links
GET    /api/links/{link_id}
PATCH  /api/links/{link_id}
DELETE /api/links/{link_id}
POST   /api/links/{link_id}/enable
POST   /api/links/{link_id}/disable
```

Public endpoints:

```text
GET  /health
GET  /{slug}
HEAD /{slug}
```

## Production notes

- Change `ADMIN_API_KEY` and `IP_HASH_SECRET` before deployment.
- Set `PUBLIC_SCHEME=https`.
- Configure DNS and TLS for every owned link domain.
- Set `TRUST_PROXY_HEADERS=true` only behind a trusted reverse proxy that overwrites `X-Forwarded-Host`.
- Run Alembic migrations as a deployment step.
- The `keywords` query parameter is best-effort; the exact `/dp/ASIN` product page is the guaranteed destination generated by this service.

## Phase 2 analytics

Phase 2 records privacy-preserving device, operating system, browser, language and referrer dimensions. It classifies bots, social previews, prefetches and `HEAD` requests; only probable human `GET` requests consume a keyword. Daily visitor hashes are approximate and raw IP addresses are never exposed.

Protected endpoints include summary, timeline, device, operating-system, browser, keyword, referrer, language and recent-click reports at `/api/links/{link_id}/analytics/*`.

```powershell
.\venv\Scripts\python.exe -m alembic upgrade head
.\venv\Scripts\python.exe -m pytest -v
```

```powershell
curl.exe -s -o NUL -D - `
  -H "User-Agent: Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36" `
  -H "Accept-Language: en-IN,en;q=0.9" `
  "http://localhost:8000/test-product"

curl.exe -s -o NUL -D - -H "User-Agent: Googlebot/2.1" "http://localhost:8000/test-product"
curl.exe -s -o NUL -D - -H "User-Agent: facebookexternalhit/1.1" "http://localhost:8000/test-product"
curl.exe -H "X-Admin-Key: change-this-secret" "http://127.0.0.1:8000/api/links/LINK_UUID/analytics/summary"
```

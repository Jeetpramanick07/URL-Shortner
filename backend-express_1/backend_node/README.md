# Amazon Smart Link Shortener — Express.js Backend

This is a 1:1 migration of the original FastAPI backend to Node.js + Express.
**Every API endpoint, request body, response shape, status code, and error
message is preserved exactly** — the existing React frontend requires zero
changes.

## Stack

- Express.js (routing/middleware)
- Sequelize + `pg` (PostgreSQL access — connects to the **same** database
  schema the FastAPI backend used; no new tables, columns, or schema
  changes were introduced)
- `express-validator` (request body presence checks)
- `helmet`, `cors`, `morgan`, `dotenv`
- `ua-parser-js` (replaces Python's `user_agents` for device/OS/browser
  detection in click classification — same underlying UA-regex family)

## Project layout

```
backend/
├── server.js         # entrypoint: DB connectivity check + listen
├── app.js            # Express app assembly (middleware, CORS, routes)
├── config/           # env loading + validation (mirrors config.py)
├── routes/           # Express routers (mirrors app/routers/*.py)
├── controllers/       # request handlers (mirrors router function bodies)
├── services/          # business logic (mirrors app/services/*.py)
├── middleware/         # admin-key auth, error handler, UUID/body guards
├── models/             # Sequelize models (mirrors app/models/*.py)
├── database/           # Sequelize connection + database/migrations/001_init.sql
├── utils/               # datetime, hostname, IP hashing, visitor hashing
└── validators/          # field-level validation (mirrors app/schemas/*.py)
```

## Setup

```bash
npm install
cp .env.example .env   # fill in the same values your FastAPI .env had
npm run dev             # nodemon, auto-restart
# or
npm start                # production
```

The server listens on `PORT` (default `8000`), matching the original
`uvicorn --port 8000`.

### Database

This backend expects to connect to the **same PostgreSQL database** the
FastAPI backend already used — no migration is needed if that database
already exists (Alembic already created the schema; nothing here touches
it).

For a **brand-new** database, run the equivalent schema once:

```bash
psql "$DATABASE_URL" -f database/migrations/001_init.sql
```

`DATABASE_URL` keeps the exact same value/format you used before
(`postgresql+psycopg://user:pass@host:port/db`) — the `+psycopg` driver
suffix is stripped internally so the same env var works unmodified.

### Seeding domains

```bash
npm run seed
```

Equivalent of `python -m app.scripts.seed_domains`.

## What was intentionally preserved

- All 5 route groups: `/health`, `/api/domains`, `/api/links`,
  `/api/links/:id/analytics/*`, and the catch-all `/:slug` redirect
  (mounted last, same as the original router include order).
- The `X-Admin-Key` header auth, constant-time compared, same 401 message.
- Every validation rule and its exact error message (slug/ASIN/keyword/
  country rules, hostname normalization, date-range checks).
- The atomic `click_sequence` rotation via `UPDATE ... RETURNING`, run in
  the same DB transaction as the click-event insert.
- Privacy-preserving daily-rotating IP hash and visitor hash (HMAC-SHA256).
- The exact JSON response shape for every endpoint, including field names,
  nesting, and pagination metadata (`page`, `page_size`, `total`, `pages`).
- All error responses as `{ "detail": "<message>" }`, which is exactly what
  the frontend's `apiClient.js` already parses.

## What's different under the hood (and why it's safe)

- **UA parsing library**: `ua-parser-js` instead of Python's `user_agents`.
  Both are built on the same UA-regex family; device/OS/browser/bot
  detection was verified against real user agents (iPhone/Safari, desktop
  Chrome, Googlebot, facebookexternalhit) and matched expected output in
  every case tested.
- **BIGINT fields** (`click_sequence`, click-event `id`) are coerced to JS
  `Number` when serialized, since Sequelize returns BIGINT as a string by
  default. This is safe for the volumes this system handles and keeps the
  JSON output numeric, exactly like the original Pydantic models.

## Removed

Per the migration requirements, the original Python artifacts are not
present in this backend: no `requirements.txt`, no `alembic/`, no `.py`
files, no `__pycache__`. `database/migrations/001_init.sql` is the one
addition — a plain-SQL equivalent of the two Alembic migrations, provided
only for bootstrapping a brand-new database now that Alembic is gone.

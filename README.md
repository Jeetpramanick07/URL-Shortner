# LinkOrbit deployment

This repository contains two applications:

- `frontend`: React 19 and Vite
- `backend`: Python 3.13, FastAPI, SQLAlchemy, and PostgreSQL

There is no Node.js/Express backend in this repository. Deploy the two directories as separate Vercel projects connected to the same Git repository.

## 1. Provision PostgreSQL

Create a hosted PostgreSQL database that accepts connections from Vercel Functions. Prefer the provider's pooled connection string. Convert a `postgres://` or `postgresql://` URL to SQLAlchemy's psycopg form:

```text
postgresql+psycopg://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

From `backend`, install development dependencies, export the production variables, and apply the migrations:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
$env:DATABASE_URL = "postgresql+psycopg://USER:PASSWORD@HOST/DATABASE?sslmode=require"
$env:ADMIN_API_KEY = "a-temporary-valid-value"
$env:IP_HASH_SECRET = "a-temporary-value-at-least-16-characters"
$env:SEED_DOMAINS = "links.example.com"
python -m alembic upgrade head
```

## 2. Deploy the backend project

Import this Git repository in Vercel and configure:

- Root Directory: `backend`
- Framework Preset: FastAPI (automatic)
- Build Command: leave unset
- Output Directory: leave unset

Set these Vercel environment variables for Production (and Preview when needed):

```env
APP_NAME=Amazon Smart Link Shortener
APP_ENV=production
DEBUG=false
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/DATABASE?sslmode=require
ADMIN_API_KEY=<long-random-secret>
PUBLIC_SCHEME=https
IP_HASH_SECRET=<different-long-random-secret>
SEED_DOMAINS=links.example.com
TRUST_PROXY_HEADERS=true
CORS_ORIGINS=https://admin.example.com
```

Generate `ADMIN_API_KEY` and `IP_HASH_SECRET` independently. After the first backend deployment, attach every public short-link domain to this backend project, set the same production variables (including `SEED_DOMAINS`) in your trusted local or CI environment, then run:

```powershell
python -m app.scripts.seed_domains
```

Verify `https://YOUR-BACKEND-HOST/health` before continuing.

## 3. Deploy the frontend project

Import the same Git repository a second time and configure:

- Root Directory: `frontend`
- Framework Preset: Vite (automatic)
- Build Command: `npm run build` (automatic)
- Output Directory: `dist` (automatic)

Set one public build-time variable:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND-HOST
```

Do not create `VITE_ADMIN_API_KEY`; every `VITE_*` value is public in the compiled JavaScript. Open the deployed frontend's Settings page and enter the backend admin key there. It is stored in that browser's local storage.

Finally, update backend `CORS_ORIGINS` to the frontend's exact production origin and redeploy the backend. The existing frontend `vercel.json` sends React Router deep links to `index.html`.

## 4. Production checks

```text
GET  https://YOUR-BACKEND-HOST/health
GET  https://YOUR-BACKEND-HOST/api/domains  (with X-Admin-Key)
GET  https://YOUR-FRONTEND-HOST/settings
HEAD https://YOUR-SHORT-LINK-DOMAIN/example-slug
```

Preview frontend deployments need their own origins added to `CORS_ORIGINS`; production-only configuration does not automatically allow changing Vercel preview URLs.

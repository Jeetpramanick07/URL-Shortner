# LinkOrbit React Frontend

A responsive React.js conversion of the uploaded Google Stitch LinkOrbit glassmorphism screens.

## Included screens

- Dashboard overview
- Create smart Amazon link
- Edit smart link
- All links
- Individual link analytics
- Domains
- Activity
- Settings
- Responsive navigation and error state

The app includes a centralized FastAPI client and uses design-preview data only when the backend is unavailable.

## Setup

```powershell
cd D:\PROJECTS\URL\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Environment

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_ADMIN_API_KEY=change-this-secret
```

You can also change the API URL and admin key from the Settings screen. Those values are saved only in browser local storage.

## Backend requirements

Run the FastAPI backend on port 8000 and make sure CORS includes:

```text
http://localhost:5173
http://127.0.0.1:5173
```

## Build

```powershell
npm run build
npm run preview
```

## Notes

- Public shortened links continue to redirect through FastAPI; this frontend does not introduce an intermediate redirect page.
- Amazon controls the final product page and may show related or sponsored products.
- Keyword visibility in Amazon search is best effort.

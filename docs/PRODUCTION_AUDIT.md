# Production Readiness Audit — EduRise Academy

**Audited:** 2026-10-19 · **Repo:** MK7417-ceo/edurise-academy · **Commit:** 3ee7783
**Method:** fresh `git clone` from GitHub → clean venv + `npm install` → full verification.

## 1. Build — PASS

| Check | Result |
|---|---|
| Fresh `git clone` from GitHub | ✅ all files present (62 + render.yaml + icon.svg + tests) |
| Backend: fresh venv, `pip install -r backend/requirements.txt` | ✅ clean |
| Backend: `pytest backend/tests` | ✅ **11/11 pass** (health, chat intents, refusals, enquiry validation, admin login + flow, CSV export, auth enforcement) |
| Frontend: fresh `npm install` + `npm run build` | ✅ clean, 13 routes, `/icon.svg` served |
| E2E: `python qa/verify.py` (Playwright) | ✅ **12/12 pass**, 0 console errors, mobile 390px no overflow |
| DB bootstrap ("migrations") | ✅ `enquiries` table auto-created on first startup via lifespan `create_all` |

Fixed during this audit: deprecated FastAPI `@app.on_event("startup")` replaced with the
`lifespan` context manager; added the missing backend pytest suite.

## 2. Docker — CONFIG REVIEWED (no daemon in this environment)

- `backend/Dockerfile`: slim Python 3.12, layer-cached deps, `uvicorn` on 0.0.0.0:8000. ✅
- `frontend/Dockerfile`: multi-stage (node:24-alpine), build args for `NEXT_PUBLIC_*`, `npm start` runtime. ✅
- `docker-compose.yml`: backend healthcheck + `depends_on: service_healthy`, SQLite persisted
  via `./data` volume, server-component `BACKEND_URL` wired at runtime. ✅
- ⚠️ Not build-tested here (no Docker daemon) — verify with `docker compose up --build` on a
  machine with Docker before claiming it works.
- ⚠️ Backend container runs as root — add a non-root `USER` for production hardening.
- Note: `docker compose` needs a `.env` file (copy from `.env.example`); compose errors if missing.

## 3. API contracts — PASS

All 15 frontend call sites verified against backend route definitions — exact match:
`GET /api/v1/site`, `GET /api/v1/courses`, `GET /api/v1/courses/{slug}`,
`POST /api/v1/chat`, `GET /api/v1/chat/suggested`, `GET /api/v1/chat/status`,
`POST /api/v1/enquiries`, `POST /api/v1/admin/login`, `GET /api/v1/admin/stats`,
`GET /api/v1/admin/enquiries`, `PATCH /api/v1/admin/enquiries/{id}/status`,
`DELETE /api/v1/admin/enquiries/{id}`, `GET /api/v1/admin/enquiries/export.csv`,
`GET /api/v1/health`. OpenAPI docs at `/docs`.

## 4. Security — PASS with documented demo limitations

- ✅ No secrets in the repo (grep clean); only `.env.example` with placeholders.
- ✅ Pydantic request validation; SQLAlchemy ORM (no string SQL); generic 500 handler
  (no stack traces to clients); CORS restricted via `CORS_ORIGINS` env.
- ✅ Rate limits: chat 30/min, enquiries 10/hour per IP.
- ⚠️ **Demo auth:** admin login is mock (in-memory tokens, default `admin`/`edurise123`
  overridable via env). Tokens die on restart. Replace with real auth (JWT + hashed
  passwords in DB) before any real-world use.
- ⚠️ SQLite on ephemeral disk (Render free tier) — enquiry data resets on redeploy.
  Fine for a portfolio demo; use Postgres for anything real.

## 5. Deployment — READY, awaiting accounts

- `render.yaml` in repo → Render dashboard → New → Blueprint → one-click backend.
  Name the service `edurise-academy-api`.
- Frontend → Vercel (Next.js). **Must set env vars:** `NEXT_PUBLIC_API_URL` and
  `BACKEND_URL` = `https://edurise-academy-api.onrender.com` (frontend falls back to
  `http://localhost:8000` otherwise).
- Render free tier sleeps after 15 min idle — first request takes ~50s to wake.

## Verdict

**Portfolio-ready.** Fresh-setup verification is fully green (build, tests, E2E).
Remaining work is account-side only (Vercel connect + Render Blueprint), plus the
documented hardening items above if this ever serves real users.

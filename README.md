# EduRise Academy

**Learn Today. Lead Tomorrow.**

A professional, production-style website for a coaching institute — with an AI admission
chatbot, a student enquiry system, and an admin dashboard.

> **Demo content notice:** all institute details (courses, fees, faculty, contact info)
> are realistic *sample* data kept in one editable file: `data/knowledge-base.json`.
> Replace it with real details before any production use.

---

## 1. Project overview

EduRise Academy is a full-stack web application for a coaching institute:

- **Public website** — Home, About, Courses (6 programs with detail pages), Faculty,
  Results & Success Stories, Admission Process, Contact, Student Enquiry form.
- **AI Admission Assistant** — floating chatbot on every page + a full-page chat
  interface. Answers from the institute knowledge base; works in **demo (mock) mode**
  with no API key, or with any OpenAI-compatible API.
- **Enquiry system** — validated form → SQLite storage → enquiry ID → admin dashboard.
- **Admin dashboard** — stats, course-wise counts, search/filter, status workflow,
  delete, CSV export (mock auth for local demo).

## 2. Features

| Area | What's included |
|---|---|
| Website | 11 pages, responsive mobile-first design, SEO metadata + Open Graph, accessible forms |
| Courses | 6 programs, each with overview, syllabus modules, batch timings, faculty, outcomes, fee range, FAQs |
| Chatbot | Floating widget + `/chat` page, welcome message, suggested questions, typing indicator, timestamps, clear-chat, safe refusal for unknown info, no invented fees/dates/guarantees |
| Enquiries | Client + server validation (email, phone, min message length, consent), enquiry ID (`ER-2026-XXXXXX`), success confirmation |
| Admin | Login, total/new/converted stats, course-wise chart, search, status & course filters, detail view, status update (New → Contacted → Follow-up → Converted → Closed), delete, CSV export |
| Contact | Phone, email, address, office hours, WhatsApp button, map embed, contact form, social links |
| API | Health check, courses, site content, chat, enquiries, admin — with rate limiting and sanitized inputs |

## 3. Screenshots

| Page | Screenshot |
|---|---|
| Homepage | `docs/screenshots/home.png` |
| Courses | `docs/screenshots/courses.png` |
| AI chatbot widget | `docs/screenshots/chatbot.png` |
| Enquiry success | `docs/screenshots/enquiry-success.png` |
| Admin login | `docs/screenshots/admin-login.png` |
| Admin dashboard | `docs/screenshots/admin.png` |
| Homepage (mobile) | `docs/screenshots/home-mobile.png` |

## 4. Technology stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, lucide-react
- **Backend:** FastAPI, SQLAlchemy, SQLite (local dev), Pydantic validation
- **AI:** OpenAI-compatible chat completions API, with built-in mock/deterministic mode
- **Deployment:** Docker + docker-compose

## 5. Project structure

```
edurise-academy/
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── page.tsx          # Home
│   │   ├── about/            # About Us
│   │   ├── courses/          # Courses + [slug] detail pages
│   │   ├── faculty/          # Faculty
│   │   ├── results/          # Results / success stories
│   │   ├── admission/        # Admission process
│   │   ├── contact/          # Contact us
│   │   ├── enquire/          # Student enquiry form
│   │   ├── chat/             # Full-page AI chatbot
│   │   ├── admin/            # Admin login + dashboard
│   │   └── layout.tsx        # Navbar, footer, chat widget, SEO
│   ├── components/           # Navbar, Footer, ChatWidget, EnquiryForm, ui…
│   ├── lib/api.ts            # Typed backend client
│   └── Dockerfile
├── backend/                  # FastAPI app
│   ├── app/
│   │   ├── main.py           # App factory, CORS, error handling
│   │   ├── config.py         # Env-based settings (no hard-coded secrets)
│   │   ├── database.py       # SQLAlchemy + SQLite
│   │   ├── models/           # Enquiry model
│   │   ├── schemas/          # Pydantic validation
│   │   ├── routes/           # health, courses, chat, enquiries, admin
│   │   └── services/         # knowledge base, AI provider, rate limit, admin auth
│   ├── requirements.txt
│   └── Dockerfile
├── data/
│   ├── knowledge-base.json   # ★ EDITABLE: all site + chatbot content
│   └── edurise.db            # SQLite DB (created on first backend run)
├── .env.example
├── docker-compose.yml
└── README.md
```

## 6. Environment variables

Copy `.env.example` to `.env` and adjust. Key variables:

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_PATH` | `./data/edurise.db` | SQLite file |
| `CORS_ORIGINS` | `http://localhost:3000,…` | Allowed frontend origins |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `edurise123` | Demo admin login (change these!) |
| `OPENAI_API_KEY` | *(empty → mock mode)* | Enables real AI chatbot |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible endpoint |
| `OPENAI_MODEL` | `gpt-4o-mini` | Chat model |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Browser → API |
| `BACKEND_URL` | `http://localhost:8000` | Next.js server → API |

## 7. Installation steps

**Prerequisites:** Node.js 18+, Python 3.10+.

```bash
git clone <repo-url> edurise-academy
cd edurise-academy
cp .env.example .env          # then edit .env

# Backend
python -m venv backend-venv
./backend-venv/bin/pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install && cd ..
```

## 8. Local development commands

```bash
# Terminal 1 — backend (http://localhost:8000)
./backend-venv/bin/uvicorn backend.app.main:app --reload --port 8000

# Terminal 2 — frontend (http://localhost:3000)
cd frontend && npm run dev
```

Open **http://localhost:3000**. API docs: **http://localhost:8000/docs** (dev only).

## 9. Database setup

SQLite needs no setup — `data/edurise.db` is created automatically on backend startup
and tables are created via SQLAlchemy. To reset: stop the backend, delete
`data/edurise.db`, restart.

For PostgreSQL later: point SQLAlchemy at a Postgres URL and run the same models
(`Base.metadata.create_all`) or add Alembic migrations.

## 10. Chatbot setup

**Demo (mock) mode — default, no key needed:**
the assistant answers deterministically from `data/knowledge-base.json`. It refuses
safely when information isn't available and never invents fees or guarantees.

**AI mode:** set in `.env`:
```
OPENAI_API_KEY=sk-…
OPENAI_BASE_URL=https://api.openai.com/v1   # or any OpenAI-compatible endpoint
OPENAI_MODEL=gpt-4o-mini
```
The backend injects the knowledge base as context with strict "only use this info"
instructions; any provider failure falls back to mock mode automatically.
The header shows **AI mode** vs **Demo mode**.

## 11. Mock mode instructions

Just leave `OPENAI_API_KEY` empty. Try these in the chat widget:
- "What courses do you offer?"
- "What is the JEE course fee?"
- "Do you offer scholarships?"
- "Do you guarantee IIT selection?" → safe no-guarantee answer
- "What is the capital of France?" → safe refusal

## 12. Deployment instructions

```bash
cp .env.example .env   # set real ADMIN_PASSWORD, OPENAI_API_KEY, URLs
docker compose up --build
```

- Frontend: http://localhost:3000 · Backend: http://localhost:8000
- The `./data` volume persists the SQLite DB; edit `data/knowledge-base.json` to
  update content without rebuilding.
- For a VPS: put Caddy/Nginx in front for HTTPS, set `CORS_ORIGINS` and
  `NEXT_PUBLIC_*` to your domain, and use a strong `ADMIN_PASSWORD`.

## 13. Admin dashboard instructions

1. Go to **http://localhost:3000/admin** → redirected to `/admin/login`.
2. Sign in (default `admin` / `edurise123` — demo only, change in `.env`).
3. View stats, filter/search enquiries, open a row for details, update its status,
   delete it, or export everything as CSV.

## 14. Testing commands

```bash
# Backend smoke tests
curl http://localhost:8000/api/v1/health
curl -X POST http://localhost:8000/api/v1/chat \
  -H 'Content-Type: application/json' -d '{"message":"What is the JEE course fee?"}'
curl -X POST http://localhost:8000/api/v1/enquiries \
  -H 'Content-Type: application/json' -d '{...valid enquiry...}'

# Frontend
cd frontend && npm run build   # type-check + production build
```

**Manual checklist:** all pages load · mobile layout (DevTools) · course detail opens ·
chatbot answers known questions and refuses unknown ones · enquiry form shows errors
on empty submit and stores a valid enquiry · admin shows the enquiry, status update
works, CSV downloads · no API key in the browser bundle (check `.env` is git-ignored).

## 15. Known limitations

1. **Admin auth is a demo mock** (in-memory bearer tokens, default credentials). Replace
   with real JWT/OAuth before any shared deployment.
2. **SQLite** is for local dev; use PostgreSQL for production.
3. **No email/SMS notifications** on new enquiries yet — check the dashboard.
4. **Map** is a Google Maps embed (needs internet); swap for a static image if offline.
5. Docker images were authored but **not build-tested here** (no Docker daemon in this environment).
6. All institute content is **sample data** — replace `data/knowledge-base.json`.

## 16. Future improvements

- Real authentication (JWT + password hashing) and role-based admin access
- PostgreSQL + Alembic migrations
- Email/WhatsApp notifications for new enquiries and status changes
- Enquiry assignment to counsellors + follow-up reminders
- Fee payment integration (Razorpay/Stripe) with receipts
- Student portal: attendance, test scores, study material downloads
- RAG chatbot over uploaded brochures/PDFs with source citations
- Multi-language support (Hindi) for the chatbot and site

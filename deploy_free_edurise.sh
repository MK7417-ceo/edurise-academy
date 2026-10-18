#!/usr/bin/env bash
set -Eeuo pipefail

# EduRise Academy — free demo deployment helper.
#
# This script is intentionally safe:
# - validates the repository locally;
# - refuses to deploy with the default admin password in render.yaml;
# - creates a local, gitignored secrets file;
# - prints the exact Vercel/Render steps.
#
# It does not bypass provider login, push secrets, or pretend that free hosting
# is suitable for production data. Render Free has an ephemeral filesystem, so
# SQLite data can disappear after restart/spin-down/redeploy.
#
# Run from the repository root:
#   bash deploy_free_edurise.sh
#
# Optional:
#   bash deploy_free_edurise.sh --skip-tests

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKIP_TESTS=0
SECRETS_FILE="$ROOT/.deploy-secrets.env"

for arg in "$@"; do
  case "$arg" in
    --skip-tests) SKIP_TESTS=1 ;;
    --help|-h)
      sed -n '1,28p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

cd "$ROOT"

fail() { echo "ERROR: $*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

[[ -f README.md ]] || fail "Run this script from the edurise-academy repository root."
[[ -d frontend ]] || fail "frontend/ directory not found."
[[ -d backend ]] || fail "backend/ directory not found."
[[ -f render.yaml ]] || fail "render.yaml not found."

info "Checking for unsafe default Render credentials"
if grep -qE '^\s*value:\s*edurise123\s*$' render.yaml; then
  cat >&2 <<'EOF'
render.yaml still contains the demo password `edurise123`.
Before deploying, remove the value and set ADMIN_PASSWORD manually in Render.
Do not commit a real password to GitHub.
EOF
  exit 1
fi

info "Checking for tracked secrets and .env files"
if git ls-files | grep -E '(^|/)(\.env|\.env\..*)$' | grep -vE '(^|/)\.env\.example$'; then
  fail "A tracked .env file exists. Remove credentials before deploying."
fi
if git grep -nI -E '(GROQ_API_KEY|OPENAI_API_KEY)[[:space:]]*=[[:space:]]*['\''"]?sk-[A-Za-z0-9_-]{20,}|password[[:space:]]*[:=][[:space:]]*['\''"][^'\''"]{4,}['\''"]' -- \
  ':!*.md' ':!*.lock' ':!package-lock.json' ':!backend/tests/**' 2>/dev/null; then
  fail "A likely secret/default credential was found. Review it before deployment."
fi

info "Checking Git working tree"
git diff --check
git status --short

if [[ "$SKIP_TESTS" -eq 0 ]]; then
  info "Running backend tests"
  python3 -m venv "$ROOT/.deploy-venv"
  "$ROOT/.deploy-venv/bin/pip" install -q -r backend/requirements.txt
  "$ROOT/.deploy-venv/bin/pytest" -q backend/tests

  info "Running frontend clean install and production build"
  (cd frontend && npm ci && npm run build)
else
  echo "Tests skipped because --skip-tests was supplied."
fi

info "Preparing local deployment secrets"
if [[ ! -f "$SECRETS_FILE" ]]; then
  ADMIN_PASSWORD="$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(24))
PY
)"
  cat > "$SECRETS_FILE" <<EOF
# Local deployment notes. Never commit or upload this file.
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$ADMIN_PASSWORD
CORS_ORIGINS=https://YOUR-VERCEL-PROJECT.vercel.app
DATABASE_PATH=./data/edurise.db
KNOWLEDGE_BASE_PATH=./data/knowledge-base.json
# Leave AI key empty for free demo/mock mode:
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
BACKEND_URL=https://YOUR-RENDER-SERVICE.onrender.com
EOF
  chmod 600 "$SECRETS_FILE"
  echo "Created $SECRETS_FILE with a generated admin password."
else
  echo "Using existing local secrets file: $SECRETS_FILE"
fi

grep -qxF '.deploy-secrets.env' .gitignore 2>/dev/null || printf '\n.deploy-secrets.env\n.deploy-venv/\n' >> .gitignore

echo
cat <<'EOF'
============================================================
FREE DEPLOYMENT STEPS — NO PAID PLAN REQUIRED FOR A DEMO
============================================================

A) RENDER BACKEND

1. Open https://render.com and sign in with GitHub.
2. New -> Blueprint -> select MK7417-ceo/edurise-academy.
3. Before clicking deploy, set these environment variables in Render:

   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = [copy only from local .deploy-secrets.env]
   CORS_ORIGINS = https://YOUR-VERCEL-PROJECT.vercel.app
   DATABASE_PATH = ./data/edurise.db
   KNOWLEDGE_BASE_PATH = ./data/knowledge-base.json
   OPENAI_API_KEY =                # keep empty for free mock chatbot
   OPENAI_BASE_URL = https://api.openai.com/v1
   OPENAI_MODEL = gpt-4o-mini

4. Deploy the web service using the Free instance.
5. Copy the Render URL, for example:
   https://edurise-academy-api.onrender.com
6. Verify:
   https://edurise-academy-api.onrender.com/api/v1/health

B) VERCEL FRONTEND

1. Open https://vercel.com and sign in with GitHub.
2. Add New -> Project -> import MK7417-ceo/edurise-academy.
3. Set Root Directory to: frontend
4. Add this environment variable:

   NEXT_PUBLIC_API_URL = https://edurise-academy-api.onrender.com

5. Deploy.
6. Copy the Vercel URL and update Render's CORS_ORIGINS with that exact URL.
7. Redeploy/restart Render after changing CORS_ORIGINS.

C) LIVE SMOKE TEST

- Open the Vercel URL.
- Submit one enquiry.
- Open /admin/login.
- Use the generated ADMIN_PASSWORD from the local file.
- Confirm the enquiry appears.
- Test status update.
- Test CSV export.
- Test chatbot mock mode.
- Test mobile view.
- Open browser console and confirm no errors.
- Wait 15+ minutes, then revisit once to observe Render cold-start behavior.

IMPORTANT FREE-HOSTING LIMITATIONS

- Vercel Hobby is free for personal/non-commercial use and has usage caps.
- Render Free services sleep after inactivity and take time to wake up.
- Render Free has an ephemeral filesystem; local SQLite data can disappear after
  restart, spin-down, or redeploy.
- Do not use this setup for real student/customer records.
- Do not use real institute data until persistent database, backups, real admin
  authentication, and privacy controls are implemented.
- Keep OPENAI_API_KEY empty to avoid AI provider charges. Mock chatbot mode works.

============================================================
EOF

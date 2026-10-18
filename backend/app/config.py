"""Application configuration. All secrets come from environment variables.

Copy `.env.example` to `.env` and fill in real values. Nothing secret is
hard-coded here; demo defaults are clearly marked and safe for local use.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

# backend/app/config.py -> backend/ -> project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env")


def _get(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


class Settings:
    PROJECT_NAME = "EduRise Academy API"
    API_V1 = "/api/v1"

    # SQLite for local dev. Set DATABASE_PATH to change location.
    DATABASE_PATH = _get("DATABASE_PATH", str(PROJECT_ROOT / "data" / "edurise.db"))
    KNOWLEDGE_BASE_PATH = _get(
        "KNOWLEDGE_BASE_PATH", str(PROJECT_ROOT / "data" / "knowledge-base.json")
    )

    # CORS: comma-separated list of allowed frontend origins.
    CORS_ORIGINS = [
        o.strip()
        for o in _get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        if o.strip()
    ]

    # --- Admin (mock authentication for local demo) ---
    # DEMO DEFAULTS — change these in .env before any shared/public deployment.
    ADMIN_USERNAME = _get("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = _get("ADMIN_PASSWORD", "edurise123")
    ADMIN_TOKEN_TTL_SECONDS = int(_get("ADMIN_TOKEN_TTL_SECONDS", "43200"))  # 12h

    # --- AI provider (OpenAI-compatible). If unset -> mock chatbot mode. ---
    OPENAI_API_KEY = _get("OPENAI_API_KEY", "")
    OPENAI_BASE_URL = _get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    OPENAI_MODEL = _get("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_TIMEOUT_SECONDS = int(_get("OPENAI_TIMEOUT_SECONDS", "20"))

    @property
    def ai_enabled(self) -> bool:
        return bool(self.OPENAI_API_KEY)


settings = Settings()

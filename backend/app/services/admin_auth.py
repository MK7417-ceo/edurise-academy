"""Mock admin authentication for the local demo.

Login with the demo credentials (defaults: admin / edurise123, configurable
via ADMIN_USERNAME / ADMIN_PASSWORD) returns a random bearer token kept in
server memory with a 12-hour TTL. This is NOT production authentication —
documented in the README. For production, replace with a real identity
provider / JWT flow.
"""
import secrets
import time

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..config import settings

_sessions: dict[str, float] = {}
_bearer = HTTPBearer(auto_error=False)


def create_session() -> tuple[str, int]:
    token = secrets.token_urlsafe(32)
    _sessions[token] = time.time() + settings.ADMIN_TOKEN_TTL_SECONDS
    return token, settings.ADMIN_TOKEN_TTL_SECONDS


def verify_credentials(username: str, password: str) -> bool:
    return secrets.compare_digest(username, settings.ADMIN_USERNAME) and secrets.compare_digest(
        password, settings.ADMIN_PASSWORD
    )


async def require_admin(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
) -> None:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Admin login required.")
    expiry = _sessions.get(creds.credentials)
    if not expiry or expiry < time.time():
        _sessions.pop(creds.credentials, None)
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

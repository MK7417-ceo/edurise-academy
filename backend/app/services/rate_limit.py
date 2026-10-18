"""Simple in-memory sliding-window rate limiter (per client IP + endpoint)."""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

_windows: dict[str, deque] = defaultdict(deque)


def rate_limit(max_calls: int, period_seconds: int):
    async def _checker(request: Request):
        key = f"{request.client.host if request.client else 'unknown'}:{request.url.path}"
        now = time.monotonic()
        window = _windows[key]
        while window and window[0] <= now - period_seconds:
            window.popleft()
        if len(window) >= max_calls:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please wait a moment and try again.",
                headers={"Retry-After": str(period_seconds)},
            )
        window.append(now)

    return _checker

"""EduRise Academy API — FastAPI backend."""
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import Base, engine
from .routes import admin, chat, courses, enquiries, health
from .services.knowledge import load_kb

log = logging.getLogger("edurise")


def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception):
        # Never expose server internals to clients.
        log.exception("Unhandled error on %s", request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Something went wrong. Please try again later."},
        )

    prefix = settings.API_V1
    app.include_router(health.router, prefix=prefix)
    app.include_router(courses.router, prefix=prefix)
    app.include_router(chat.router, prefix=prefix)
    app.include_router(enquiries.router, prefix=prefix)
    app.include_router(admin.router, prefix=prefix)

    @app.on_event("startup")
    def _startup():
        Base.metadata.create_all(bind=engine)
        kb = load_kb()  # fail fast if the knowledge base is broken
        mode = "ai" if settings.ai_enabled else "mock"
        log.info(
            "EduRise API ready — %d courses, chatbot mode=%s",
            len(kb["courses"]), mode,
        )

    return app


app = create_app()

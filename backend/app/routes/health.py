from fastapi import APIRouter

from ..services.ai_provider import provider_status

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {
        "status": "ok",
        "service": "EduRise Academy API",
        "chatbot": provider_status(),
    }

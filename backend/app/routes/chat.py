from fastapi import APIRouter, Depends

from ..schemas import ChatRequest, ChatResponse
from ..services.ai_provider import get_reply, provider_status
from ..services.knowledge import load_kb
from ..services.rate_limit import rate_limit

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse,
             dependencies=[Depends(rate_limit(max_calls=30, period_seconds=60))])
async def chat(payload: ChatRequest):
    reply, source = await get_reply(payload.message)
    kb = load_kb()
    return ChatResponse(
        reply=reply,
        source=source,
        suggestions=kb["chatbot"]["suggested_questions"][:4],
    )


@router.get("/chat/suggested")
def suggested_questions():
    return {"questions": load_kb()["chatbot"]["suggested_questions"]}


@router.get("/chat/status")
def chat_status():
    kb = load_kb()
    return {
        **provider_status(),
        "name": kb["chatbot"]["name"],
        "welcome": kb["chatbot"]["welcome"],
    }

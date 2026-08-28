from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from app.services.chat_engine import chat_engine
from app.api.auth import get_current_user_optional
from app.db.models import User

router = APIRouter()

class ChatMessageRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    context: Optional[Dict[str, Any]] = None

class ChatMessageResponse(BaseModel):
    response: str
    action_type: Optional[str] = None
    suggested_prompts: Optional[List[str]] = []

@router.post("/chat/message", response_model=ChatMessageResponse)
async def send_chat_message(
    payload: ChatMessageRequest = Body(...),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Process developer queries with active dataset context.
    Provides immediate software engineering failure diagnostics, refactoring patterns,
    and CI/CD quality gate recommendations.
    """
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    result = chat_engine.process_message(
        message=payload.message,
        history=payload.history,
        context=payload.context
    )
    return result

import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.conversation import Conversation, Message
from app.api.deps import get_current_user

router = APIRouter()

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    architecture_spec: Optional[str] = None
    model_url: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    last_message_preview: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[ConversationResponse])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(desc(Conversation.updated_at))
    )
    result = await db.execute(query)
    conversations = result.scalars().all()
    
    responses = []
    for conv in conversations:
        # Fetch preview of first prompt
        msg_query = (
            select(Message)
            .where(Message.conversation_id == conv.id, Message.role == "user")
            .order_by(Message.created_at)
            .limit(1)
        )
        msg_result = await db.execute(msg_query)
        first_msg = msg_result.scalar_one_or_none()
        preview = (first_msg.content[:60] + "...") if first_msg else conv.title
        
        responses.append(
            ConversationResponse(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                last_message_preview=preview,
            )
        )
    return responses

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify ownership
    conv_query = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    )
    conv_result = await db.execute(conv_query)
    conv = conv_result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg_query = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    msg_result = await db.execute(msg_query)
    return msg_result.scalars().all()
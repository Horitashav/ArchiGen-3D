from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    role = Column(String(10), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    architecture_spec = Column(Text, nullable=True)  # JSON string
    model_url = Column(String(500), nullable=True)
    status = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
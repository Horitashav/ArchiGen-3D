import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.schemas.generation import TaskStatus

class GenerationTask(Base):
    """
    Persisted record of an architectural generation job.
    """
    __tablename__ = "generation_tasks"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default=TaskStatus.PENDING.value, nullable=False
    )
    architecture_spec: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    refined_3d_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
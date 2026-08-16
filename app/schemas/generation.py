from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from enum import Enum
from datetime import datetime

class TaskStatus(str, Enum):
    """
    Lifecycle states for an asynchronous 3D generation pipeline.
    """
    PENDING = "pending"
    PARSING = "parsing"
    GENERATING_3D = "generating_3d"
    COMPLETED = "completed"
    FAILED = "failed"

class GenerationRequest(BaseModel):
    """
    Payload sent by the client to initiate generation.
    """
    prompt: str = Field(
        ...,
        min_length=10,
        max_length=1500,
        description="Natural language description of the architectural structure.",
        examples=["A 2-story minimalist villa made of timber and glass with a cantilevered balcony and infinity pool."]
    )

class GenerationResponse(BaseModel):
    """
    Immediate acknowledgement returned when a generation task is accepted.
    """
    task_id: str = Field(..., description="Unique UUID tracking this job")
    status: TaskStatus = Field(..., description="Current operational status")
    message: str = Field(..., description="User-friendly status message")

class TaskResult(BaseModel):
    """
    Detailed status object returned during polling.
    """
    task_id: str
    status: TaskStatus
    architecture_spec: Optional[Dict[str, Any]] = None
    refined_3d_prompt: Optional[str] = None
    model_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
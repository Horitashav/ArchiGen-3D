from enum import Enum
from typing import List, Optional, Any, Union
from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    PENDING = "pending"
    PARSING = "parsing"
    GENERATING_2D = "generating_2d"
    GENERATING_3D = "generating_3d"
    COMPLETED = "completed"
    FAILED = "failed"


class RoomSpec(BaseModel):
    name: str = Field(..., description="Name/purpose of the room (e.g. Master Bedroom, Open Office)")
    floor_level: int = Field(default=1, description="Floor index where this room is located")
    dimensions_approx: str = Field(..., description="Approximate dimensions (e.g. 5m x 4m)")


class ArchitectureSpec(BaseModel):
    building_type: str = Field(..., description="Classification (e.g. Villa, Office Tower, Pavilion)")
    architectural_style: str = Field(..., description="Style (e.g. Modernist, Brutalist, Japandi)")
    total_floors: int = Field(default=1, ge=1, le=100, description="Total number of floors")
    materials: List[str] = Field(default_factory=list, description="Primary construction materials")
    key_features: List[str] = Field(default_factory=list, description="Notable design characteristics")
    color_palette: List[str] = Field(default_factory=list, description="Hex codes or color names")
    rooms: Optional[List[RoomSpec]] = Field(default=None, description="Detailed room breakdown")
    refined_3d_prompt: str = Field(..., description="Optimized prompt synthesized for 3D generation")

    class Config:
        from_attributes = True


class GenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Natural language building description")
    conversation_id: Optional[str] = Field(default=None, description="Optional parent conversation ID")


class GenerationResponse(BaseModel):
    task_id: str
    status: str
    message: str
    conversation_id: Optional[str] = None


class TaskResult(BaseModel):
    task_id: str
    status: str
    architecture_spec: Optional[Union[str, ArchitectureSpec, dict]] = None
    model_url: Optional[str] = None
    preview_url: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
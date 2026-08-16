from pydantic import BaseModel, Field
from typing import List, Optional

class RoomSpec(BaseModel):
    """
    Represents an individual room or spatial section within the architectural plan.
    """
    name: str = Field(
        ...,
        description="Name of the area, e.g., Master Bedroom, Courtyard, Living Room, Rooftop Terrace"
    )
    floor_level: int = Field(
        default=1,
        ge=0,
        description="Floor level where this area is located (0 for ground floor / basement, 1+ for upper levels)"
    )
    dimensions_approx: str = Field(
        ...,
        description="Approximate dimensions or size category, e.g., '5m x 6m', 'Spacious', 'Compact'"
    )

class ArchitectureSpec(BaseModel):
    """
    The structured blueprint extracted from user natural language.
    This schema is directly bound to the LLM structured output engine.
    """
    building_type: str = Field(
        ...,
        description="Building category: Residential, Office, Commercial, Villa, Pavilion, Skyscraper"
    )
    architectural_style: str = Field(
        ...,
        description="Design style: Modernist, Brutalist, Minimalist, Industrial, Art Deco, Biophilic, Scandinavian"
    )
    total_floors: int = Field(
        default=1,
        ge=1,
        le=100,
        description="Total number of stories or vertical levels"
    )
    materials: List[str] = Field(
        ...,
        min_length=1,
        description="Primary construction and facade materials, e.g., ['Glass', 'Reinforced Concrete', 'Cedar Wood']"
    )
    key_features: List[str] = Field(
        ...,
        min_length=1,
        description="Distinct architectural features, e.g., ['Cantilevered Balcony', 'Floor-to-ceiling windows', 'Atrium']"
    )
    color_palette: List[str] = Field(
        ...,
        min_length=1,
        description="Dominant exterior and interior colors, e.g., ['Charcoal Gray', 'Natural Oak', 'Pure White']"
    )
    rooms: Optional[List[RoomSpec]] = Field(
        default=None,
        description="Breakdown of key rooms or zones inside the structure"
    )
    refined_3d_prompt: str = Field(
        ...,
        max_length=600,
        description=(
            "An optimized prompt engineered specifically for a text-to-3D diffusion model. "
            "Must describe the exterior form, lighting, materials, architectural style, and clean geometry "
            "without conversational filler. Maximum 600 characters."
        )
    )
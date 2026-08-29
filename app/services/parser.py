import json
from groq import AsyncGroq
from app.config import settings
from app.schemas.architecture import ArchitectureSpec

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are an expert architectural AI assistant.
Analyze the user's natural language building request and output a structured JSON object strictly matching this schema:
{
  "building_type": "string (e.g. Modern Villa, Tea House, Office)",
  "architectural_style": "string (e.g. Traditional Japanese, Brutalist, Minimalist)",
  "total_floors": 1 to 10 (integer),
  "materials": ["material 1", "material 2"],
  "key_features": ["feature 1", "feature 2"],
  "color_palette": ["#hex1", "#hex2" or color names],
  "rooms": [
    {"name": "Room Name", "floor_level": 1, "dimensions_approx": "5m x 4m"}
  ],
  "refined_3d_prompt": "Concise visual prompt for procedural 3D modeling"
}

Respond ONLY with valid JSON. No conversational wrapper or markdown backticks.
"""

async def parse_architecture_prompt(prompt: str) -> ArchitectureSpec:
    model_name = settings.GROQ_MODEL_NAME or "openai/gpt-oss-20b"

    response = await client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = response.choices[0].message.content
    data = json.loads(content)
    return ArchitectureSpec.model_validate(data)
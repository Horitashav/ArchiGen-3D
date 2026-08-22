import instructor
from openai import AsyncOpenAI
from app.config import settings
from app.schemas.architecture import ArchitectureSpec
from app.core.exceptions import LLMParsingError

# Configure AsyncOpenAI client pointing to Groq's endpoint
groq_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.GROQ_API_KEY,
)

# Patch with instructor using JSON mode
client = instructor.from_openai(groq_client, mode=instructor.Mode.JSON)

SYSTEM_PROMPT = """You are an expert architectural designer, urban planner, and 3D modeling specialist.
Your task is to analyze natural language building descriptions and transform them into a strict architectural specification blueprint.

Key Directives:
1. Identify the primary building type, architectural style, and spatial features.
2. If the user input is ambiguous or incomplete, infer realistic architectural defaults based on the chosen design style.
3. Generate a concise, highly descriptive `refined_3d_prompt` tailored for a text-to-3D diffusion model.
   - Describe exterior geometry, massing, facade materials, lighting, and ambient setting.
   - Use clean architectural keywords (e.g., 'photorealistic', 'archviz', 'octane render', 'clear geometry').
   - Keep the `refined_3d_prompt` strictly under 600 characters without conversational filler.
"""

async def parse_architecture_prompt(user_text: str) -> ArchitectureSpec:
    """
    Extracts an ArchitectureSpec blueprint from raw user text using Instructor + Groq.
    """
    try:
        spec = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            response_model=ArchitectureSpec,
            max_retries=3,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_text}
            ],
            temperature=0.2,
        )
        return spec
    except Exception as exc:
        raise LLMParsingError(f"LLM extraction failed: {str(exc)}")
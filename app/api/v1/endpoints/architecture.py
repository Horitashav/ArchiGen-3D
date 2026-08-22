import uuid
from fastapi import APIRouter
from app.schemas.generation import GenerationRequest, GenerationResponse, TaskStatus
from app.schemas.architecture import ArchitectureSpec
from app.services.parser import parse_architecture_prompt
from app.services.generator_3d import generator_client

router = APIRouter()

@router.post("/parse-only", response_model=ArchitectureSpec)
async def parse_only(request: GenerationRequest):
    """
    Direct inspection: extracts structured architectural blueprint via LLM.
    """
    spec = await parse_architecture_prompt(request.prompt)
    return spec

@router.post("/generate", response_model=GenerationResponse)
async def generate_architecture(request: GenerationRequest):
    """
    Full Text-to-3D pipeline:
    1. Extracts validated ArchitectureSpec via LLM.
    2. Procedurally synthesizes a real .glb 3D architectural mesh.
    3. Saves asset to static/models/ for instant web rendering.
    """
    task_id = str(uuid.uuid4())

    # Step 1: Prompt -> Structured Blueprint (LLM)
    spec = await parse_architecture_prompt(request.prompt)

    # Step 2: Spec -> Procedural 3D Asset (.glb)
    local_asset_path = await generator_client.generate_from_spec(spec, task_id)

    return GenerationResponse(
        task_id=task_id,
        status=TaskStatus.COMPLETED,
        message=f"3D architectural model synthesized successfully: {local_asset_path}"
    )
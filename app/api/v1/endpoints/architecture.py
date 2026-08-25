import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.generation_task import GenerationTask
from app.schemas.generation import (
    GenerationRequest,
    GenerationResponse,
    TaskResult,
    TaskStatus,
)
from app.schemas.architecture import ArchitectureSpec
from app.services.parser import parse_architecture_prompt
from app.services.generator_3d import generator_client

router = APIRouter()

@router.post("/parse-only", response_model=ArchitectureSpec)
async def parse_only(request: GenerationRequest):
    """
    Direct inspection endpoint: extracts structured blueprint via LLM without generating 3D.
    """
    spec = await parse_architecture_prompt(request.prompt)
    return spec

@router.post("/generate", response_model=TaskResult)
async def generate_architecture(
    request: GenerationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    End-to-end generation endpoint with persistent SQLite state tracking:
    1. Records initial PENDING task in DB.
    2. LLM extracts structured architectural blueprint.
    3. Procedural 3D engine compiles .glb asset.
    4. Commits final COMPLETED state with asset URL.
    """
    task_id = str(uuid.uuid4())
    
    # 1. Create DB task record
    db_task = GenerationTask(
        id=task_id,
        prompt=request.prompt,
        status=TaskStatus.PARSING.value,
    )
    db.add(db_task)
    await db.flush()

    try:
        # 2. Extract structured blueprint
        spec = await parse_architecture_prompt(request.prompt)
        db_task.architecture_spec = spec.model_dump()
        db_task.refined_3d_prompt = spec.refined_3d_prompt
        db_task.status = TaskStatus.GENERATING_3D.value
        await db.flush()

        # 3. Generate 3D asset
        model_url = await generator_client.generate_from_spec(spec, task_id)
        
        # 4. Mark completed
        db_task.model_url = model_url
        db_task.status = TaskStatus.COMPLETED.value
        db_task.completed_at = datetime.utcnow()
        await db.flush()

    except Exception as exc:
        db_task.status = TaskStatus.FAILED.value
        db_task.error_message = str(exc)
        db_task.completed_at = datetime.utcnow()
        await db.flush()
        raise

    return TaskResult(
        task_id=db_task.id,
        status=TaskStatus(db_task.status),
        architecture_spec=db_task.architecture_spec,
        refined_3d_prompt=db_task.refined_3d_prompt,
        model_url=db_task.model_url,
        created_at=db_task.created_at,
        completed_at=db_task.completed_at,
        error_message=db_task.error_message,
    )

@router.get("/tasks/{task_id}", response_model=TaskResult)
async def get_task_by_id(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the status, parsed blueprint, and model URL for any past task ID.
    """
    result = await db.execute(select(GenerationTask).where(GenerationTask.id == task_id))
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found."
        )

    return TaskResult(
        task_id=task.id,
        status=TaskStatus(task.status),
        architecture_spec=task.architecture_spec,
        refined_3d_prompt=task.refined_3d_prompt,
        model_url=task.model_url,
        created_at=task.created_at,
        completed_at=task.completed_at,
        error_message=task.error_message,
    )

@router.get("/tasks", response_model=List[TaskResult])
async def list_recent_tasks(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the most recent generation tasks.
    """
    result = await db.execute(
        select(GenerationTask).order_by(GenerationTask.created_at.desc()).limit(limit)
    )
    tasks = result.scalars().all()

    return [
        TaskResult(
            task_id=task.id,
            status=TaskStatus(task.status),
            architecture_spec=task.architecture_spec,
            refined_3d_prompt=task.refined_3d_prompt,
            model_url=task.model_url,
            created_at=task.created_at,
            completed_at=task.completed_at,
            error_message=task.error_message,
        )
        for task in tasks
    ]
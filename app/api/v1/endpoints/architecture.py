import asyncio
import json
import uuid
from typing import Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.geometry import mesh_generator
from app.db.session import get_db, async_session
from app.db.models.generation_task import GenerationTask
from app.db.models.user import User
from app.db.models.conversation import Conversation, Message
from app.schemas.architecture import (
    GenerationRequest,
    GenerationResponse,
    TaskResult,
    TaskStatus,
    ArchitectureSpec,
)
from app.services.generator_3d import generator_client
from app.api.deps import get_current_user_optional

router = APIRouter()


def _status_to_progress(status: str) -> int:
    return {
        "pending": 10,
        "parsing": 30,
        "generating_2d": 55,
        "generating_3d": 80,
        "completed": 100,
        "failed": 0,
    }.get(status, 0)


@router.post("/generate", response_model=GenerationResponse)
async def generate_architecture(
    request: GenerationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    task_id = str(uuid.uuid4())
    conv_id = request.conversation_id

    # If no conversation exists and user is authenticated, create one
    if not conv_id and current_user:
        conv_id = str(uuid.uuid4())
        title = request.prompt[:30] + ("..." if len(request.prompt) > 30 else "")
        new_conv = Conversation(
            id=conv_id,
            user_id=current_user.id,
            title=title,
        )
        db.add(new_conv)
        await db.commit()

    # Create the GenerationTask record
    new_task = GenerationTask(
        task_id=task_id,
        user_prompt=request.prompt,
        status="pending",
        user_id=current_user.id if current_user else None,
    )
    db.add(new_task)
    await db.commit()

    # Record User Message in conversation if active
    if conv_id and current_user:
        user_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conv_id,
            role="user",
            content=request.prompt,
        )
        db.add(user_msg)
        await db.commit()

    # Run mock/real pipeline simulation as background task
    background_tasks.add_task(
        _execute_generation_pipeline,
        task_id=task_id,
        prompt=request.prompt,
        conversation_id=conv_id,
    )

    return GenerationResponse(
        task_id=task_id,
        status="pending",
        message="3D architectural generation initiated.",
        conversation_id=conv_id,
    )


@router.get("/tasks/{task_id}", response_model=TaskResult)
async def get_task_status(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GenerationTask).where(GenerationTask.task_id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskResult(
        task_id=task.task_id,
        status=task.status,
        architecture_spec=task.architecture_spec,
        model_url=task.model_url,
        preview_url=task.preview_url,
        created_at=str(task.created_at),
        completed_at=str(task.completed_at) if task.completed_at else None,
        error_message=task.error_message,
    )


@router.get("/tasks/{task_id}/stream")
async def stream_task_status(
    task_id: str,
    request: Request,
    current_user=Depends(get_current_user_optional),
):
    async def event_generator():
        yield "retry: 3000\n\n"
        previous_status = None

        while True:
            if await request.is_disconnected():
                break

            async with async_session() as db:
                result = await db.execute(
                    select(GenerationTask).where(GenerationTask.task_id == task_id)
                )
                task = result.scalar_one_or_none()

            if task is None:
                yield f"data: {json.dumps({'error': 'Task not found'})}\n\n"
                break

            current_status = task.status

            if current_status != previous_status:
                event_data = {
                    "task_id": task.task_id,
                    "status": current_status,
                    "architecture_spec": task.architecture_spec,
                    "model_url": task.model_url,
                    "error_message": task.error_message,
                    "progress": _status_to_progress(current_status),
                }
                yield f"data: {json.dumps(event_data)}\n\n"
                previous_status = current_status

            if current_status in ("completed", "failed"):
                yield "data: [DONE]\n\n"
                break

            await asyncio.sleep(1)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


async def _execute_generation_pipeline(task_id: str, prompt: str, conversation_id: Optional[str]):
    """
    Real pipeline:
    1. Parses prompt into ArchitectureSpec via Groq LLM.
    2. Builds 3D model geometry using trimesh driven by the parsed specification.
    3. Saves results to database and updates status.
    """
    async with async_session() as db:
        result = await db.execute(
            select(GenerationTask).where(GenerationTask.task_id == task_id)
        )
        task = result.scalar_one_or_none()
        if not task:
            return

        try:
            # ── Stage 1: LLM Parsing ──
            task.status = "parsing"
            await db.commit()

            from app.services.parser import parse_architecture_prompt
            spec = await parse_architecture_prompt(prompt)

            task.architecture_spec = spec.model_dump_json()
            task.status = "generating_3d"
            await db.commit()

            # ── Stage 2: Spec-Driven 3D Model Generation ──
            from app.services.generator_3d import generator_client
            model_path = await generator_client.generate_from_spec(spec, task_id)

            task.model_url = model_path
            task.status = "completed"

            # ── Stage 3: Save Assistant Message in Conversation ──
            if conversation_id:
                assistant_msg = Message(
                    id=str(uuid.uuid4()),
                    conversation_id=conversation_id,
                    role="assistant",
                    content="Here is your generated 3D architectural model:",
                    architecture_spec=task.architecture_spec,
                    model_url=task.model_url,
                    status="completed",
                )
                db.add(assistant_msg)

            await db.commit()

        except Exception as exc:
            task.status = "failed"
            task.error_message = str(exc)
            await db.commit()
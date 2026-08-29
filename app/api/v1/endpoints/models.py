from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.generation_task import GenerationTask
from app.api.deps import get_current_user_optional
from app.services.exporter import exporter
from app.schemas.architecture import ArchitectureSpec

router = APIRouter()

@router.get("/tasks/{task_id}/export/{format}")
async def export_model(
    task_id: str,
    format: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    if format not in ("obj", "stl", "pdf"):
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}. Use obj, stl, or pdf.")

    result = await db.execute(
        select(GenerationTask).where(GenerationTask.task_id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task or task.status != "completed":
        raise HTTPException(status_code=404, detail="Completed task not found")

    glb_path = Path(f"static/models/{task_id}.glb")
    if not glb_path.exists():
        raise HTTPException(status_code=404, detail="Model file not found on disk")

    if format == "obj":
        output_path = await exporter.convert_to_obj(str(glb_path), task_id)
    elif format == "stl":
        output_path = await exporter.convert_to_stl(str(glb_path), task_id)
    elif format == "pdf":
        spec_data = (
            ArchitectureSpec.model_validate_json(task.architecture_spec)
            if isinstance(task.architecture_spec, str)
            else ArchitectureSpec.model_validate(task.architecture_spec)
        )
        output_path = await exporter.generate_pdf(
            task_id=task_id,
            spec=spec_data,
            user_prompt=task.user_prompt,
        )

    file_path = Path(output_path.lstrip("/"))
    if not file_path.exists():
        raise HTTPException(status_code=500, detail="Export failed")

    media_types = {
        "obj": "application/octet-stream",
        "stl": "application/octet-stream",
        "pdf": "application/pdf",
    }

    return FileResponse(
        path=str(file_path),
        media_type=media_types[format],
        filename=f"architecture_{task_id[:8]}.{format}",
    )
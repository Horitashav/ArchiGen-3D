import httpx
from pathlib import Path
from app.core.exceptions import AssetStorageError

STATIC_DIR = Path("static/models")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

async def download_and_store_model(remote_url: str, task_id: str) -> str:
    """
    Downloads .glb model binary from remote URL and saves it under static/models/.
    Returns the web-accessible static asset URL.
    """
    filename = f"{task_id}.glb"
    local_path = STATIC_DIR / filename

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(remote_url, timeout=90.0)
            response.raise_for_status()

            with open(local_path, "wb") as f:
                f.write(response.content)

        return f"/static/models/{filename}"
    except Exception as exc:
        raise AssetStorageError(f"Failed to persist 3D model asset: {str(exc)}")
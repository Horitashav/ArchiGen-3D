from fastapi import APIRouter
from app.api.v1.endpoints import health, architecture

api_router = APIRouter()

# Register routes
api_router.include_router(health.router, tags=["System"])
api_router.include_router(architecture.router, prefix="/architecture", tags=["Architecture"])
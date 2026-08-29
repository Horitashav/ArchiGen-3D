from fastapi import APIRouter
from app.api.v1.endpoints import health, architecture, auth, conversations, models

api_router = APIRouter()

api_router.include_router(health.router, tags=["System"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(architecture.router, prefix="/architecture", tags=["Architecture"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
api_router.include_router(models.router, prefix="/models", tags=["Model Export"])
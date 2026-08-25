from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.api.v1.router import api_router
from app.core.exceptions import AppException, app_exception_handler
from app.db.session import engine
from app.db.base import Base
import app.db.models.generation_task  # Register models with Base.metadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events for the application.
    """
    # Startup: create SQLite database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: dispose of database engine pool
    await engine.dispose()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register custom global exception handler
    app.add_exception_handler(AppException, app_exception_handler)

    # Mount API routes
    app.include_router(api_router, prefix="/api/v1")

    # Ensure static directory exists and mount it
    static_path = Path("static")
    static_path.mkdir(exist_ok=True)
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

    return app

app = create_app()
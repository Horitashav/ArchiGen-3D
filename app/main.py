from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.config import settings
from app.api.v1.router import api_router
from app.core.exceptions import AppException, app_exception_handler

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(AppException, app_exception_handler)
    app.include_router(api_router, prefix="/api/v1")

    # Mount static assets directory
    static_path = Path("static")
    static_path.mkdir(exist_ok=True)
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

    return app

app = create_app()
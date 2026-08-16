from fastapi import Request
from fastapi.responses import JSONResponse

class AppException(Exception):
    """Base class for all custom domain exceptions."""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class LLMParsingError(AppException):
    """Raised when the LLM structured extraction fails or violates schema contracts."""
    def __init__(self, message: str = "Failed to parse architectural specifications from prompt."):
        super().__init__(message=message, status_code=422)

class GenerationError(AppException):
    """Raised when an upstream 3D generation engine fails or times out."""
    def __init__(self, message: str = "3D model generation service failed."):
        super().__init__(message=message, status_code=502)

class AssetStorageError(AppException):
    """Raised when downloading or persisting local model assets fails."""
    def __init__(self, message: str = "Failed to store generated 3D asset locally."):
        super().__init__(message=message, status_code=500)

async def app_exception_handler(request: Request, exc: AppException):
    """
    Global FastAPI exception handler that catches custom domain exceptions
    and returns standardized JSON errors.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error_type": type(exc).__name__,
            "message": exc.message
        }
    )
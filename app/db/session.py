from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

# Create async engine for SQLite / PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

# Async session factory
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Alias for compatibility across endpoints
AsyncSessionLocal = async_session

# FastAPI Dependency for injecting DB sessions into endpoints
async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
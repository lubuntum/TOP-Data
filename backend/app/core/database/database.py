from collections.abc import AsyncGenerator
from app.config import get_settings
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine
)
from sqlalchemy.orm import DeclarativeBase

settings = get_settings()


def _create_engine():
    if settings.DATABASE_URL.startswith("sqlite"):
        return create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)
    return create_async_engine(
        settings.DATABASE_URL, echo=settings.DEBUG, pool_pre_ping=True
    )


engine = _create_engine()

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.commit()
            raise
        finally:
            await session.close()

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database.database import Base, engine

from app.config import get_settings
from app.features.auth.router import router as auth_router
from app.features.tests.router import router as tests_router

settings = get_settings()
"""
    for dev: create tables automatically
    for prod: change to Alembic (validate and check for migrations)
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(
    auth_router,
    prefix="/api/v1"
)
app.include_router(
    tests_router,
    prefix="/api/v1"
)
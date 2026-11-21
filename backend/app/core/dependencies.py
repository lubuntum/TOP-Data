from typing import Annotated

from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.database import get_db
from app.core.database.entities.admin_entity import AdminEntity
from app.core.database.entities.user_entity import UserEntity
from app.core.security import decode_token

from sqlalchemy import select


async def get_current_user(
        db: Annotated[AsyncSession, Depends(get_db)],
        access_token: Annotated[str | None, Cookie()] = None
) -> UserEntity:
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Can't check account data"
    )
    if not access_token:
        raise credential_exception
    payload = decode_token(access_token)
    if not payload or payload.get("role") != "user":
        raise credential_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credential_exception
    user = await db.scalar(select(UserEntity).where(UserEntity.id == int(user_id)))
    if user is None or not user.is_active:
        raise credential_exception
    return user


async def get_current_admin(
        db: Annotated[AsyncSession, Depends(get_db)],
        access_token: Annotated[str | None, Cookie()] = None
) -> AdminEntity:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authorize")
    payload = decode_token(access_token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. No Admin role")
    admin_id = payload.get("sub")
    admin = await db.scalar(select(AdminEntity).where(AdminEntity.id == int(admin_id)))
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

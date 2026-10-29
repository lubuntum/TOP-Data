from typing import Annotated

from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.database import get_db
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
    if not payload:
        raise credential_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credential_exception
    user = await db.scalar(select(UserEntity).where(UserEntity.id == int(user_id)))
    if user is None or not user.is_active:
        raise credential_exception
    return user

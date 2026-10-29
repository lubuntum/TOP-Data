from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_token
from app.core.database.entities.user_entity import UserEntity
from app.features.auth import service
from app.features.auth.dto import (
    RegisterRequestDTO, RegisterResponseDTO,
    LoginRequestDTO, LoginResponseDTO, UserProfileDTO
)
from app.config import get_settings
settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=RegisterResponseDTO, status_code=status.HTTP_201_CREATED)
async def register(
        data: RegisterRequestDTO,
        db: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        user, plain_password = await service.register_user(db, data)
        await db.commit()
        return RegisterResponseDTO(
            login=user.login,
            password=plain_password,
            message="Please save password"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/login", response_model=LoginResponseDTO)
async def login(
        data: LoginRequestDTO,
        response: Response,
        db: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        user = await service.authenticate_user(db, data)
        token = create_token({"sub": str(user.id)})

        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True, #Protection from XSS
            secure=settings.COOKIE_SECURE,
            samesite="lax", #Protection from CSRF
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        return LoginResponseDTO(user_id=user.id, child_full_name=user.child_full_name)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me", response_model=UserProfileDTO)
async def get_me(
        current_user: Annotated[UserEntity, Depends(get_current_user)]):
    return current_user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "logout successful"}
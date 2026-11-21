from typing import Annotated, Optional

from fastapi import APIRouter, status, Depends, HTTPException
from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.database import get_db
from app.core.dependencies import get_current_admin
from app.core.security import create_token
from app.features.admin import service
from app.features.admin.dto import AdminLoginRequestDTO, AdminLoginResponseDTO, ExportUserDTO

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/login", response_model=AdminLoginResponseDTO, status_code=status.HTTP_200_OK)
async def login(
        data: AdminLoginRequestDTO,
        response: Response,
        db: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        admin = await service.authenticate_admin(db, data.login, data.password)
        token = create_token({"sub": str(admin.id), "role": "admin"})
        response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax")

        return AdminLoginResponseDTO(login=admin.login)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/export-users")
async def export_users(
        admin: Annotated[object, Depends(get_current_admin)],
        db: Annotated[AsyncSession, Depends(get_db)],
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        city: Optional[str] = None,
        school: Optional[str] = None,
        class_num: Optional[str] = None
):
    return await service.get_filtered_users(
        db, date_from, date_to, city, school, class_num
    )

from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.core.database.database import get_db
from app.core.database.entities.user_entity import UserEntity
from app.core.dependencies import get_current_user
from app.features.tests import service
from app.features.tests.dto import TestSubmitResponseDTO, TestSubmitRequestDTO

router = APIRouter(prefix="/tests", tags=["Tests"])
@router.get("/{test_code}/description")
async def get_test(test_code: str,
                   current_user: Annotated[UserEntity, Depends(get_current_user)]):
    try:
        return service.get_test_description(test_code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
@router.get("/{test_code}/questions")
async def get_test_questions(test_code: str,
                             current_user: Annotated[UserEntity, Depends(get_current_user)]):
    try:
        return service.get_test_questions(test_code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
@router.get("/{test_code}/additional/{filename}")
async def get_test_additional(test_code: str,
                              filename: str,
                              current_user: Annotated[UserEntity, Depends(get_current_user)]):
    """get extras for tests like /tests/holland/additional/types"""
    try:
        return service.get_test_additional_data(test_code, filename)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
@router.get("/my-results")
async def get_my_results(
        current_user: Annotated[UserEntity, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)]
):
    return await service.get_user_results(db, current_user.id)
@router.post("/submit", response_model=TestSubmitResponseDTO, status_code=status.HTTP_201_CREATED)
async def submit_test(
        data: TestSubmitRequestDTO,
        current_user: Annotated[UserEntity, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)]
):
    try:
        result = await service.save_test_result(db, current_user.id, data)
        await db.commit()
        return TestSubmitResponseDTO(result_id = result.id,
                                     test_code=result.test_code,
                                     computed_scores=result.computed_scores)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
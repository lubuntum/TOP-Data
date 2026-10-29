import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.entities.test_result_entity import TestResultEntity
from app.features.tests import scoring
from app.features.tests.dto import TestSubmitRequestDTO

DATA_DIR = Path(__file__).parent.parent.parent / "data"  # ??


def get_test_description(test_code: str) -> dict:
    file_path = DATA_DIR / test_code / "description.json"
    if not file_path.exists():
        raise ValueError(f"Описание теста '{test_code}' не найдено")
    with open(file_path, "r", encoding="UTF-8") as f:
        return json.load(f)


def get_test_questions(test_code: str) -> dict:
    """Read test questions via questions.json"""
    file_path = DATA_DIR / test_code / "questions.json"
    if not file_path.exists():
        raise ValueError(f"questions for test {test_code} not found")
    with open(file_path, "r", encoding="UTF-8") as f:
        return json.load(f)


def get_test_additional_data(test_code: str, filename: str) -> list | dict:
    file_path = DATA_DIR / test_code / f"{filename}.json"
    if not file_path.exists():
        raise ValueError(f"File '{filename}' for the test '{test_code}' not found")
    with open(file_path, 'r', encoding="utf-8") as f:
        return json.load(f)


async def save_test_result(db: AsyncSession, user_id: int, data: TestSubmitRequestDTO) -> TestResultEntity:
    questions_data = get_test_questions(data.test_code)
    computed_scores = scoring.calculate_results(
        test_code=data.test_code,
        answers=data.answers,
        questions_data=questions_data
    )
    result = TestResultEntity(
        user_id=user_id,
        test_code=data.test_code,
        raw_answers=data.answers,
        computed_scores=computed_scores  # now is empty
    )
    db.add(result)
    await db.flush()
    return result


async def get_user_results(db: AsyncSession, user_id: int) -> list[dict]:
    stmt = select(TestResultEntity).where(TestResultEntity.user_id == user_id).order_by(
        TestResultEntity.created_at.desc())
    results = (await db.scalar(stmt)).all()
    return [
        {
            "result_id": r.id,
            "test_code": r.test_code,
            "computed_scores": r.computed_scores,
            "created_at": r.created_at
        } for r in results
    ]

from typing import Any

from pydantic import BaseModel, Field


class TestSubmitRequestDTO(BaseModel):
    test_code: str = Field(..., description="Код теста: klimov, holland, interests, yovaishi")
    answers: dict[str, Any] | list[Any] = Field(...,
                                                description="Словарь ответов: { '1': 1, '2': 2, '3': 1 }. Ключ - ID вопроса, Значение - ID выбранной опции.")
    model_config = {
        "json_schema_extra": {
            "example": {
                "test_code": "holland",
                "answers": {"1": 2, "2": 1, "3": 2}
            }
        }
    }


class TestSubmitResponseDTO(BaseModel):
    message: str = "Results are saved"
    result_id: int
    test_code: str
    computed_scores: dict

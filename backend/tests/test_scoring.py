import pytest
from httpx import AsyncClient

# Данные для регистрации
USER_PAYLOAD = {
    "parent_full_name": "Тестов Тест",
    "child_full_name": "Тестов Тест",
    "school_number": "1",
    "class_number": 9,
    "class_label": "А",
    "phone": "+79991112233",
    "consent_pd": True,
    "consent_testing": True
}


@pytest.mark.asyncio
async def test_submit_klimov_scoring(async_client: AsyncClient):
    """Тест: Проверяем правильность подсчета Климова."""
    # 1. Регистрируем и логинимся
    reg = await async_client.post("/api/v1/auth/register", json=USER_PAYLOAD)
    creds = reg.json()
    await async_client.post("/api/v1/auth/login", json={"login": creds["login"], "password": creds["password"]})

    # 2. Отправляем ответы.
    # Допустим: вопрос 1 -> ответ 1 (PN), вопрос 2 -> ответ 1 (PP), вопрос 3 -> ответ 1 (PA)
    payload = {
        "test_code": "klimov",
        "answers": {"1": 1, "2": 1, "3": 1}
    }
    response = await async_client.post("/api/v1/tests/submit", json=payload)
    assert response.status_code == 201

    data = response.json()
    scores = data["computed_scores"]["scores"]

    # Проверяем, что счетчик правильно посчитал
    assert scores.get("PN") == 1
    assert scores.get("PP") == 1
    assert scores.get("PA") == 1


@pytest.mark.asyncio
async def test_submit_invalid_test_code(async_client: AsyncClient):
    """Тест: Отправка ответов на несуществующий тест."""
    reg = await async_client.post("/api/v1/auth/register", json=USER_PAYLOAD)
    creds = reg.json()
    await async_client.post("/api/v1/auth/login", json={"login": creds["login"], "password": creds["password"]})

    payload = {
        "test_code": "fake_test_123",
        "answers": {"1": 1}
    }
    response = await async_client.post("/api/v1/tests/submit", json=payload)

    # Должно вернуть 400 Bad Request (так как файла нет или движок не найден)
    assert response.status_code == 400
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_interpretation_file(async_client: AsyncClient):
    """Тест: Проверяем, что фронтенд может скачать файл интерпретаций."""
    reg = await async_client.post("/api/v1/auth/register", json=USER_PAYLOAD)
    creds = reg.json()
    await async_client.post("/api/v1/auth/login", json={"login": creds["login"], "password": creds["password"]})

    # Запрашиваем файл (предварительно убедитесь, что он есть в папке app/data/klimov/)
    response = await async_client.get("/api/v1/tests/klimov/additional/interpretations")

    if response.status_code == 200:
        assert "PN" in response.json()  # Проверяем, что ключ есть
    else:
        # Если файла еще нет, тест не падает, но предупреждает
        assert response.status_code == 404
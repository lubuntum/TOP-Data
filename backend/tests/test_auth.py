import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.entities.user_entity import UserEntity

# Валидные данные для теста
VALID_PAYLOAD = {
    "parent_full_name": "Тестов Тест Тестович",
    "child_full_name": "Тестов Тест",
    "school_number": "1",
    "class_number": 5,
    "class_label": "Б",
    "phone": "+79990001122",
    "consent_pd": True,
    "consent_testing": True
}


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient):
    """Тест: Успешная регистрация возвращает логин и пароль."""
    response = await async_client.post("/api/v1/auth/register", json=VALID_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert "login" in data
    assert "password" in data
    assert data["message"] == "Please save password"


@pytest.mark.asyncio
async def test_register_duplicate_phone(async_client: AsyncClient):
    """Тест: Попытка зарегистрировать дважды один и тот же телефон."""
    # Первая регистрация
    await async_client.post("/api/v1/auth/register", json=VALID_PAYLOAD)
    # Вторая регистрация с тем же телефоном
    response = await async_client.post("/api/v1/auth/register", json=VALID_PAYLOAD)

    assert response.status_code == 400
    assert "User already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_invalid_consent(async_client: AsyncClient):
    """Тест: Регистрация без согласия должна падать с 422."""
    invalid_payload = VALID_PAYLOAD.copy()
    invalid_payload["consent_pd"] = False

    response = await async_client.post("/api/v1/auth/register", json=invalid_payload)
    assert response.status_code == 422  # Ошибка валидации Pydantic


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient):
    """Тест: Успешный вход и получение профиля."""
    # Сначала регистрируем
    reg_resp = await async_client.post("/api/v1/auth/register", json=VALID_PAYLOAD)
    credentials = reg_resp.json()

    # Логинимся
    login_resp = await async_client.post("/api/v1/auth/login", json={
        "login": credentials["login"],
        "password": credentials["password"]
    })

    assert login_resp.status_code == 200
    assert login_resp.json()["child_full_name"] == VALID_PAYLOAD["child_full_name"]

    # Проверяем, что установилась httpOnly кука
    assert "access_token" in async_client.cookies

    # Делаем запрос к защищенному эндпоинту с этой кукой
    me_resp = await async_client.get("/api/v1/auth/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["login"] == credentials["login"]


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient):
    """Тест: Вход с неверным паролем."""
    await async_client.post("/api/v1/auth/register", json=VALID_PAYLOAD)

    response = await async_client.post("/api/v1/auth/login", json={
        "login": "nonexistent",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Wrong login or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_protected_route_without_token(async_client: AsyncClient):
    """Тест: Доступ к защищенному эндпоинту без токена."""
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401
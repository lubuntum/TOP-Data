import secrets
import string

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.entities.user_entity import UserEntity
from app.core.security import hash_password
from app.features.auth.dto import RegisterRequestDTO, LoginRequestDTO

from datetime import datetime, timedelta, timezone

def generate_credentials(child_name: str) -> tuple[str, str]:
    """Generate login based on child's name and password"""
    # Trying to get first 3 chars from name (in lower registry), and remove other
    base_login = "".join(filter(str.isalpha, child_name.split()[0])).lower()[:3]
    if len(base_login) < 3:
        base_login = "user"
    # Get random 4 digits for login's suffix
    random_suffix = "".join(secrets.choice(string.digits) for _ in range(5))
    login = f"{base_login}_{random_suffix}"

    password = secrets.token_urlsafe(6)
    return login, password

async def register_user(db: AsyncSession, data: RegisterRequestDTO) -> tuple[UserEntity, str]:
    # 1. Check if phone is unique
    stmt =select(UserEntity).where(UserEntity.phone == data.phone)
    existing_user = await db.scalar(stmt)
    if existing_user:
        raise ValueError("User already exists")
    # 2. Generate password and login in cycle for make sure it's unique
    for _ in range(5):
        login, plain_password = generate_credentials(data.child_full_name)
        # check if login is free
        login_check = await db.scalar(select(UserEntity).where(UserEntity.login == login))
        if not login_check:
            break
    else:
        raise ValueError("Cant generate unique login. Please try again")
    new_user = UserEntity(
        parent_full_name=data.parent_full_name,
        child_full_name=data.child_full_name,
        school_number=data.school_number,
        class_number=data.class_number,
        class_label=data.class_label,
        phone=data.phone,
        consent_pd=data.consent_pd,
        consent_testing=data.consent_testing,
        login=login,
        password_hash=hash_password(plain_password),
    )
    db.add(new_user)
    await db.flush() # get user id
    return new_user, plain_password

async def authenticate_user(db: AsyncSession, data: LoginRequestDTO) -> UserEntity:
    from app.core.security import verify_password
    user = await db.scalar(select(UserEntity).where(UserEntity.login == data.login))
    if not user or not verify_password(data.password, user.password_hash):
        raise ValueError("Wrong login or password")
    if not user.is_active:
        raise ValueError("Account is blocked")
    return user
async def reset_user_password(db: AsyncSession, phone: str) -> tuple[str, str]:
    # 1. search for user by parrent phone
    user = await db.scalar(select(UserEntity).where(UserEntity.phone == phone))
    if not user:
        raise ValueError("User not found")
    # 2. Check if user already reset the password in last 60 seconds
    if user.last_reset_request_at:
        last_request = user.last_reset_request_at.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if now - last_request < timedelta(seconds=60):
            time_left = 60 - int((now - last_request).total_seconds())
            raise ValueError(f"Слишком много попыток. Попробуйте через {time_left} сек.")
    # 3. Generating new password
    _, new_password = generate_credentials(user.child_full_name)
    user.password_hash = hash_password(new_password)
    # 4. Save current request time for 2. checking
    user.last_reset_request_at = datetime.now(timezone.utc)

    await db.flush()
    return user.login, new_password
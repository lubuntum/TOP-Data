from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.entities.admin_entity import AdminEntity
from app.core.database.entities.test_result_entity import TestResultEntity
from app.core.database.entities.user_entity import UserEntity
from app.core.security import verify_password
from app.features.admin.dto import ExportUserDTO


async def authenticate_admin(db, login, password) -> AdminEntity:
    admin = await db.scalar(select(AdminEntity).where(AdminEntity.login == login))
    if not admin or not verify_password(password, admin.password_hash):
        raise ValueError("Incorrect login or password")
    return admin
async def get_filtered_users(
        db : AsyncSession,
        date_from = None,
        date_to = None,
        city = None,
        school = None,
        class_num = None
):
    query = select(UserEntity)
    if date_from:
        query = query.where(UserEntity.created_at >= date_from)
    if date_to:
        query = query.where(UserEntity.created_at <= date_to)
    if city:
        query = query.where(UserEntity.city.ilike(f"%{city}%"))
    if school:
        query = query.where(UserEntity.school_number == school)
    if class_num:
        query = query.where(UserEntity.class_number == int(class_num))
    users = (await db.scalars(query)).all()
    results = []

    for user in users:
        test_query = select(TestResultEntity).where(TestResultEntity.user_id == user.id)
        tests = (await db.scalars(test_query)).all()
        tests_dict = {}
        #TODO test it, questianoble
        for test in tests:
            tests_dict[test.test_code] = {
                "raw_answers": test.raw_answers,
                "computed_scores": test.computed_scores,
                "created_at": test.created_at.strftime("%Y-%m-%d %H:%M")
            }
        results.append(ExportUserDTO(
            parent_full_name = user.parent_full_name,
            phone = user.phone,
            created_at = user.created_at.strftime("%Y-%m-%d %H:%M"),
            city= user.city,
            school_number = user.school_number,
            class_number = user.class_number,
            class_label = user.class_label,
            child_full_name = user.child_full_name,
            tests = tests_dict
        ))
    return results
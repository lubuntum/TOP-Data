from datetime import datetime

from sqlalchemy import String, Integer, Boolean, DateTime, func
from sqlalchemy.orm import mapped_column, Mapped

from app.core.database.database import Base


class UserEntity(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    # Parent's and child's data
    parent_full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    child_full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    school_number: Mapped[str] = mapped_column(String(255), nullable=False)
    class_number: Mapped[int] = mapped_column(Integer, nullable=False)
    class_label: Mapped[str] = mapped_column(String(1), nullable=False)
    phone: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )
    # Agreement
    consent_pd: Mapped[bool] = mapped_column(Boolean, nullable=False)
    consent_testing: Mapped[bool] = mapped_column(Boolean, nullable=False)

    # Auth
    login: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Meta
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<UserEntity(id={self.id}, login='{self.login}')>"
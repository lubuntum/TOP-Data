from datetime import datetime
from typing import Any

from sqlalchemy import ForeignKey, String, JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database.database import Base


class TestResultEntity(Base):
    __tablename__ = "test_results"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    test_code: Mapped[str] = mapped_column(String(50), nullable=False)
    #user answers in format like {"1": "a", "2": "b"}
    raw_answers: Mapped[dict[str, Any] | list[Any]] = mapped_column(JSON, nullable=False)
    #Calculate the results
    computed_scores: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    user: Mapped["UserEntity"] = relationship(backref="test_results")
    def __repr__(self) -> str:
        return f"<TestResultEntity(id={self.id}, user_id={self.user_id}, test='{self.test_code}')>"

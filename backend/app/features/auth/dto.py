import re

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RegisterRequestDTO(BaseModel):
    """Request for registration all fields required"""
    parent_full_name: str = Field(..., min_length=2, max_length=255)
    child_full_name: str = Field(..., min_length=2, max_length=255)
    school_number: str = Field(..., min_length=1, max_length=50)
    class_number: int = Field(..., ge=1, le=11)
    class_label: str = Field(..., min_length=1, max_length=1)
    phone: str = Field(..., min_length=11, max_length=20)

    consent_pd: bool = Field(...)
    consent_testing: bool = Field(...)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) == 11 and digits[0] in ("7", "8"):
            return f"+7{digits[1:]}"
        raise ValueError("Неверный формат номера телефона")
    @field_validator("consent_pd", "consent_testing")
    @classmethod
    def must_be_true(cls, v:bool) -> bool:
        if not v:
            raise ValueError("Необходимо подтвердить согласие")
        return v

class RegisterResponseDTO(BaseModel):
    login: str
    password: str
    message: str = (
        "Save this data for login. You can't see this password again"
    )
class LoginRequestDTO(BaseModel):
    login: str
    password: str
class LoginResponseDTO(BaseModel):
    """Successful login. JWT set in httpOnly cookie. """
    message: str = "Success"
    user_id: int
    child_full_name: str
class UserProfileDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    parent_full_name: str
    child_full_name: str
    school_number: str
    class_number: int
    class_label: str
    phone: str
    login: str
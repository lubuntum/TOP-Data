from typing import Optional

from pydantic import BaseModel
from datetime import datetime


class AdminLoginRequestDTO(BaseModel):
    login: str
    password: str


class AdminLoginResponseDTO(BaseModel):
    login: str
    message: str = "Success"



class ExportUserDTO(BaseModel):
    parent_full_name: str
    child_full_name: str
    city: Optional[str]
    school_number: str
    class_number: int
    class_label: str
    phone: str
    created_at: str
    tests: dict

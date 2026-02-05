from pydantic import BaseModel
from typing import Optional, List

class BuildingResponse(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True


class ApartmentResponse(BaseModel):
    id: int
    number: int
    building_code: str
    current_residents: int
    max_residents: int = 8

class ApartmentMemberResponse(BaseModel):
    user_id: int
    username: str
    role: str
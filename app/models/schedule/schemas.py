from pydantic import BaseModel
from typing import Optional
from datetime import date


class ScheduleResponse(BaseModel):
    id: int
    day_of_week: int
    user_id: Optional[int]
    username: Optional[str]
    is_taken: bool
    week_start: date

    class Config:
        model_config = {"from_attributes": True}

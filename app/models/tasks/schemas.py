from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    apartment_id: int
    day_of_week: int
    name: str
    is_done: bool


class TaskListResponse(BaseModel):
    day_of_week: int
    tasks: List[TaskResponse]


class TaskTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None


class TaskTemplateCreate(TaskTemplateBase):
    pass


class TaskTemplateResponse(TaskTemplateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

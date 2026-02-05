from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tasks.models import Task, TaskTemplate
from app.models.tasks.schemas import (
    TaskResponse,
    TaskListResponse,
    TaskTemplateCreate,
    TaskTemplateResponse,
)
from app.models.users.models import User
from app.dependencies import (
    get_current_user,
    get_current_apartment_member,
    require_manager,
)
from app.models.schedule.models import Schedule
from app.models.housing.models import Apartment

router = APIRouter(prefix="/tasks", tags=["tasks"])


DEFAULT_TASK_SETS = {
    "Лёгкая уборка": [
        "Протереть пыль",
        "Собрать вещи",
        "Проветрить комнаты",
    ],
    "Генеральная уборка": [
        "Убрать пол (помыть, подмести)",
        "Выкинуть мусор",
        "Помыть посуду",
        "Прибраться в комнате",
        "Почистить туалет и ванную комнату",
        "Прибраться на кухне",
    ],
}


def seed_tasks_for_day(db: Session, apartment_id: int, day_of_week: int):
    exists = (
        db.query(Task)
        .filter(Task.apartment_id == apartment_id, Task.day_of_week == day_of_week)
        .first()
    )
    if exists:
        return

    apartment = db.query(Apartment).filter(Apartment.id == apartment_id).first()
    use_default = True
    if apartment is not None:
        use_default = apartment.use_default_tasks

    if use_default:
        names = DEFAULT_TASK_SETS["Генеральная уборка"]
    else:
        templates = (
            db.query(TaskTemplate)
            .filter(TaskTemplate.apartment_id == apartment_id)
            .all()
        )
        names = [t.name for t in templates] if templates else []

    for name in names:
        db.add(Task(apartment_id=apartment_id, day_of_week=day_of_week, name=name))

    db.commit()


@router.get("/{day_of_week}", response_model=TaskListResponse)
def get_tasks_for_day(
    day_of_week: int,
    db: Session = Depends(get_db),
    member=Depends(get_current_apartment_member),
):
    seed_tasks_for_day(db, member.apartment_id, day_of_week)

    tasks = (
        db.query(Task)
        .filter(Task.apartment_id == member.apartment_id, Task.day_of_week == day_of_week)
        .order_by(Task.id)
        .all()
    )

    return TaskListResponse(
        day_of_week=day_of_week,
        tasks=tasks,
    )


@router.post("/{task_id}/toggle")
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_done = not task.is_done
    db.commit()
    db.refresh(task)

    if task.is_done:
        schedule = (
            db.query(Schedule)
            .filter(
                Schedule.day_of_week == task.day_of_week,
                Schedule.user_id == current_user.id,
            )
            .first()
        )

        if schedule:
            day_tasks = (
                db.query(Task)
                .filter(
                    Task.apartment_id == task.apartment_id,
                    Task.day_of_week == task.day_of_week,
                )
                .all()
            )

            if day_tasks and all(t.is_done for t in day_tasks):
                current_user.total_cleanings += 1
                db.add(current_user)
                db.commit()
                db.refresh(current_user)

    return task


@router.get("/templates/me", response_model=list[TaskTemplateResponse])
def list_my_templates(
    db: Session = Depends(get_db),
    member=Depends(require_manager),
):
    templates = (
        db.query(TaskTemplate)
        .filter(TaskTemplate.apartment_id == member.apartment_id)
        .order_by(TaskTemplate.id)
        .all()
    )
    return templates


@router.post("/templates/me", response_model=TaskTemplateResponse)
def create_template_for_my_apartment(
    template_in: TaskTemplateCreate,
    db: Session = Depends(get_db),
    member=Depends(require_manager),
):
    template = TaskTemplate(
        apartment_id=member.apartment_id,
        name=template_in.name,
        description=template_in.description,
        is_global=False,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.delete("/templates/me/{template_id}")
def delete_template_for_my_apartment(
    template_id: int,
    db: Session = Depends(get_db),
    member=Depends(require_manager),
):
    template = (
        db.query(TaskTemplate)
        .filter(
            TaskTemplate.id == template_id,
            TaskTemplate.apartment_id == member.apartment_id,
        )
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(template)
    db.commit()
    return {"detail": "Template deleted"}

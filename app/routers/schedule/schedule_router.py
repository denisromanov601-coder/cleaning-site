from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.schedule.models import Schedule
from app.models.schedule.schemas import ScheduleResponse
from app.models.users.models import User
from app.dependencies import get_current_user, get_current_apartment_member

router = APIRouter(prefix="/schedules", tags=["schedules"])


def seed_week_if_empty(db: Session, apartment_id: int):
    today = date.today()
    week_start = today

    exists = (
        db.query(Schedule)
        .filter(
            Schedule.week_start == week_start,
            Schedule.apartment_id == apartment_id,
        )
        .first()
    )
    if exists:
        return

    for i in range(7):
        db.add(Schedule(day_of_week=i, week_start=week_start, apartment_id=apartment_id))
    db.commit()


@router.get("/", response_model=list[ScheduleResponse])
def get_schedule(
    db: Session = Depends(get_db),
    member = Depends(get_current_apartment_member),
):
    seed_week_if_empty(db, member.apartment_id)
    today = date.today()

    schedules = (
        db.query(Schedule)
        .options(joinedload(Schedule.user))
        .filter(
            Schedule.week_start == today,
            Schedule.apartment_id == member.apartment_id,
        )
        .order_by(Schedule.day_of_week)
        .all()
    )

    return [
        ScheduleResponse(
            id=s.id,
            day_of_week=s.day_of_week,
            user_id=s.user_id,
            username=s.user.username if s.user else None,
            is_taken=s.is_taken,
            week_start=s.week_start,
        )
        for s in schedules
    ]


@router.post("/{schedule_id}/take", response_model=ScheduleResponse)
def take_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    member = Depends(get_current_apartment_member),
):
    schedule = (
        db.query(Schedule)
        .options(joinedload(Schedule.user))
        .filter(
            Schedule.id == schedule_id,
            Schedule.apartment_id == member.apartment_id,
        )
        .first()
    )
    if not schedule:
        raise HTTPException(404, "День не найден")

    if schedule.is_taken and schedule.user_id != current_user.id:
        raise HTTPException(400, "Этот день уже занят другим пользователем")

    existing = (
        db.query(Schedule)
        .filter(
            Schedule.user_id == current_user.id,
            Schedule.week_start == schedule.week_start,
            Schedule.apartment_id == member.apartment_id,
        )
        .first()
    )
    if existing and existing.id != schedule.id:
        existing.user_id = None
        existing.is_taken = False

    schedule.user_id = current_user.id
    schedule.is_taken = True
    db.commit()
    db.refresh(schedule)

    return ScheduleResponse(
        id=schedule.id,
        day_of_week=schedule.day_of_week,
        user_id=schedule.user_id,
        username=schedule.user.username if schedule.user else None,
        is_taken=schedule.is_taken,
        week_start=schedule.week_start,
    )


@router.post("/{schedule_id}/release", response_model=ScheduleResponse)
def release_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    member = Depends(get_current_apartment_member),
):
    schedule = (
        db.query(Schedule)
        .options(joinedload(Schedule.user))
        .filter(
            Schedule.id == schedule_id,
            Schedule.apartment_id == member.apartment_id,
        )
        .first()
    )
    if not schedule:
        raise HTTPException(404, "День не найден")

    # освободить может только тот, кто занимает день
    if schedule.user_id != current_user.id:
        raise HTTPException(400, "Вы не можете освободить этот день")

    schedule.user_id = None
    schedule.is_taken = False
    db.commit()
    db.refresh(schedule)

    return ScheduleResponse(
        id=schedule.id,
        day_of_week=schedule.day_of_week,
        user_id=schedule.user_id,
        username=schedule.user.username if schedule.user else None,
        is_taken=schedule.is_taken,
        week_start=schedule.week_start,
    )

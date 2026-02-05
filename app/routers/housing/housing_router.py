from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.housing.models import Building, Apartment, ApartmentMember
from app.models.users.models import User
from app.models.housing.schemas import BuildingResponse, ApartmentResponse, ApartmentMemberResponse
from app.dependencies import get_current_user, get_current_apartment_member, require_manager

router = APIRouter(prefix="/housing", tags=["housing"])

BUILDING_CODES = ["C1", "C2", "R1", "R2", "R3", "R4", "R5", "R6"]

def seed_buildings_and_apartments(db: Session):
    existing = db.query(Building).count()
    if existing:
        return
    for code in BUILDING_CODES:
        building = Building(code=code, name=code)
        db.add(building)
        db.flush()
        for number in range(1, 97):  # 1-96
            db.add(Apartment(building_id=building.id, number=number))
    db.commit()

@router.get("/buildings", response_model=list[BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    seed_buildings_and_apartments(db)
    buildings = db.query(Building).order_by(Building.code).all()
    return buildings

@router.get("/buildings/{code}/apartments", response_model=list[ApartmentResponse])
def get_apartments_by_building(code: str, db: Session = Depends(get_db)):
    building = db.query(Building).filter(Building.code == code).first()
    if not building:
        raise HTTPException(404, "Building not found")

    apartments = (
        db.query(Apartment)
        .filter(Apartment.building_id == building.id)
        .all()
    )

    result: list[ApartmentResponse] = []
    for apt in apartments:
        current_residents = len(apt.members)
        result.append(
            ApartmentResponse(
                id=apt.id,
                number=apt.number,
                building_code=building.code,
                current_residents=current_residents,
            )
        )
    return result

@router.post("/apartments/{apartment_id}/join", response_model=ApartmentMemberResponse)
def join_apartment(
    apartment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apartment = db.query(Apartment).filter(Apartment.id == apartment_id).first()
    if not apartment:
        raise HTTPException(404, "Apartment not found")

    existing_member = (
        db.query(ApartmentMember)
        .filter(ApartmentMember.user_id == current_user.id)
        .first()
    )
    if existing_member:
        raise HTTPException(400, "User already assigned to an apartment")

    residents_count = db.query(ApartmentMember).filter(
        ApartmentMember.apartment_id == apartment.id
    ).count()
    if residents_count >= 8:
        raise HTTPException(400, "Apartment is full")

    # если квартира пустая — первый пользователь становится менеджером
    role = "manager" if residents_count == 0 else "resident"

    member = ApartmentMember(
        user_id=current_user.id,
        apartment_id=apartment.id,
        role=role,
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return ApartmentMemberResponse(
        user_id=current_user.id,
        username=current_user.username,
        role=member.role,
    )

@router.post("/apartments/{apartment_id}/move", response_model=ApartmentMemberResponse)
def move_to_apartment(
    apartment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_apartment = db.query(Apartment).filter(Apartment.id == apartment_id).first()
    if not new_apartment:
        raise HTTPException(404, "Apartment not found")

    residents_count = db.query(ApartmentMember).filter(
        ApartmentMember.apartment_id == new_apartment.id
    ).count()
    if residents_count >= 8:
        raise HTTPException(400, "Apartment is full")

    member = (
        db.query(ApartmentMember)
        .filter(ApartmentMember.user_id == current_user.id)
        .first()
    )

    if not member:
        # если не был нигде — как join
        role = "manager" if residents_count == 0 else "resident"
        member = ApartmentMember(
            user_id=current_user.id,
            apartment_id=new_apartment.id,
            role=role,
        )
        db.add(member)
    else:
        member.apartment_id = new_apartment.id
        # роль можно оставить прежней или сбросить до resident
        if residents_count > 0:
            member.role = "resident"

    db.commit()
    db.refresh(member)

    return ApartmentMemberResponse(
        user_id=current_user.id,
        username=current_user.username,
        role=member.role,
    )

@router.get("/apartments/me", response_model=ApartmentResponse)
def get_my_apartment(member = Depends(get_current_apartment_member), db: Session = Depends(get_db)):
    apartment = db.query(Apartment).filter(Apartment.id == member.apartment_id).first()
    building = apartment.building
    current_residents = len(apartment.members)
    return ApartmentResponse(
        id=apartment.id,
        number=apartment.number,
        building_code=building.code,
        current_residents=current_residents,
    )


@router.get("/apartments/me/members", response_model=list[ApartmentMemberResponse])
def get_my_apartment_members(
    member = Depends(get_current_apartment_member),
    db: Session = Depends(get_db),
):
    members = (
        db.query(ApartmentMember)
        .filter(ApartmentMember.apartment_id == member.apartment_id)
        .all()
    )
    return [
        ApartmentMemberResponse(
            user_id=m.user_id,
            username=m.user.username,
            role=m.role,
        )
        for m in members
    ]

@router.delete("/apartments/{apartment_id}/members/{user_id}")
def remove_member(
    apartment_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    manager = Depends(require_manager),
):
    if manager.apartment_id != apartment_id:
        raise HTTPException(403, "Not allowed")

    member = (
        db.query(ApartmentMember)
        .filter(
            ApartmentMember.apartment_id == apartment_id,
            ApartmentMember.user_id == user_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(404, "Member not found")

    # нельзя удалить самого себя, если ты единственный менеджер
    if member.user_id == manager.user_id and member.role == "manager":
        managers_count = db.query(ApartmentMember).filter(
            ApartmentMember.apartment_id == apartment_id,
            ApartmentMember.role == "manager",
        ).count()
        if managers_count <= 1:
            raise HTTPException(400, "Cannot remove the only manager")

    db.delete(member)
    db.commit()
    return {"detail": "Member removed"}


@router.post("/apartments/me/use-default-tasks")
def set_use_default_tasks(
    use_default: bool,
    db: Session = Depends(get_db),
    member=Depends(require_manager),
):
    apartment = db.query(Apartment).filter(Apartment.id == member.apartment_id).first()
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartment not found")

    apartment.use_default_tasks = use_default
    db.add(apartment)
    db.commit()
    db.refresh(apartment)

    return {"use_default_tasks": apartment.use_default_tasks}
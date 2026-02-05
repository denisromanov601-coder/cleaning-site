from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models.users.models import User
from app.models.users.schemas import (
    UserCreate,
    UserResponse,
    UserApartmentInfo,
    TokenResponse,
)
import argon2
from app.dependencies import get_current_user
from app.models.housing.models import ApartmentMember, Apartment
from app.core.auth import create_access_token

router = APIRouter()

password_hasher = argon2.PasswordHasher()


@router.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = password_hasher.hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/users/login", response_model=TokenResponse)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm ожидает поля form: username, password
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        password_hasher.verify(db_user.hashed_password, form_data.password)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(db_user)

    member = (
        db.query(ApartmentMember)
        .filter(ApartmentMember.user_id == db_user.id)
        .first()
    )

    apartment_info = None
    if member:
        apartment = db.query(Apartment).filter(Apartment.id == member.apartment_id).first()
        if apartment:
            apartment_info = UserApartmentInfo(
                building_code=apartment.building.code,
                apartment_number=apartment.number,
                role=member.role,
            )

    user_resp = UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        created_at=db_user.created_at,
        apartment=apartment_info,
    )

    return TokenResponse(access_token=access_token, user=user_resp)


@router.get("/users/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = (
        db.query(ApartmentMember)
        .filter(ApartmentMember.user_id == current_user.id)
        .first()
    )

    apartment_info = None
    if member:
        apartment = (
            db.query(Apartment)
            .filter(Apartment.id == member.apartment_id)
            .first()
        )
        if apartment:
            apartment_info = UserApartmentInfo(
                building_code=apartment.building.code,
                apartment_number=apartment.number,
                role=member.role,
            )

    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at,
        apartment=apartment_info,
        total_cleanings=current_user.total_cleanings,  # если поле добавлено
    )


@router.get("/users/", response_model=list[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

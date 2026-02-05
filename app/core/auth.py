# app/core/auth.py
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError

from app.models.users.models import User

# лучше вынести в env
SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_ME"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 дней


def create_access_token(user: User, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {
        "sub": user.username,
        "user_id": user.id,
        "role": "user",  # базовая роль, отдельно будем хранить manager/resident в ApartmentMember
    }
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Invalid token")

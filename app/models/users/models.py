from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_cleanings = Column(Integer, default=0, nullable=False)

    # один к одному с ApartmentMember
    apartment_member = relationship(
        "ApartmentMember",
        back_populates="user",
        uselist=False,
    )

    # один ко многим с Schedule
    schedules = relationship(
        "Schedule",
        back_populates="user",
    )

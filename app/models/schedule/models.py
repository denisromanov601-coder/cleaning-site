from sqlalchemy import (
    Column,
    Integer,
    Date,
    ForeignKey,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Schedule(Base):
    __tablename__ = "schedules"
    __table_args__ = (
        UniqueConstraint(
            "week_start",
            "day_of_week",
            "apartment_id",
            name="uniq_week_day_apartment",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    day_of_week = Column(Integer, nullable=False)  # 0-6

    apartment_id = Column(Integer, ForeignKey("apartments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="schedules")
    # apartment = relationship("Apartment")  # можно добавить при необходимости

    is_taken = Column(Boolean, default=False)
    week_start = Column(Date, nullable=False, server_default=func.current_date())
    created_at = Column(Date, server_default=func.current_date())

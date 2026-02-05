from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)

    apartments = relationship("Apartment", back_populates="building")


class Apartment(Base):
    __tablename__ = "apartments"

    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=False)
    number = Column(Integer, nullable=False)
    max_residents = Column(Integer, default=4, nullable=False)

    # флаг: использовать стандартный набор задач или свои шаблоны
    use_default_tasks = Column(Boolean, default=True, nullable=False)

    building = relationship("Building", back_populates="apartments")
    members = relationship("ApartmentMember", back_populates="apartment")
    task_templates = relationship("TaskTemplate", back_populates="apartment")


class ApartmentMember(Base):
    __tablename__ = "apartment_members"

    id = Column(Integer, primary_key=True, index=True)
    apartment_id = Column(Integer, ForeignKey("apartments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, default="resident", nullable=False)

    apartment = relationship("Apartment", back_populates="members")
    user = relationship("User", back_populates="apartment_member")

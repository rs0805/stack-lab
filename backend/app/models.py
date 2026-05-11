from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Employee(Base):
    __tablename__ = 'employees'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    location = Column(String, nullable=True)
    department = Column(String, nullable=False)
    skills = relationship("EmployeeSkill", back_populates="employee", cascade="all, delete")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    __table_args__ = (
        CheckConstraint(
            "category IN ('frontend', 'backend', 'database', 'cloud', 'other')",
            name="valid_category",
        ),
    )
    employees = relationship("EmployeeSkill", back_populates="skill", cascade="all, delete")


class EmployeeSkill(Base):
    __tablename__ = 'employee_skills'
    employee_id = Column(Integer, ForeignKey('employees.id', ondelete="CASCADE"), primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.id', ondelete="CASCADE"), primary_key=True)
    proficiency = Column(Integer, nullable=False)
    __table_args__ = (
        CheckConstraint('proficiency >= 1 AND proficiency <= 5', name='proficiency_range'),
    )
    employee = relationship("Employee", back_populates="skills")
    skill = relationship("Skill", back_populates="employees")
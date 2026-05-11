from enum import Enum
from pydantic import BaseModel, EmailStr, Field, model_validator

class SkillCategory(str, Enum):
    frontend = "frontend"
    backend = "backend"
    database = "database"
    cloud = "cloud"
    other = "other"
    
class SkillBase(BaseModel):
    name: str
    category: SkillCategory

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

class EmployeeSkillBase(BaseModel):
    skill_id: int
    proficiency: int = Field(ge=1, le=5)

class EmployeeSkillCreate(EmployeeSkillBase):
    pass

class EmployeeSkillResponse(EmployeeSkillBase):
    skill: SkillResponse
    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    department: str
    location: str | None = None

class EmployeeCreate(EmployeeBase):
    skills: list[EmployeeSkillCreate] = []
    @model_validator(mode="after")
    def unique_skill_ids(self):
        ids = [s.skill_id for s in self.skills]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate skill_id values are not allowed")
        return self

class EmployeeResponse(EmployeeBase):
    id: int
    skills: list[EmployeeSkillResponse] = []
    class Config:
        from_attributes = True

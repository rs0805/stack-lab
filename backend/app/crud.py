from app.schemas import SkillCreate
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models import Employee, Skill, EmployeeSkill
from app.schemas import EmployeeCreate

async def get_skills(db: AsyncSession) -> list[Skill]:
    result = await db.execute(select(Skill).order_by(Skill.name))
    return list(result.scalars().all())

async def get_skill_by_id(db: AsyncSession, skill_id: int) -> Skill | None:
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    return result.scalar_one_or_none()

async def create_skill(db: AsyncSession, data: SkillCreate) -> Skill:
    skill = Skill(**data.model_dump())
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill

async def get_employee_by_id(db: AsyncSession, employee_id: int) -> Employee | None:
    result = await db.execute(
        select(Employee)
        .options(selectinload(Employee.skills).selectinload(EmployeeSkill.skill))
        .where(Employee.id == employee_id)
    )
    return result.scalar_one_or_none()

async def create_employee(db: AsyncSession, data: EmployeeCreate) -> Employee:
    employee = Employee(
        name=data.name,
        email=data.email,
        department=data.department,
        location=data.location,
    )
    db.add(employee)
    await db.flush()
    for skill_entry in data.skills:
        db.add(EmployeeSkill(
            employee_id=employee.id,
            skill_id=skill_entry.skill_id,
            proficiency=skill_entry.proficiency,
        ))
    await db.commit()
    return await get_employee_by_id(db, employee.id)

async def delete_employee(db: AsyncSession, employee_id: int) -> bool:
    employee = await get_employee_by_id(db, employee_id)
    if not employee:
        return False
    await db.delete(employee)
    await db.commit()
    return True

async def search_employees(
    db: AsyncSession,
    *,
    search: str | None = None,
    skills: list[str] | None = None,
    department: str | None = None,
    location: str | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    page: int = 1,
    limit: int = 10,
) -> tuple[list[Employee], int]:
    query = select(Employee).options(
        selectinload(Employee.skills).selectinload(EmployeeSkill.skill)
    )
    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(
                Employee.name.ilike(pattern),
                Employee.email.ilike(pattern),
            )
        )
    if department:
        query = query.where(Employee.department.ilike(department))
    if location:
        query = query.where(Employee.location.ilike(location))
    if skills:
        for skill_name in skills:
            query = query.where(
                Employee.id.in_(
                    select(EmployeeSkill.employee_id)
                    .join(Skill)
                    .where(Skill.name.ilike(skill_name))
                )
            )
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    sort_column = getattr(Employee, sort_by, Employee.name)
    if sort_order == "desc":
        sort_column = sort_column.desc()
    else:
        sort_column = sort_column.asc()
    query = query.order_by(sort_column)
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().unique().all()), total

async def get_departments(db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(Employee.department).distinct().order_by(Employee.department)
    )
    return list(result.scalars().all())

async def get_locations(db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(Employee.location).distinct().order_by(Employee.location)
    )
    return list(result.scalars().all())
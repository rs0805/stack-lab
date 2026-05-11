from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import EmployeeCreate, EmployeeResponse
from app import crud

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("", response_model=dict)
async def list_employees(
    search: str | None = Query(None, description="Search by name or email"),
    skills: str | None = Query(None, description="Comma-separated skill names"),
    department: str | None = Query(None),
    location: str | None = Query(None),
    sort_by: str = Query("id", description="Sort field: id, name, department, location"),
    sort_order: str = Query("asc", description="asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    skill_list = [s.strip() for s in skills.split(",")] if skills else None
    employees, total = await crud.search_employees(
        db,
        search=search,
        skills=skill_list,
        department=department,
        location=location,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )
    return {
        "employees": [EmployeeResponse.model_validate(e) for e in employees],
        "total": total,
        "page": page,
        "limit": limit,
    }

@router.post("", response_model=EmployeeResponse, status_code=201)
async def create_employee(
    data: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
):
    return await crud.create_employee(db, data)

@router.delete("/{employee_id}", status_code=204)
async def delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
):
    deleted = await crud.delete_employee(db, employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")

@router.get("/departments", response_model=list[str])
async def list_departments(db: AsyncSession = Depends(get_db)):
    departments = await crud.get_departments(db)
    if not departments:
        raise HTTPException(status_code=404, detail="No departments found")
    return departments

@router.get("/locations", response_model=list[str])
async def list_locations(db: AsyncSession = Depends(get_db)):
    locations = await crud.get_locations(db)
    if not locations:
        raise HTTPException(status_code=404, detail="No locations found")
    return locations
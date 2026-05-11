import asyncio
import csv
from app.database import engine, Base, AsyncSessionLocal
from app.models import Employee, Skill, EmployeeSkill

SKILLS_CSV = r"C:\Users\U1109191\Downloads\skills.csv"
EMPLOYEES_CSV = r"C:\Users\U1109191\Downloads\employees.csv"
EMPLOYEE_SKILLS_CSV = r"C:\Users\U1109191\Downloads\employee_skills.csv"

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        with open(SKILLS_CSV, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            skill_count = 0
            for row in reader:
                session.add(Skill(
                    id=int(row["id"]),
                    name=row["name"].strip(),
                    category=row["category"].strip().lower(),
                ))
                skill_count += 1
        await session.flush()
        with open(EMPLOYEES_CSV, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            emp_count = 0
            for row in reader:
                session.add(Employee(
                    id=int(row["id"]),
                    name=row["name"].strip(),
                    email=row["email"].strip(),
                    department=row["department"].strip(),
                    location=row["location"].strip(),
                ))
                emp_count += 1
        await session.flush()
        with open(EMPLOYEE_SKILLS_CSV, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            link_count = 0
            for row in reader:
                session.add(EmployeeSkill(
                    employee_id=int(row["employee_id"]),
                    skill_id=int(row["skill_id"]),
                    proficiency=int(row["proficiency"]),
                ))
                link_count += 1
        await session.commit()
        print(f"Seeded {skill_count} skills, {emp_count} employees, {link_count} skill assignments.")

if __name__ == "__main__":
    asyncio.run(seed())

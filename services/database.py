from models import db, User, Task, DailyUpdate, Comment
from app import bcrypt
from datetime import datetime, timedelta

def seed_database():
    if User.query.first():
        return # Already seeded
    
    print("Seeding database...")

    # Create Manager
    manager = User(
        name="Kameshwaran",
        email="manager@company.com",
        password=bcrypt.generate_password_hash("admin123").decode('utf-8'),
        role="Manager"
    )
    db.session.add(manager)

    # Create Employees
    employees_data = [
        ("Devi", "devi@company.com", "employee123"),
        ("Nisha", "nisha@company.com", "employee123"),
        ("Arul Mozhi", "arul@company.com", "employee123"),
        ("UV", "uv@company.com", "employee123"),
        ("Jawwy", "jawwy@company.com", "employee123"),
        ("Hema", "hema@company.com", "employee123"),
        ("GP", "gp@company.com", "employee123")
    ]

    employees = {}
    for name, email, password in employees_data:
        emp = User(
            name=name,
            email=email,
            password=bcrypt.generate_password_hash(password).decode('utf-8'),
            role="Employee"
        )
        db.session.add(emp)
        employees[name] = emp
    
    db.session.commit()

    db.session.commit()
    print("Database seeded successfully with users only.")

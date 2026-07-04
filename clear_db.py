from app import create_app
from models import db
from services.database import seed_database

app = create_app()
with app.app_context():
    # Drop all tables to delete all data
    db.drop_all()
    # Recreate the tables
    db.create_all()
    # Reseed with initial users and initial 2 tasks
    seed_database()
    print("Database cleared and re-seeded successfully.")

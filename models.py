from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Employee')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    tasks_assigned_by = db.relationship('Task', foreign_keys='Task.assigned_by', backref='assigner', lazy=True)
    tasks_assigned_to = db.relationship('Task', foreign_keys='Task.assigned_to', backref='assignee', lazy=True)
    daily_updates = db.relationship('DailyUpdate', backref='employee', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.String(20), unique=True, nullable=False) # e.g. WT-1
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    priority = db.Column(db.String(20), nullable=False, default='Medium') # Low, Medium, High, Critical
    status = db.Column(db.String(20), nullable=False, default='Open') # Open, In Progress, Blocked, Completed
    project = db.Column(db.String(100), nullable=False)
    task_type = db.Column(db.String(50), default='Task') # Story, Bug, Task, Epic
    labels = db.Column(db.String(255), nullable=True) # comma separated
    sprint = db.Column(db.String(100), nullable=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    estimated_hours = db.Column(db.Float, default=0.0)
    actual_hours = db.Column(db.Float, default=0.0)
    completion_percentage = db.Column(db.Integer, default=0)
    
    # Relationships
    updates = db.relationship('DailyUpdate', backref='task', lazy=True, cascade="all, delete-orphan")
    comments = db.relationship('Comment', backref='task', lazy=True, cascade="all, delete-orphan")
    attachments = db.relationship('Attachment', backref='task', lazy=True, cascade="all, delete-orphan")

class DailyUpdate(db.Model):
    __tablename__ = 'daily_updates'
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    description = db.Column(db.Text, nullable=False)
    hours = db.Column(db.Float, nullable=False)
    completion = db.Column(db.Integer, nullable=False, default=0)
    blockers = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Attachment(db.Model):
    __tablename__ = 'attachments'
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, current_user, logout_user, login_required
from functools import wraps
from models import db, User, Task, DailyUpdate, Comment, Notification, Attachment
from services.auth_service import authenticate_user
from services.task_service import create_task, update_task, delete_task, add_daily_update, add_comment, save_attachment
from services.email_service import send_task_assigned_email, send_task_completed_email, send_help_email
import os
from datetime import datetime

main = Blueprint('main', __name__)

def manager_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'Manager':
            return jsonify({'error': 'Unauthorized'}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- API HELPER FOR SERIALIZATION ---
def user_to_dict(user):
    return {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role}

def task_to_dict(task):
    return {
        'id': task.id,
        'task_id': task.task_id,
        'title': task.title,
        'description': task.description,
        'assignee': user_to_dict(task.assignee),
        'assigner': user_to_dict(task.assigner),
        'priority': task.priority,
        'status': task.status,
        'project': task.project,
        'task_type': task.task_type,
        'labels': task.labels,
        'sprint': task.sprint,
        'created_date': task.created_date.isoformat(),
        'due_date': task.due_date.isoformat(),
        'estimated_hours': task.estimated_hours,
        'actual_hours': task.actual_hours,
        'completion_percentage': task.completion_percentage
    }

# --- AUTH ROUTES ---

@main.route("/api/login", methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = authenticate_user(email, password)
    if user:
        login_user(user, remember=True)
        return jsonify({'message': 'Logged in successfully', 'user': user_to_dict(user)})
    return jsonify({'error': 'Invalid credentials'}), 401

@main.route("/api/logout", methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@main.route("/api/me", methods=['GET'])
def get_me():
    if current_user.is_authenticated:
        return jsonify({'user': user_to_dict(current_user)})
    return jsonify({'error': 'Not logged in'}), 401

# --- DASHBOARD ROUTES ---

@main.route("/api/dashboard", methods=['GET'])
@login_required
def dashboard():
    if current_user.role == 'Manager':
        total_tasks = Task.query.count()
        completed_tasks = Task.query.filter_by(status='Completed').count()
        pending_tasks = Task.query.filter(Task.status.in_(['Open', 'In Progress'])).count()
        overdue_tasks = Task.query.filter(Task.due_date < datetime.utcnow(), Task.status != 'Completed').count()
        
        recent_updates = DailyUpdate.query.order_by(DailyUpdate.date.desc()).limit(5).all()
        tasks = Task.query.order_by(Task.created_date.desc()).all()
        
        return jsonify({
            'metrics': {
                'total': total_tasks,
                'completed': completed_tasks,
                'pending': pending_tasks,
                'overdue': overdue_tasks
            },
            'recent_updates': [{
                'id': u.id,
                'task_id': u.task.task_id,
                'task_db_id': u.task.id,
                'employee_name': u.employee.name,
                'hours': u.hours,
                'completion': u.completion,
                'date': u.date.isoformat()
            } for u in recent_updates],
            'tasks': [task_to_dict(t) for t in tasks]
        })
    else:
        my_tasks = Task.query.filter_by(assigned_to=current_user.id).order_by(Task.due_date.asc()).all()
        pending = len([t for t in my_tasks if t.status == 'Open'])
        in_progress = len([t for t in my_tasks if t.status == 'In Progress'])
        completed = len([t for t in my_tasks if t.status == 'Completed'])
        
        return jsonify({
            'metrics': {
                'pending': pending,
                'in_progress': in_progress,
                'completed': completed
            },
            'tasks': [task_to_dict(t) for t in my_tasks]
        })

@main.route("/api/employees", methods=['GET'])
@login_required
@manager_required
def get_employees():
    employees = User.query.filter_by(role='Employee').all()
    return jsonify([user_to_dict(e) for e in employees])

# --- TASK ROUTES ---

@main.route("/api/task", methods=['POST'])
@login_required
@manager_required
def new_task():
    data = request.get_json()
    data['due_date'] = datetime.strptime(data['due_date'], '%Y-%m-%d')
    task = create_task(data, current_user.id)
    send_task_assigned_email(task)
    return jsonify({'message': 'Task created successfully', 'task': task_to_dict(task)})

@main.route("/api/task/<int:task_id>", methods=['GET'])
@login_required
def task_details(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user.role == 'Employee' and task.assigned_to != current_user.id:
        return jsonify({'error': 'Access Denied'}), 403
        
    updates = [{
        'id': u.id, 'date': u.date.isoformat(), 'hours': u.hours, 
        'completion': u.completion, 'description': u.description, 'blockers': u.blockers
    } for u in task.updates]
    
    comments = [{
        'id': c.id, 'author': c.author.name, 'role': c.author.role,
        'created_at': c.created_at.isoformat(), 'comment': c.comment
    } for c in task.comments]
    
    attachments = [{
        'id': a.id, 'filename': a.filename, 'filepath': a.filepath, 'uploaded_at': a.uploaded_at.isoformat()
    } for a in task.attachments]
    
    return jsonify({
        'task': task_to_dict(task),
        'updates': updates,
        'comments': comments,
        'attachments': attachments
    })

@main.route("/api/task/<int:task_id>", methods=['PUT'])
@login_required
@manager_required
def update_task_route(task_id):
    data = request.get_json()
    if 'due_date' in data and isinstance(data['due_date'], str):
        data['due_date'] = datetime.strptime(data['due_date'].split('T')[0], '%Y-%m-%d')
    updated = update_task(task_id, data)
    if updated.status == 'Completed':
        send_task_completed_email(updated)
    return jsonify({'message': 'Task updated successfully', 'task': task_to_dict(updated)})

@main.route("/api/task/<int:task_id>", methods=['DELETE'])
@login_required
@manager_required
def delete_task_route(task_id):
    if delete_task(task_id):
        return jsonify({'message': 'Task deleted successfully'})
    return jsonify({'error': 'Task not found'}), 404

# --- INTERACTION ROUTES ---

@main.route("/api/task/<int:task_id>/accept", methods=['POST'])
@login_required
def accept_task(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user.role == 'Employee' and task.assigned_to != current_user.id:
        return jsonify({'error': 'Access Denied'}), 403
    
    if task.status == 'Open':
        task.status = 'In Progress'
        db.session.commit()
    return jsonify({'message': 'Task accepted successfully'})

@main.route("/api/task/<int:task_id>/complete", methods=['POST'])
@login_required
def complete_task(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user.role == 'Employee' and task.assigned_to != current_user.id:
        return jsonify({'error': 'Access Denied'}), 403
        
    if task.status != 'Completed':
        task.status = 'Completed'
        task.completion_percentage = 100
        db.session.commit()
        send_task_completed_email(task)
    return jsonify({'message': 'Task marked as completed'})

@main.route("/api/task/<int:task_id>/daily_update", methods=['POST'])
@login_required
def post_daily_update(task_id):
    task = Task.query.get_or_404(task_id)
    if current_user.role == 'Employee' and task.assigned_to != current_user.id:
        return jsonify({'error': 'Access Denied'}), 403
        
    data = request.get_json()
    data['date'] = datetime.strptime(data['date'].split('T')[0], '%Y-%m-%d').date()
    add_daily_update(task_id, current_user.id, data)
    
    updated_task = Task.query.get(task_id)
    if updated_task.status == 'Completed':
        send_task_completed_email(updated_task)
        
    return jsonify({'message': 'Daily update saved successfully'})

@main.route("/api/task/<int:task_id>/comment", methods=['POST'])
@login_required
def post_comment(task_id):
    data = request.get_json()
    add_comment(task_id, current_user.id, data['comment'])
    return jsonify({'message': 'Comment posted successfully'})

@main.route("/api/task/<int:task_id>/attachment", methods=['POST'])
@login_required
def upload_attachment(task_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    save_attachment(task_id, file, current_app.config['UPLOAD_FOLDER'])
    return jsonify({'message': 'Attachment uploaded successfully'})

@main.route("/api/uploads/<path:filename>", methods=['GET'])
def get_attachment(filename):
    from flask import send_from_directory
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@main.route("/api/help", methods=['POST'])
@login_required
def help_manager():
    if current_user.role != 'Employee':
        return jsonify({'error': 'Only employees can request help'}), 403
        
    data = request.get_json()
    manager = User.query.filter_by(role='Manager').first()
    send_help_email(current_user, manager, data['subject'], data['description'])
    return jsonify({'message': 'Help request sent to manager'})

@main.route("/api/notifications", methods=['GET'])
@login_required
def get_notifications():
    notifs = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).limit(10).all()
    return jsonify([{
        'id': n.id,
        'message': n.message,
        'is_read': n.is_read,
        'created_at': n.created_at.isoformat()
    } for n in notifs])

@main.route("/api/notifications/read/<int:notif_id>", methods=['POST'])
@login_required
def read_notification(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id == current_user.id:
        notif.is_read = True
        db.session.commit()
    return jsonify({'message': 'Notification marked as read'})

@main.route("/api/chart-data", methods=['GET'])
@login_required
@manager_required
def chart_data():
    status_counts = {
        'Open': Task.query.filter_by(status='Open').count(),
        'In Progress': Task.query.filter_by(status='In Progress').count(),
        'Blocked': Task.query.filter_by(status='Blocked').count(),
        'Completed': Task.query.filter_by(status='Completed').count()
    }
    return jsonify(status_counts)

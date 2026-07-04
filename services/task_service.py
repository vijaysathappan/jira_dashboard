from models import db, Task, DailyUpdate, Comment, Notification, User, Attachment
from datetime import datetime
import os

def generate_task_id():
    last_task = Task.query.order_by(Task.id.desc()).first()
    if last_task:
        last_id = int(last_task.task_id.split('-')[1])
        return f"WT-{last_id + 1}"
    return "WT-1"

def create_task(data, manager_id):
    new_task = Task(
        task_id=generate_task_id(),
        title=data['title'],
        description=data['description'],
        assigned_by=manager_id,
        assigned_to=data['assigned_to'],
        priority=data['priority'],
        status='Open',
        project=data['project'],
        task_type=data.get('task_type', 'Task'),
        labels=data.get('labels', ''),
        sprint=data.get('sprint', ''),
        due_date=data['due_date'],
        estimated_hours=data.get('estimated_hours', 0.0)
    )
    db.session.add(new_task)
    db.session.commit()
    
    # Notify employee
    create_notification(new_task.assigned_to, f"You have been assigned a new task: {new_task.title}")
    return new_task

def update_task(task_id, data):
    task = Task.query.get(task_id)
    if task:
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.assigned_to = data.get('assigned_to', task.assigned_to)
        task.priority = data.get('priority', task.priority)
        
        # If status changed to completed
        if data.get('status') == 'Completed' and task.status != 'Completed':
            task.completion_percentage = 100
            create_notification(task.assigned_by, f"Task Completed: {task.title}")
            
        task.status = data.get('status', task.status)
        task.project = data.get('project', task.project)
        task.task_type = data.get('task_type', task.task_type)
        task.labels = data.get('labels', task.labels)
        task.sprint = data.get('sprint', task.sprint)
        task.due_date = data.get('due_date', task.due_date)
        task.estimated_hours = data.get('estimated_hours', task.estimated_hours)
        db.session.commit()
    return task

def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        db.session.delete(task)
        db.session.commit()
        return True
    return False

def add_daily_update(task_id, employee_id, data):
    update = DailyUpdate(
        task_id=task_id,
        employee_id=employee_id,
        date=data['date'],
        description=data['description'],
        hours=data['hours'],
        completion=data['completion'],
        blockers=data.get('blockers', '')
    )
    db.session.add(update)
    
    # Update task progress
    task = Task.query.get(task_id)
    task.actual_hours += float(data['hours'])
    task.completion_percentage = int(data['completion'])
    if task.completion_percentage == 100:
        task.status = 'Completed'
    elif task.status == 'Open':
        task.status = 'In Progress'
        
    db.session.commit()
    
    # Notify manager
    create_notification(task.assigned_by, f"New daily update on task: {task.title} by {task.assignee.name}")
    return update

def add_comment(task_id, user_id, comment_text):
    comment = Comment(
        task_id=task_id,
        user_id=user_id,
        comment=comment_text
    )
    db.session.add(comment)
    db.session.commit()
    
    task = Task.query.get(task_id)
    # Notify the other person
    notify_user_id = task.assigned_by if user_id == task.assigned_to else task.assigned_to
    create_notification(notify_user_id, f"New comment on task {task.task_id} from {User.query.get(user_id).name}")
    return comment

def create_notification(user_id, message):
    notif = Notification(user_id=user_id, message=message)
    db.session.add(notif)
    db.session.commit()
    return notif

def save_attachment(task_id, file, upload_folder):
    if file:
        filename = file.filename
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        attachment = Attachment(
            task_id=task_id,
            filename=filename,
            filepath=f"uploads/{filename}" # Relative path for static files
        )
        db.session.add(attachment)
        db.session.commit()
        return attachment
    return None

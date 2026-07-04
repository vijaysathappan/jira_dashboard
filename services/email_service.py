from flask_mail import Message
from flask import render_template, current_app
from app import mail
import threading

def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            print(f"Error sending email: {e}")

def send_email(subject, recipient, template, **kwargs):
    app = current_app._get_current_object()
    msg = Message(subject,
                  sender=app.config['MAIL_DEFAULT_SENDER'],
                  recipients=[recipient])
    msg.html = render_template(template, **kwargs)
    
    # Send email asynchronously so it doesn't block the request
    thr = threading.Thread(target=send_async_email, args=[app, msg])
    thr.start()
    return thr

def send_task_assigned_email(task):
    send_email(
        subject=f"New Task Assigned: {task.title}",
        recipient=task.assignee.email,
        template="emails/task_assigned.html",
        task=task
    )

def send_task_completed_email(task):
    send_email(
        subject=f"Task Completed: {task.title}",
        recipient=task.assigner.email,
        template="emails/task_completed.html",
        task=task
    )

def send_help_email(employee, manager, subject, description):
    send_email(
        subject=f"Help Needed: {subject}",
        recipient=manager.email,
        template="emails/help_needed.html",
        employee=employee,
        description=description
    )

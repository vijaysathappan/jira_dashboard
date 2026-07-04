# WorkTrack Pro

An Enterprise Work Tracking System similar to JIRA.

## Features
* **Role-Based Access Control:** Manager and Employee roles.
* **Manager Dashboard:** Charts, overviews, all tasks, quick creation.
* **Employee Dashboard:** Personalized tasks, timeline, daily progress updates.
* **Task Management:** Create, Update, Delete, Assign, Priorities, Statuses, Timelines.
* **Interactions:** Daily updates with progress tracking, Comments.
* **Attachments:** Upload files (PDF, Image, Word, Excel) to tasks.
* **Notifications & Email:** In-app notifications and asynchronous email sending for assignments and completions.
* **Responsive Enterprise UI:** Modern dark sidebar with light content layout using Bootstrap 5 and Chart.js.

## Folder Structure

```
project/
├── app.py
├── config.py
├── requirements.txt
├── README.md
├── models.py
├── forms.py
├── routes.py
├── services/
│   ├── auth_service.py
│   ├── database.py
│   ├── email_service.py
│   └── task_service.py
├── instance/
│   └── database.db
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   └── uploads/
└── templates/
    ├── base.html
    ├── login.html
    ├── manager_dashboard.html
    ├── employee_dashboard.html
    ├── task_details.html
    ├── task_create.html
    ├── task_update.html
    ├── help.html
    └── emails/
        ├── task_assigned.html
        ├── task_completed.html
        └── help_needed.html
```

## Installation

1. Make sure Python 3.8+ is installed.
2. Clone or navigate to the directory.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration (Optional)
By default, the application runs on SQLite (`instance/database.db`) and uses dummy credentials for SMTP email sending.
To enable real email notifications, update the following environment variables (or hardcode them in `config.py`):
* `MAIL_SERVER` (e.g., smtp.gmail.com)
* `MAIL_PORT` (e.g., 587)
* `MAIL_USERNAME`
* `MAIL_PASSWORD`
* `MAIL_DEFAULT_SENDER`

## Run

Run the application:
```bash
python app.py
```

The database will be automatically created and seeded on the first run.

## Demo Users

The database is seeded with the following users:

**Manager**
* Email: `manager@company.com`
* Password: `admin123`

**Employees** (All use password: `employee123`)
* `devi@company.com`
* `nisha@company.com`
* `arul@company.com`
* `uv@company.com`
* `jawwy@company.com`
* `hema@company.com`
* `gp@company.com`

## Access the App
Go to `http://localhost:5000` in your web browser.

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, SelectField, FloatField, IntegerField, DateField, FileField
from wtforms.validators import DataRequired, Email, Length, NumberRange, Optional

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')

class TaskForm(FlaskForm):
    title = StringField('Task Title', validators=[DataRequired(), Length(min=2, max=200)])
    description = TextAreaField('Description', validators=[DataRequired()])
    project = StringField('Project Name', validators=[DataRequired(), Length(min=2, max=100)])
    assigned_to = SelectField('Assign To', coerce=int, validators=[DataRequired()])
    priority = SelectField('Priority', choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High'), ('Critical', 'Critical')], validators=[DataRequired()])
    status = SelectField('Status', choices=[('Open', 'Open'), ('In Progress', 'In Progress'), ('Blocked', 'Blocked'), ('Completed', 'Completed')], validators=[DataRequired()])
    due_date = DateField('Due Date', format='%Y-%m-%d', validators=[DataRequired()])
    estimated_hours = FloatField('Estimated Hours', validators=[Optional(), NumberRange(min=0)])
    submit = SubmitField('Save Task')

class DailyUpdateForm(FlaskForm):
    date = DateField('Date', format='%Y-%m-%d', validators=[DataRequired()])
    hours = FloatField('Worked Hours', validators=[DataRequired(), NumberRange(min=0.1, max=24.0)])
    description = TextAreaField('Description', validators=[DataRequired()])
    completion = IntegerField('Completion %', validators=[DataRequired(), NumberRange(min=0, max=100)])
    blockers = TextAreaField('Blockers (Optional)')
    submit = SubmitField('Save Update')

class CommentForm(FlaskForm):
    comment = TextAreaField('Comment', validators=[DataRequired()])
    submit = SubmitField('Post Comment')

class AttachmentForm(FlaskForm):
    file = FileField('Upload File (Image, PDF, Excel, Word)', validators=[DataRequired()])
    submit = SubmitField('Upload')

class EmailManagerForm(FlaskForm):
    subject = StringField('Subject', validators=[DataRequired(), Length(max=150)])
    description = TextAreaField('Description', validators=[DataRequired()])
    submit = SubmitField('Send Email')

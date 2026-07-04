from models import User
from app import login_manager, bcrypt



def authenticate_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        return user
    return None

def change_user_password(user, new_password):
    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    return True

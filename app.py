import os
from flask import Flask
from config import Config
from models import db
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail

from flask_cors import CORS

# Initialize extensions
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = 'main.login'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with app
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)

    # Make sure upload folder exists
    try:
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        if not os.environ.get('VERCEL'):
            os.makedirs(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance'), exist_ok=True)
    except OSError:
        pass

    with app.app_context():
        from routes import main as main_blueprint
        app.register_blueprint(main_blueprint)
        
        # Create database tables if they don't exist
        db.create_all()

        # Seed the database
        from services.database import seed_database
        seed_database()

    # Serve React Frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        from flask import send_from_directory
        
        dist_dir = os.path.join(app.root_path, 'frontend', 'dist')
        if not os.path.exists(dist_dir):
            return "Frontend not built yet. Run 'npm run build' in frontend directory.", 404

        if path != "" and os.path.exists(os.path.join(dist_dir, path)):
            return send_from_directory(dist_dir, path)
        else:
            return send_from_directory(dist_dir, 'index.html')

    return app

# Expose the app instance for WSGI/Serverless deployments (like Vercel)
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

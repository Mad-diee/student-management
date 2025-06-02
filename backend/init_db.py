from app import create_app, db
from app.models.user import User, UserRole

def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if admin user exists
        admin = User.query.filter_by(email='admin@gmail.com').first()
        if not admin:
            # Create admin user
            admin = User(email='admin@gmail.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.flush()
            
            # Create admin role
            admin_role = UserRole(user_id=admin.id, role='admin')
            db.session.add(admin_role)
            
            db.session.commit()
            print("Admin user created successfully!")
        else:
            print("Admin user already exists!")

if __name__ == '__main__':
    init_db() 
from app import create_app, db
from app.models.user import User, UserRole

def recreate_admin():
    app = create_app()
    with app.app_context():
        # Delete existing admin user and role
        admin = User.query.filter_by(email='admin@gmail.com').first()
        if admin:
            UserRole.query.filter_by(user_id=admin.id).delete()
            db.session.delete(admin)
            db.session.commit()
            print("Deleted existing admin user")
        
        # Create new admin user
        admin = User(email='admin@gmail.com')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.flush()
        
        # Create admin role
        admin_role = UserRole(user_id=admin.id, role='admin')
        db.session.add(admin_role)
        
        db.session.commit()
        print("Created new admin user with hashed password")

if __name__ == '__main__':
    recreate_admin() 
from app import create_app, db
from app.models.user import User, UserRole
from sqlalchemy import text

def recreate_db():
    app = create_app()
    with app.app_context():
        # Drop all tables with CASCADE
        db.session.execute(text('DROP SCHEMA public CASCADE;'))
        db.session.execute(text('CREATE SCHEMA public;'))
        db.session.commit()
        print("Dropped all tables")
        
        # Create all tables
        db.create_all()
        print("Created all tables")
        
        # Create admin user
        admin = User(email='admin@gmail.com')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.flush()
        
        # Create admin role
        admin_role = UserRole(user_id=admin.id, role='admin')
        db.session.add(admin_role)
        
        db.session.commit()
        print("Created admin user with hashed password")

if __name__ == '__main__':
    recreate_db() 
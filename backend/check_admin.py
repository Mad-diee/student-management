from app import create_app, db
from app.models.user import User, UserRole

def check_admin():
    app = create_app()
    with app.app_context():
        admin = User.query.filter_by(email='admin@gmail.com').first()
        if admin:
            print("Admin user found:")
            print(f"ID: {admin.id}")
            print(f"Email: {admin.email}")
            print(f"Password hash: {admin.password}")
            
            # Check role
            role = UserRole.query.filter_by(user_id=admin.id).first()
            if role:
                print(f"Role: {role.role}")
            else:
                print("No role found!")
        else:
            print("Admin user not found!")

if __name__ == '__main__':
    check_admin() 
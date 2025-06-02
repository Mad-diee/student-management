from app.models.user import User, UserRole
from app.models.student import Student
from app import db
from flask_jwt_extended import create_access_token

class AuthService:
    @staticmethod
    def login(data):
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            raise ValueError('Email and password are required')
        
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            raise ValueError('Invalid email or password')
        
        # Get user role
        user_role = UserRole.query.filter_by(user_id=user.id).first()
        if not user_role:
            raise ValueError('User role not found')
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return {
            'data': {
                'user': user.to_dict(),
                'token': access_token,
                'role': user_role.role
            }
        }
    
    @staticmethod
    def register(data):
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')
        
        if not email or not password:
            raise ValueError('Email and password are required')
        
        if User.query.filter_by(email=email).first():
            raise ValueError('Email already registered')
        
        # Create user
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create user role
        user_role = UserRole(user_id=user.id, role=role)
        db.session.add(user_role)
        
        # If role is student, create student record
        if role == 'student':
            student = Student(
                user_id=user.id,
                name=data.get('name'),
                registered_number=data.get('registered_number'),
                year_of_admission=data.get('year_of_admission'),
                campus_id=data.get('campus_id'),
                course_id=data.get('course_id'),
                major_id=data.get('major_id'),
                department_id=data.get('department_id'),
                mobile=data.get('mobile'),
                personal_email=data.get('personal_email'),
                emergency_contact=data.get('emergency_contact'),
                present_address=data.get('present_address'),
                permanent_address=data.get('permanent_address')
            )
            db.session.add(student)
        
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return {
            'data': {
                'user': user.to_dict(),
                'token': access_token,
                'role': role
            }
        } 
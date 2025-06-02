from app.models.staff import Staff
from app.models.user import User, UserRole
from app import db
import bcrypt
import uuid

class StaffService:
    @staticmethod
    def get_staff_members(campus_id=None, department_id=None):
        query = Staff.query
        if campus_id:
            query = query.filter_by(campus_id=campus_id)
        if department_id:
            query = query.filter_by(department_id=department_id)
        staff_members = query.all()
        return [staff.to_dict() for staff in staff_members]
    
    @staticmethod
    def get_staff_member(staff_id):
        staff = Staff.query.get_or_404(staff_id)
        return staff.to_dict()
    
    @staticmethod
    def create_staff_member(data):
        email = data.get('email')
        full_name = data.get('full_name')
        department_id = data.get('department_id')
        campus_id = data.get('campus_id')
        designation = data.get('designation')
        mobile = data.get('mobile')
        
        if not email or not full_name or not department_id or not campus_id or not designation or not mobile:
             raise ValueError('Missing required staff fields')

        temp_password = str(uuid.uuid4())
        user = User(email=email)
        user.set_password(temp_password)
        db.session.add(user)
        db.session.flush()

        user_role = UserRole(user_id=user.id, role='admin')
        db.session.add(user_role)
        
        staff = Staff(
            user_id=user.id,
            full_name=full_name,
            department_id=department_id,
            campus_id=campus_id,
            designation=designation,
            mobile=mobile,
            email=email
        )
        db.session.add(staff)
        
        db.session.commit()
        
        return staff.to_dict()
    
    @staticmethod
    def update_staff_member(staff_id, data):
        staff = Staff.query.get_or_404(staff_id)
        
        for key, value in data.items():
            if hasattr(staff, key) and key != 'user_id':
                setattr(staff, key, value)
                
        if 'email' in data and staff.user:
            staff.user.email = data['email']
        
        db.session.commit()
        return staff.to_dict()
    
    @staticmethod
    def delete_staff_member(staff_id):
        staff = Staff.query.get_or_404(staff_id)
        user_id = staff.user_id
        db.session.delete(staff)
        
        UserRole.query.filter_by(user_id=user_id).delete()
        User.query.filter_by(id=user_id).delete()
        
        db.session.commit()
        return {'message': 'Staff member and associated user deleted successfully'} 
from app.models.department import Department
from app import db

class DepartmentService:
    @staticmethod
    def get_departments(campus_id=None):
        query = Department.query
        if campus_id:
            query = query.filter_by(campus_id=campus_id)
        departments = query.all()
        return [dept.to_dict() for dept in departments]
    
    @staticmethod
    def get_department(department_id):
        department = Department.query.get_or_404(department_id)
        return department.to_dict()
    
    @staticmethod
    def create_department(data):
        department = Department(**data)
        db.session.add(department)
        db.session.commit()
        return department.to_dict()
    
    @staticmethod
    def update_department(department_id, data):
        department = Department.query.get_or_404(department_id)
        
        for key, value in data.items():
            if hasattr(department, key):
                setattr(department, key, value)
        
        db.session.commit()
        return department.to_dict()
    
    @staticmethod
    def delete_department(department_id):
        department = Department.query.get_or_404(department_id)
        db.session.delete(department)
        db.session.commit()
        return {'message': 'Department deleted successfully'} 
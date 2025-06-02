from app.models.student import Student
from app import db
from sqlalchemy.orm import joinedload
from app.models.privacy_setting import PrivacySetting

class StudentService:
    @staticmethod
    def get_students(filters=None):
        query = Student.query.options(
            joinedload(Student.department),
            joinedload(Student.major),
            joinedload(Student.course),
            joinedload(Student.campus)
        )
        
        if filters:
            if 'campus_id' in filters:
                query = query.filter_by(campus_id=filters['campus_id'])
            if 'department_id' in filters:
                query = query.filter_by(department_id=filters['department_id'])
            if 'course_id' in filters:
                query = query.filter_by(course_id=filters['course_id'])
            if 'major_id' in filters:
                query = query.filter_by(major_id=filters['major_id'])
            if 'is_alumnus' in filters:
                query = query.filter_by(is_alumnus=filters['is_alumnus'])
        
        students = query.all()
        return [student.to_dict() for student in students]
    
    @staticmethod
    def get_student(student_id):
        student = Student.query.options(
            joinedload(Student.department),
            joinedload(Student.major),
            joinedload(Student.course),
            joinedload(Student.campus)
        ).get_or_404(student_id)
        return student.to_dict()
    
    @staticmethod
    def create_student(data):
        student = Student(**data)
        db.session.add(student)
        db.session.commit()
        # Create default privacy settings for the new student
        FIELDS = [
            "name", "registered_number", "year_of_admission", "mobile", "personal_email",
            "emergency_contact", "present_address", "permanent_address", "photo_url"
        ]
        for field in FIELDS:
            setting = PrivacySetting(user_id=student.user_id, field_name=field, is_private=False)
            db.session.add(setting)
        db.session.commit()
        return student.to_dict()
    
    @staticmethod
    def update_student(student_id, data):
        student = Student.query.get_or_404(student_id)
        
        for key, value in data.items():
            if hasattr(student, key):
                setattr(student, key, value)
        
        db.session.commit()
        return student.to_dict()
    
    @staticmethod
    def delete_student(student_id):
        student = Student.query.get_or_404(student_id)
        db.session.delete(student)
        db.session.commit()
        return {'message': 'Student deleted successfully'}
    
    @staticmethod
    def search_students(criteria=None):
        query = Student.query.options(
            joinedload(Student.department),
            joinedload(Student.major),
            joinedload(Student.course),
            joinedload(Student.campus)
        )
        if criteria:
            if 'campus_id' in criteria and criteria['campus_id']:
                query = query.filter_by(campus_id=criteria['campus_id'])
            if 'department_id' in criteria and criteria['department_id']:
                query = query.filter_by(department_id=criteria['department_id'])
            if 'course_id' in criteria and criteria['course_id']:
                query = query.filter_by(course_id=criteria['course_id'])
            if 'major_id' in criteria and criteria['major_id']:
                query = query.filter_by(major_id=criteria['major_id'])
            if 'search_term' in criteria and criteria['search_term']:
                term = f"%{criteria['search_term']}%"
                query = query.filter(
                    (Student.name.ilike(term)) |
                    (Student.registered_number.ilike(term))
                )
        # Exclude alumni/removed students
        if hasattr(Student, 'is_alumnus'):
            query = query.filter_by(is_alumnus=False)
        if hasattr(Student, 'removed'):
            query = query.filter_by(removed=False)
        students = query.all()
        return [student.to_dict() for student in students] 
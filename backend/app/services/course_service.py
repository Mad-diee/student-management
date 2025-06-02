from app.models.course import Course
from app import db

class CourseService:
    @staticmethod
    def get_courses():
        courses = Course.query.all()
        return [course.to_dict() for course in courses]
    
    @staticmethod
    def get_course(course_id):
        course = Course.query.get_or_404(course_id)
        return course.to_dict()
    
    @staticmethod
    def create_course(data):
        course = Course(**data)
        db.session.add(course)
        db.session.commit()
        return course.to_dict()
    
    @staticmethod
    def update_course(course_id, data):
        course = Course.query.get_or_404(course_id)
        
        for key, value in data.items():
            if hasattr(course, key):
                setattr(course, key, value)
        
        db.session.commit()
        return course.to_dict()
    
    @staticmethod
    def delete_course(course_id):
        course = Course.query.get_or_404(course_id)
        db.session.delete(course)
        db.session.commit()
        return {'message': 'Course deleted successfully'} 
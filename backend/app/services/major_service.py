from app.models.major import Major
from app import db

class MajorService:
    @staticmethod
    def get_majors():
        majors = Major.query.all()
        return [major.to_dict() for major in majors]
    
    @staticmethod
    def get_major(major_id):
        major = Major.query.get_or_404(major_id)
        return major.to_dict()
    
    @staticmethod
    def create_major(data):
        major = Major(**data)
        db.session.add(major)
        db.session.commit()
        return major.to_dict()
    
    @staticmethod
    def update_major(major_id, data):
        major = Major.query.get_or_404(major_id)
        
        for key, value in data.items():
            if hasattr(major, key):
                setattr(major, key, value)
        
        db.session.commit()
        return major.to_dict()
    
    @staticmethod
    def delete_major(major_id):
        major = Major.query.get_or_404(major_id)
        db.session.delete(major)
        db.session.commit()
        return {'message': 'Major deleted successfully'} 
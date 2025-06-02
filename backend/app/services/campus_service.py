from app.models.campus import Campus
from app import db

class CampusService:
    @staticmethod
    def get_campuses():
        campuses = Campus.query.all()
        return [campus.to_dict() for campus in campuses]
    
    @staticmethod
    def get_campus(campus_id):
        campus = Campus.query.get_or_404(campus_id)
        return campus.to_dict()
    
    @staticmethod
    def create_campus(data):
        campus = Campus(**data)
        db.session.add(campus)
        db.session.commit()
        return campus.to_dict()
    
    @staticmethod
    def update_campus(campus_id, data):
        campus = Campus.query.get_or_404(campus_id)
        
        for key, value in data.items():
            if hasattr(campus, key):
                setattr(campus, key, value)
        
        db.session.commit()
        return campus.to_dict()
    
    @staticmethod
    def delete_campus(campus_id):
        campus = Campus.query.get_or_404(campus_id)
        db.session.delete(campus)
        db.session.commit()
        return {'message': 'Campus deleted successfully'} 
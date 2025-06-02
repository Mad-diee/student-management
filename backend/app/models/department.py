from app import db
from datetime import datetime
import uuid

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    campus_id = db.Column(db.String(36), db.ForeignKey('campuses.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    campus = db.relationship('Campus', backref='departments')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'campus': self.campus.to_dict() if self.campus else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 
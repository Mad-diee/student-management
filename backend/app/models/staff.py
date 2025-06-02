from app import db
from datetime import datetime
import uuid

class Staff(db.Model):
    __tablename__ = 'staff'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    department_id = db.Column(db.String(36), db.ForeignKey('departments.id'))
    campus_id = db.Column(db.String(36), db.ForeignKey('campuses.id'))
    designation = db.Column(db.String(100))
    mobile = db.Column(db.String(20))
    email = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    department = db.relationship('Department', backref='staff_members')
    campus = db.relationship('Campus', backref='staff_members')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'department': self.department.to_dict() if self.department else None,
            'campus': self.campus.to_dict() if self.campus else None,
            'designation': self.designation,
            'mobile': self.mobile,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 
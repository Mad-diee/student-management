from app import db
from datetime import datetime
import uuid

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    registered_number = db.Column(db.String(20), unique=True)
    year_of_admission = db.Column(db.Integer)
    campus_id = db.Column(db.String(36), db.ForeignKey('campuses.id'))
    course_id = db.Column(db.String(36), db.ForeignKey('courses.id'))
    major_id = db.Column(db.String(36), db.ForeignKey('majors.id'))
    department_id = db.Column(db.String(36), db.ForeignKey('departments.id'))
    mobile = db.Column(db.String(20))
    personal_email = db.Column(db.String(120))
    emergency_contact = db.Column(db.String(20))
    present_address = db.Column(db.Text)
    permanent_address = db.Column(db.Text)
    photo_url = db.Column(db.Text)
    is_alumnus = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    campus = db.relationship('Campus', backref='students')
    course = db.relationship('Course', backref='students')
    major = db.relationship('Major', backref='students')
    department = db.relationship('Department', backref='students')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'registered_number': self.registered_number,
            'year_of_admission': self.year_of_admission,
            'campus': self.campus.to_dict() if self.campus else None,
            'course': self.course.to_dict() if self.course else None,
            'major': self.major.to_dict() if self.major else None,
            'department': self.department.to_dict() if self.department else None,
            'mobile': self.mobile,
            'personal_email': self.personal_email,
            'emergency_contact': self.emergency_contact,
            'present_address': self.present_address,
            'permanent_address': self.permanent_address,
            'photo_url': self.photo_url,
            'is_alumnus': self.is_alumnus,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 
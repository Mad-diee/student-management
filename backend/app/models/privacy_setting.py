from app import db
from datetime import datetime

class PrivacySetting(db.Model):
    __tablename__ = 'privacy_settings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    field_name = db.Column(db.String(50), nullable=False)
    is_private = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'field_name': self.field_name,
            'is_private': self.is_private,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 
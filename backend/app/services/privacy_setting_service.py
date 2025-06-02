from app import db
from app.models.privacy_setting import PrivacySetting
from datetime import datetime
from sqlalchemy.dialects.postgresql import insert
from app.models.student import Student

class PrivacySettingService:
    @staticmethod
    def get_privacy_settings(user_id):
        settings = PrivacySetting.query.filter_by(user_id=user_id).all()
        return [setting.to_dict() for setting in settings]
    
    @staticmethod
    def get_privacy_setting(setting_id):
        setting = PrivacySetting.query.get(setting_id)
        if not setting:
            raise ValueError('Privacy setting not found')
        return setting.to_dict()
    
    @staticmethod
    def create_privacy_setting(data):
        stmt = insert(PrivacySetting).values(
            user_id=data['user_id'],
            field_name=data['field_name'],
            is_private=data.get('is_private', False),
            created_at=datetime.utcnow()
        ).on_conflict_do_update(
            index_elements=['user_id', 'field_name'],
            set_={
                'is_private': data.get('is_private', False),
                'created_at': datetime.utcnow()
            }
        )
        db.session.execute(stmt)
        db.session.commit()
        # Return the upserted/updated record
        setting = PrivacySetting.query.filter_by(user_id=data['user_id'], field_name=data['field_name']).first()
        return setting.to_dict() if setting else None
    
    @staticmethod
    def update_privacy_setting(setting_id, data):
        setting = PrivacySetting.query.get(setting_id)
        if not setting:
            raise ValueError('Privacy setting not found')
        
        if 'is_private' in data:
            setting.is_private = data['is_private']
        
        db.session.commit()
        return setting.to_dict()
    
    @staticmethod
    def delete_privacy_setting(setting_id):
        setting = PrivacySetting.query.get(setting_id)
        if not setting:
            raise ValueError('Privacy setting not found')
        
        db.session.delete(setting)
        db.session.commit()
        return {'message': 'Privacy setting deleted successfully'}
    
    @staticmethod
    def update_multiple_settings(user_id, settings_data):
        for setting_data in settings_data:
            stmt = insert(PrivacySetting).values(
                user_id=user_id,
                field_name=setting_data['field_name'],
                is_private=setting_data['is_private'],
                created_at=datetime.utcnow()
            ).on_conflict_do_update(
                index_elements=['user_id', 'field_name'],
                set_={
                    'is_private': setting_data['is_private'],
                    'created_at': datetime.utcnow()
                }
            )
            db.session.execute(stmt)
        
        db.session.commit()
        return {'message': 'Privacy settings updated successfully'}
    
    @staticmethod
    def get_privacy_settings_by_student(student_id):
        student = Student.query.get(student_id)
        if not student:
            return []
        settings = PrivacySetting.query.filter_by(user_id=student.user_id).all()
        return [setting.to_dict() for setting in settings] 
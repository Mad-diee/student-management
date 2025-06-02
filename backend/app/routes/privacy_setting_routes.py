from flask import Blueprint, request, jsonify
from app.services.privacy_setting_service import PrivacySettingService
from app.utils.decorators import handle_exceptions, login_required
from flask_jwt_extended import get_jwt_identity
from app.models.privacy_setting import PrivacySetting
from app import db

privacy_bp = Blueprint('privacy', __name__)

@privacy_bp.route('/api/privacy-settings', methods=['GET'])
@handle_exceptions
@login_required
def get_privacy_settings():
    user_id = request.user.id
    settings = PrivacySettingService.get_privacy_settings(user_id)
    return jsonify(settings)

@privacy_bp.route('/api/privacy-settings/<setting_id>', methods=['GET'])
@handle_exceptions
@login_required
def get_privacy_setting(setting_id):
    setting = PrivacySettingService.get_privacy_setting(setting_id)
    return jsonify(setting)

@privacy_bp.route('/api/privacy-settings', methods=['POST'])
@handle_exceptions
@login_required
def create_privacy_setting():
    data = request.get_json()
    data['user_id'] = get_jwt_identity()
    setting = PrivacySettingService.create_privacy_setting(data)
    return jsonify(setting), 201

@privacy_bp.route('/api/privacy-settings/<setting_id>', methods=['PUT'])
@handle_exceptions
@login_required
def update_privacy_setting(setting_id):
    data = request.get_json()
    setting = PrivacySettingService.update_privacy_setting(setting_id, data)
    return jsonify(setting)

@privacy_bp.route('/api/privacy-settings/<setting_id>', methods=['DELETE'])
@handle_exceptions
@login_required
def delete_privacy_setting(setting_id):
    result = PrivacySettingService.delete_privacy_setting(setting_id)
    return jsonify(result)

@privacy_bp.route('/api/privacy-settings/bulk', methods=['PUT'])
@handle_exceptions
@login_required
def update_multiple_settings():
    data = request.get_json()
    user_id = get_jwt_identity()
    result = PrivacySettingService.update_multiple_settings(user_id, data)
    return jsonify(result)

@privacy_bp.route('/api/privacy-settings/student/<student_id>', methods=['GET', 'OPTIONS'])
@handle_exceptions
def get_privacy_settings_by_student(student_id):
    if request.method == 'OPTIONS':
        return '', 204
    settings = PrivacySettingService.get_privacy_settings_by_student(student_id)
    return jsonify(settings)

@privacy_bp.route('/api/privacy-settings/by-user-field', methods=['PUT'])
@handle_exceptions
@login_required
def update_privacy_setting_by_user_and_field():
    data = request.get_json()
    user_id = data.get('user_id')
    field_name = data.get('field_name')
    if user_id is None or field_name is None:
        return jsonify({'error': 'user_id and field_name are required'}), 400
    setting = PrivacySetting.query.filter_by(user_id=user_id, field_name=field_name).first()
    if not setting:
        # Create the privacy setting if it doesn't exist
        setting = PrivacySetting(user_id=user_id, field_name=field_name, is_private=data.get('is_private', False))
        db.session.add(setting)
    else:
        if 'is_private' in data:
            setting.is_private = data['is_private']
    db.session.commit()
    return jsonify(setting.to_dict())

# New route to get privacy settings by user ID
@privacy_bp.route('/api/privacy-settings/by-user/<user_id>', methods=['GET'])
@handle_exceptions
@login_required
def get_privacy_settings_by_user(user_id):
    # Optional: Add a check here to ensure the logged-in user matches the requested user_id
    # from flask_jwt_extended import get_jwt_identity
    # if str(get_jwt_identity()) != user_id:
    #     return jsonify({'error': 'Unauthorized'}), 403

    settings = PrivacySettingService.get_privacy_settings(user_id) # This method already queries by user_id
    return jsonify(settings) 
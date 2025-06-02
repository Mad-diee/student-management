from flask import Blueprint, request, jsonify
from app.services.major_service import MajorService
from app.utils.decorators import handle_exceptions, admin_required, require_auth

major_bp = Blueprint('major', __name__)

@major_bp.route('/api/majors', methods=['GET'])
@handle_exceptions
def get_majors():
    majors = MajorService.get_majors()
    return jsonify({'data': majors})

@major_bp.route('/api/majors/<major_id>', methods=['GET'])
@handle_exceptions
def get_major(major_id):
    major = MajorService.get_major(major_id)
    return jsonify({'data': major})

@major_bp.route('/api/majors', methods=['POST'])
@handle_exceptions
@require_auth
@admin_required
def create_major():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    major = MajorService.create_major(data)
    return jsonify({'data': major}), 201

@major_bp.route('/api/majors/<major_id>', methods=['PUT'])
@handle_exceptions
@require_auth
@admin_required
def update_major(major_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    major = MajorService.update_major(major_id, data)
    return jsonify({'data': major})

@major_bp.route('/api/majors/<major_id>', methods=['DELETE'])
@handle_exceptions
@require_auth
@admin_required
def delete_major(major_id):
    result = MajorService.delete_major(major_id)
    return jsonify(result) 
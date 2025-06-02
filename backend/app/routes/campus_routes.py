from flask import Blueprint, request, jsonify
from app.services.campus_service import CampusService
from app.utils.decorators import handle_exceptions, admin_required, require_auth

campus_bp = Blueprint('campus', __name__)

@campus_bp.route('/api/campuses', methods=['GET'])
@handle_exceptions
def get_campuses():
    campuses = CampusService.get_campuses()
    return jsonify({'data': campuses})

@campus_bp.route('/api/campuses/<campus_id>', methods=['GET'])
@handle_exceptions
def get_campus(campus_id):
    campus = CampusService.get_campus(campus_id)
    return jsonify({'data': campus})

@campus_bp.route('/api/campuses', methods=['POST'])
@handle_exceptions
@require_auth
@admin_required
def create_campus():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    campus = CampusService.create_campus(data)
    return jsonify({'data': campus}), 201

@campus_bp.route('/api/campuses/<campus_id>', methods=['PUT'])
@handle_exceptions
@require_auth
@admin_required
def update_campus(campus_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    campus = CampusService.update_campus(campus_id, data)
    return jsonify({'data': campus})

@campus_bp.route('/api/campuses/<campus_id>', methods=['DELETE'])
@handle_exceptions
@require_auth
@admin_required
def delete_campus(campus_id):
    result = CampusService.delete_campus(campus_id)
    return jsonify(result) 
from flask import Blueprint, request, jsonify
from app.services.department_service import DepartmentService
from app.utils.decorators import handle_exceptions, admin_required, require_auth

department_bp = Blueprint('department', __name__)

@department_bp.route('/api/departments', methods=['GET'])
@handle_exceptions
def get_departments():
    campus_id = request.args.get('campus_id')
    departments = DepartmentService.get_departments(campus_id)
    return jsonify({'data': departments})

@department_bp.route('/api/departments/<department_id>', methods=['GET'])
@handle_exceptions
def get_department(department_id):
    department = DepartmentService.get_department(department_id)
    return jsonify({'data': department})

@department_bp.route('/api/departments', methods=['POST'])
@handle_exceptions
@require_auth
@admin_required
def create_department():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    department = DepartmentService.create_department(data)
    return jsonify({'data': department}), 201

@department_bp.route('/api/departments/<department_id>', methods=['PUT'])
@handle_exceptions
@require_auth
@admin_required
def update_department(department_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    department = DepartmentService.update_department(department_id, data)
    return jsonify({'data': department})

@department_bp.route('/api/departments/<department_id>', methods=['DELETE'])
@handle_exceptions
@require_auth
@admin_required
def delete_department(department_id):
    result = DepartmentService.delete_department(department_id)
    return jsonify(result) 
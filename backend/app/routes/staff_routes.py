from flask import Blueprint, request, jsonify
from app.services.staff_service import StaffService
from app.utils.decorators import handle_exceptions, admin_required

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/api/staff', methods=['GET'])
@handle_exceptions
def get_staff_members():
    campus_id = request.args.get('campus_id')
    department_id = request.args.get('department_id')
    staff_members = StaffService.get_staff_members(campus_id, department_id)
    return jsonify({'data': staff_members})

@staff_bp.route('/api/staff/<staff_id>', methods=['GET'])
@handle_exceptions
def get_staff_member(staff_id):
    staff = StaffService.get_staff_member(staff_id)
    return jsonify({'data': staff})

@staff_bp.route('/api/staff', methods=['POST'])
@handle_exceptions
@admin_required
def create_staff_member():
    data = request.get_json()
    if not data:
         return jsonify({'error': 'No input data provided'}), 400
    staff = StaffService.create_staff_member(data)
    return jsonify({'data': staff}), 201

@staff_bp.route('/api/staff/<staff_id>', methods=['PUT'])
@handle_exceptions
@admin_required
def update_staff_member(staff_id):
    data = request.get_json()
    if not data:
         return jsonify({'error': 'No input data provided'}), 400
    staff = StaffService.update_staff_member(staff_id, data)
    return jsonify({'data': staff})

@staff_bp.route('/api/staff/<staff_id>', methods=['DELETE'])
@handle_exceptions
@admin_required
def delete_staff_member(staff_id):
    result = StaffService.delete_staff_member(staff_id)
    return jsonify(result) 
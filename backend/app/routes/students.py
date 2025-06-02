from flask import Blueprint, request, jsonify
from app.services.student_service import StudentService
from app.utils.decorators import handle_exceptions, require_auth

students_bp = Blueprint('students', __name__)

@students_bp.route('/api/students', methods=['GET'])
@handle_exceptions
def get_students():
    filters = request.args.to_dict()
    result = StudentService.get_students(filters)
    return jsonify({'data': result})

@students_bp.route('/api/students/<student_id>', methods=['GET'])
@handle_exceptions
def get_student(student_id):
    result = StudentService.get_student(student_id)
    return jsonify({'data': result})

@students_bp.route('/api/students', methods=['POST'])
@handle_exceptions
@require_auth
def create_student():
    data = request.get_json()
    result = StudentService.create_student(data)
    return jsonify(result)

@students_bp.route('/api/students/<student_id>', methods=['PUT'])
@handle_exceptions
@require_auth
def update_student(student_id):
    data = request.get_json()
    result = StudentService.update_student(student_id, data)
    return jsonify(result)

@students_bp.route('/api/students/<student_id>', methods=['DELETE'])
@handle_exceptions
@require_auth
def delete_student(student_id):
    result = StudentService.delete_student(student_id)
    return jsonify(result)

@students_bp.route('/api/students/search', methods=['POST'])
@handle_exceptions
def search_students():
    criteria = request.get_json() or {}
    result = StudentService.search_students(criteria)
    return jsonify({'data': result}) 
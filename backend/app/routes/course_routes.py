from flask import Blueprint, request, jsonify
from app.services.course_service import CourseService
from app.utils.decorators import handle_exceptions, admin_required, require_auth

course_bp = Blueprint('course', __name__)

@course_bp.route('/api/courses', methods=['GET'])
@handle_exceptions
def get_courses():
    courses = CourseService.get_courses()
    return jsonify({'data': courses})

@course_bp.route('/api/courses/<course_id>', methods=['GET'])
@handle_exceptions
def get_course(course_id):
    course = CourseService.get_course(course_id)
    return jsonify({'data': course})

@course_bp.route('/api/courses', methods=['POST'])
@handle_exceptions
@require_auth
@admin_required
def create_course():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    course = CourseService.create_course(data)
    return jsonify({'data': course}), 201

@course_bp.route('/api/courses/<course_id>', methods=['PUT'])
@handle_exceptions
@require_auth
@admin_required
def update_course(course_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    course = CourseService.update_course(course_id, data)
    return jsonify({'data': course})

@course_bp.route('/api/courses/<course_id>', methods=['DELETE'])
@handle_exceptions
@require_auth
@admin_required
def delete_course(course_id):
    result = CourseService.delete_course(course_id)
    return jsonify(result) 
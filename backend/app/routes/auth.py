from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.utils.decorators import handle_exceptions

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
@handle_exceptions
def login():
    data = request.get_json()
    result = AuthService.login(data)
    return jsonify(result)

@auth_bp.route('/api/auth/register', methods=['POST'])
@handle_exceptions
def register():
    data = request.get_json()
    result = AuthService.register(data)
    return jsonify(result) 
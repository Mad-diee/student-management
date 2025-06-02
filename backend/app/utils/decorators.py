from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import UserRole

def handle_exceptions(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({
                'error': str(e),
                'status': 'error'
            }), 400
        except Exception as e:
            return jsonify({
                'error': str(e),
                'status': 'error'
            }), 500
    return decorated_function

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        return f(*args, **kwargs)
    return decorated_function

def require_role(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user_role = UserRole.query.filter_by(user_id=user_id).first()
            
            if not user_role or user_role.role not in roles:
                return jsonify({
                    'error': 'Unauthorized access',
                    'status': 'error'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    return require_role(['admin'])(f)

def login_required(f):
    return require_auth(f) 
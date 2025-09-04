import base64
from functools import wraps
from flask import request, jsonify
from src.models.user_simple import User

def basic_auth_required(f):
    """Decorator to require Basic Authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Basic '):
            return jsonify({'error': 'Basic Authentication required'}), 401
        
        try:
            # Extract and decode credentials
            encoded_credentials = auth_header.split(' ')[1]
            decoded_credentials = base64.b64decode(encoded_credentials).decode('utf-8')
            username, password = decoded_credentials.split(':', 1)
            
            # Find user by username or email
            user = User.query.filter(
                (User.username == username) | 
                (User.email == username.lower())
            ).first()
            
            if not user or not user.check_password(password):
                return jsonify({'error': 'Invalid credentials'}), 401
            
            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 401
            
            # Pass user to the decorated function
            return f(user, *args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Invalid authentication format'}), 401
    
    return decorated_function

def get_basic_auth_user():
    """Extract user from Basic Authentication header"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Basic '):
        return None
    
    try:
        # Extract and decode credentials
        encoded_credentials = auth_header.split(' ')[1]
        decoded_credentials = base64.b64decode(encoded_credentials).decode('utf-8')
        username, password = decoded_credentials.split(':', 1)
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | 
            (User.email == username.lower())
        ).first()
        
        if user and user.check_password(password) and user.is_active:
            return user
        
        return None
        
    except Exception:
        return None

